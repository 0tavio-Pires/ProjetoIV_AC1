"""
main.py — a mesma API de eventos, agora consumível por um navegador.

Laboratório da Aula 09 — IBM4028, Projeto em Ciência de Dados IV.

Duas mudanças, ambas por causa do frontend:

    1. CORS — sem isso o navegador recusa a resposta antes de o seu
       código React ver qualquer coisa. O `requests.http` e o /docs
       nunca precisaram disso.
    2. SAS na resposta — o container é privado, então a URL crua não
       abre em um <img>. A API passa a devolver um link assinado.

Nenhuma rota mudou de caminho, de método ou de status code.

Para rodar:
    fastapi dev main.py
"""

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import storage
from database import Base, engine, get_db
from schemas import EventoCreate, EventoResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Eventos do Campus",
    description="Laboratório da Aula 09 — consumida por um frontend React",
    version="4.0.0",
)

# As origens que podem chamar esta API pelo navegador.
#
# O Vite sobe em 5173. localhost e 127.0.0.1 são a MESMA máquina e origens
# DIFERENTES para o navegador — por isso os dois estão na lista.
#
# Sobre usar ["*"]: funciona, é o que a maior parte dos tutoriais manda
# fazer, e significa "qualquer site do mundo pode chamar esta API pelo
# navegador do seu usuário". Enquanto a API é pública e só de leitura,
# o estrago é pequeno. No dia em que existir login, deixa de ser.
ORIGENS_PERMITIDAS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://thankful-hill-04a29570f.6.azurestaticapps.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENS_PERMITIDAS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXTENSAO_POR_TIPO = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

TAMANHO_MAXIMO_BYTES = 2 * 1024 * 1024  # 2 MB


def para_resposta(evento: models.Evento) -> EventoResponse:
    """
    Monta a resposta trocando a URL guardada por um link assinado.

    O banco continua guardando a URL permanente e sem assinatura. O SAS é
    gerado a cada resposta, com validade curta: um link que vale para
    sempre é uma chave pública que você não consegue revogar.

    É por isso que a API não devolve o objeto do banco direto. O schema de
    saída existe justamente para a resposta poder ser diferente da linha
    da tabela.
    """
    return EventoResponse(
        id=evento.id,
        nome=evento.nome,
        data=evento.data,
        local=evento.local,
        vagas=evento.vagas,
        cartaz_url=storage.url_com_sas(evento.cartaz_url) if evento.cartaz_url else None,
    )


@app.get("/")
async def raiz():
    return {"mensagem": "API de Eventos do Campus", "docs": "/docs"}


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    total = db.query(models.Evento).count()
    return {"status": "ok", "banco": "conectado", "eventos_cadastrados": total}


@app.get("/eventos", response_model=list[EventoResponse])
async def listar_eventos(db: Session = Depends(get_db)):
    return [para_resposta(e) for e in db.query(models.Evento).all()]


@app.post(
    "/eventos",
    response_model=EventoResponse,
    status_code=status.HTTP_201_CREATED,
)
async def criar_evento(evento: EventoCreate, db: Session = Depends(get_db)):
    novo = models.Evento(**evento.model_dump())

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return para_resposta(novo)


@app.get("/eventos/{evento_id}", response_model=EventoResponse)
async def buscar_evento(evento_id: int, db: Session = Depends(get_db)):
    evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()

    if evento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evento {evento_id} não encontrado",
        )

    return para_resposta(evento)


@app.post("/eventos/{evento_id}/cartaz", response_model=EventoResponse)
async def enviar_cartaz(
    evento_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Recebe a imagem, grava no Blob Storage e guarda a URL no evento."""
    evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()

    if evento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evento {evento_id} não encontrado",
        )

    if arquivo.content_type not in EXTENSAO_POR_TIPO:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Tipo {arquivo.content_type!r} não aceito. "
                f"Envie um dos seguintes: {', '.join(EXTENSAO_POR_TIPO)}"
            ),
        )

    conteudo = await arquivo.read()

    if len(conteudo) > TAMANHO_MAXIMO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Arquivo com {len(conteudo)} bytes; o limite é {TAMANHO_MAXIMO_BYTES}.",
        )

    url = storage.enviar_arquivo(
        nome_do_blob=storage.nome_do_cartaz(evento_id, EXTENSAO_POR_TIPO[arquivo.content_type]),
        conteudo=conteudo,
        content_type=arquivo.content_type,
    )

    evento.cartaz_url = url
    db.commit()
    db.refresh(evento)

    return para_resposta(evento)


@app.delete("/eventos/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_evento(evento_id: int, db: Session = Depends(get_db)):
    evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()

    if evento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evento {evento_id} não encontrado",
        )

    db.delete(evento)
    db.commit()
