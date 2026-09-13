# Aula 09 — backend

É o backend da Aula 08 com duas adições, ambas motivadas pelo frontend:

| Arquivo | O que mudou |
|---|---|
| `main.py` | `CORSMiddleware` e a função `para_resposta`, que assina a URL do cartaz |
| `storage.py` | a função `url_com_sas` |
| `models.py`, `schemas.py`, `database.py` | idênticos aos da Aula 08 |

## Rodar

```bash
pip install -r requirements.txt
fastapi dev main.py
```

O `.env` é o mesmo da Aula 08 — nenhuma variável nova.

Se você já tem um `eventos.db` da Aula 08, ele serve: o modelo não mudou.

## O que observar

- `ORIGENS_PERMITIDAS` lista `localhost` **e** `127.0.0.1`. São a mesma
  máquina e origens diferentes para o navegador.
- A URL sem assinatura continua no banco. O SAS é gerado a cada resposta,
  com validade de uma hora.
