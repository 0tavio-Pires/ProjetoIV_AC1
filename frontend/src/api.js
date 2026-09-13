/**
 * api.js — o único arquivo que conhece a API.
 *
 * É o mesmo raciocínio do storage.py no backend: isolar quem fala com o
 * mundo de fora. Os componentes chamam funções com nome de negócio
 * ("listarEventos") e não precisam saber nada sobre URL, método HTTP ou
 * formato de erro.
 */

// import.meta.env é como o Vite entrega as variáveis de ambiente. Só
// entram no bundle as que começam com VITE_ — e é bom que seja assim,
// porque tudo o que está aqui vai parar no navegador do usuário.
//
// NUNCA coloque segredo em variável de frontend. A connection string do
// storage, por exemplo, jamais entra aqui: ela fica no backend.
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/**
 * Traduz uma resposta com erro na mensagem que o backend escreveu.
 *
 * O FastAPI devolve { "detail": "..." } nos HTTPException e uma lista de
 * erros por campo no 422 do Pydantic. Vale aproveitar as duas: a validação
 * já foi escrita uma vez, do lado do servidor, e mostrar "erro ao salvar"
 * joga esse trabalho fora.
 */
async function mensagemDeErro(resposta) {
  let corpo;

  try {
    corpo = await resposta.json();
  } catch {
    return `Erro ${resposta.status} ao falar com a API.`;
  }

  if (typeof corpo.detail === "string") {
    return corpo.detail;
  }

  if (Array.isArray(corpo.detail)) {
    // 422: cada item traz o caminho do campo e o que está errado.
    return corpo.detail
      .map((erro) => `${erro.loc.at(-1)}: ${erro.msg}`)
      .join(" · ");
  }

  return `Erro ${resposta.status} ao falar com a API.`;
}

export async function listarEventos() {
  const resposta = await fetch(`${API_URL}/eventos`);

  if (!resposta.ok) {
    throw new Error(await mensagemDeErro(resposta));
  }

  return resposta.json();
}

export async function criarEvento(dados) {
  const resposta = await fetch(`${API_URL}/eventos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    throw new Error(await mensagemDeErro(resposta));
  }

  return resposta.json();
}

export async function enviarCartaz(eventoId, arquivo) {
  const dados = new FormData();
  dados.append("arquivo", arquivo);

  const resposta = await fetch(`${API_URL}/eventos/${eventoId}/cartaz`, {
    method: "POST",
    // Repare no que NÃO está aqui: o header Content-Type.
    //
    // Em multipart, o Content-Type precisa incluir um "boundary" gerado
    // na hora. Quem monta isso é o navegador, a partir do FormData. Se
    // você escrever o header na mão, o boundary vai faltar e o servidor
    // devolve 400 sem conseguir explicar direito o motivo.
    body: dados,
  });

  if (!resposta.ok) {
    throw new Error(await mensagemDeErro(resposta));
  }

  return resposta.json();
}
