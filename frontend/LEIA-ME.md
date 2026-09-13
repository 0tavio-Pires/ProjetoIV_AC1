# Aula 09 — frontend

Projeto Vite + React, sem biblioteca de UI. O CSS é o mínimo para a tela
ficar legível: o assunto da aula é integração, não design.

| Arquivo | O que é |
|---|---|
| `src/main.jsx` | O ponto de entrada — a única vez que falamos com o DOM |
| `src/App.jsx` | Dono do estado da lista e dos quatro estados da tela |
| `src/api.js` | O único arquivo que conhece a API e trata os erros dela |
| `src/ListaEventos.jsx` | Desenha carregando, erro, vazio e os cards |
| `src/FormularioEvento.jsx` | `POST /eventos` com campos controlados |
| `src/EnviarCartaz.jsx` | `POST /eventos/{id}/cartaz` com `FormData` |
| `src/estilos.css` | Estilo mínimo |

## Rodar

```bash
npm install
cp .env.example .env
npm run dev
```

O backend precisa estar rodando em paralelo, na porta 8000, com o
`CORSMiddleware` liberando `http://localhost:5173`.

## O que observar no código

- `api.js` é para o frontend o que `storage.py` é para o backend: a
  fronteira com o mundo de fora, isolada num arquivo só.
- Em `enviarCartaz`, o header `Content-Type` está deliberadamente ausente —
  quem monta o boundary do multipart é o navegador.
- `VITE_API_URL` evita repetir a URL. Ela **não** esconde nada: tudo o que
  está no `.env` do frontend vai para o bundle.
