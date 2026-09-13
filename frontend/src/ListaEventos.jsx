/**
 * ListaEventos.jsx — mostra os eventos e trata os estados da busca.
 *
 * Este componente não busca nada: ele recebe tudo pronto por props. Isso
 * o torna previsível — dado o mesmo conjunto de props, ele sempre desenha
 * a mesma tela.
 */

import EnviarCartaz from "./EnviarCartaz";

export default function ListaEventos({
  eventos,
  carregando,
  erro,
  aoAtualizar,
  aoTentarDeNovo,
}) {
  // A ordem importa: carregando primeiro, erro depois, vazio em seguida,
  // dados por último. Cada return abaixo encerra a função.
  if (carregando) {
    return <p className="aviso">Carregando eventos…</p>;
  }

  if (erro) {
    return (
      <div className="aviso erro">
        <p>{erro}</p>
        <p className="dica">
          O backend está rodando? Se o erro no console mencionar CORS, a
          origem deste site não está na lista do <code>CORSMiddleware</code>.
        </p>
        <button onClick={aoTentarDeNovo}>Tentar de novo</button>
      </div>
    );
  }

  if (eventos.length === 0) {
    // Estado vazio não é a mesma coisa que erro. Aqui deu tudo certo — só
    // não há nada cadastrado ainda, e a tela precisa dizer isso.
    return <p className="aviso">Nenhum evento cadastrado ainda.</p>;
  }

  return (
    <ul className="lista">
      {eventos.map((evento) => (
        // A prop `key` não é enfeite: é como o React sabe qual item é
        // qual entre um render e o outro. Sem ela, ele reaproveita os
        // elementos errados e o estado interno vaza de um card para o
        // outro. Use o id do banco, nunca o índice do array.
        <li key={evento.id} className="card">
          {evento.cartaz_url ? (
            <img
              className="cartaz"
              src={evento.cartaz_url}
              alt={`Cartaz do evento ${evento.nome}`}
            />
          ) : (
            <div className="cartaz vazio">sem cartaz</div>
          )}

          <div className="conteudo">
            <h2>{evento.nome}</h2>
            <p className="meta">
              {/* A data chega como "2026-09-12". new Date() nessa string
                  interpreta como UTC e pode voltar um dia em fuso
                  negativo — por isso formatamos a partir das partes. */}
              {evento.data.split("-").reverse().join("/")} · {evento.local}
            </p>
            <p className="meta">{evento.vagas} vagas</p>

            <EnviarCartaz eventoId={evento.id} aoEnviar={aoAtualizar} />
          </div>
        </li>
      ))}
    </ul>
  );
}
