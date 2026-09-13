/**
 * FormularioEvento.jsx — cria um evento pelo POST /eventos.
 *
 * Campos controlados: o valor do input vem do estado e toda digitação
 * atualiza o estado. O React é a fonte da verdade, não o DOM.
 */

import { useState } from "react";

import { criarEvento } from "./api";

const VAZIO = { nome: "", data: "", local: "", vagas: "" };

export default function FormularioEvento({ aoCriar }) {
  const [campos, setCampos] = useState(VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  function alterar(evento) {
    const { name, value } = evento.target;

    // O nome do input vira a chave do objeto. Um handler só para todos
    // os campos, em vez de um por campo.
    setCampos((atual) => ({ ...atual, [name]: value }));
  }

  async function enviar(evento) {
    // Sem isso o navegador recarrega a página inteira ao submeter, que é
    // o comportamento padrão do formulário HTML desde sempre.
    evento.preventDefault();

    setEnviando(true);
    setErro(null);

    try {
      await criarEvento({
        nome: campos.nome,
        data: campos.data,
        local: campos.local,
        // O input devolve string mesmo com type="number"; o schema do
        // backend espera int.
        vagas: Number(campos.vagas),
      });

      setCampos(VAZIO);
      aoCriar();
    } catch (e) {
      // A mensagem aqui é a que o Pydantic escreveu no 422 — "vagas:
      // Input should be greater than or equal to 1", por exemplo. A
      // validação foi escrita uma vez, no backend, e aparece para o
      // usuário sem ser reescrita.
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2>Novo evento</h2>

      <div className="campos">
        <label>
          Nome
          <input name="nome" value={campos.nome} onChange={alterar} required />
        </label>

        <label>
          Data
          <input
            name="data"
            type="date"
            value={campos.data}
            onChange={alterar}
            required
          />
        </label>

        <label>
          Local
          <input name="local" value={campos.local} onChange={alterar} required />
        </label>

        <label>
          Vagas
          <input
            name="vagas"
            type="number"
            min="1"
            value={campos.vagas}
            onChange={alterar}
            required
          />
        </label>
      </div>

      {erro && <p className="erro-inline">{erro}</p>}

      <button type="submit" disabled={enviando}>
        {/* Desabilitar enquanto envia evita o clique duplo que cria o
            mesmo evento duas vezes. */}
        {enviando ? "Salvando…" : "Criar evento"}
      </button>
    </form>
  );
}
