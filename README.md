# API de Eventos do Campus

Aplicação construída nos laboratórios da disciplina IBM4028 — Projeto em Ciência
de Dados IV (IBMEC – CDIA).

- **Backend:** FastAPI + SQLAlchemy, publicado no Azure App Service
- **Banco:** Azure SQL Database
- **Arquivos:** Azure Blob Storage (container privado, acesso via SAS)
- **Frontend:** React + Vite

## Estrutura

```
backend/     API FastAPI
frontend/    aplicação React que consome a API
```

## Rodando o backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/macOS
pip install -r requirements.txt
```

Copie `.env.example` para `.env` e preencha as variáveis. Depois:

```bash
fastapi dev main.py
```

A API sobe em http://127.0.0.1:8000 e a documentação em /docs.

## Rodando o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Copie `.env.example` para `.env` e ajuste `VITE_API_URL` se necessário.
O Vite sobe em http://localhost:5173.

## Rotas

| Método | Caminho | O que faz |
|---|---|---|
| GET | `/` | identificação da API |
| GET | `/health` | verifica se a aplicação e o banco respondem |
| GET | `/eventos` | lista os eventos |
| POST | `/eventos` | cria um evento (201) |
| GET | `/eventos/{id}` | busca um evento (404 se não existir) |
| DELETE | `/eventos/{id}` | remove um evento (204) |
| POST | `/eventos/{id}/cartaz` | envia a imagem do cartaz (415 / 413) |

## Variáveis de ambiente

| Nome | Para que serve |
|---|---|
| `DATABASE_URL` | endereço do banco; sem ela, usa SQLite local |
| `AZURE_STORAGE_CONNECTION_STRING` | acesso à conta de armazenamento |
| `AZURE_STORAGE_CONTAINER` | nome do container dos cartazes |

Nenhum segredo entra no repositório: o `.env` está no `.gitignore` e os mesmos
valores são configurados em Environment variables no App Service.
