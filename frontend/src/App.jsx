/**
 * App.jsx — o componente de cima, dono do estado da lista.
 *
 * A lista de eventos mora aqui, e não dentro de ListaEventos, porque o
 * formulário também precisa mexer nela: ao criar um evento, a lista tem
 * que se atualizar. Estado compartilhado por dois componentes sobe para o
 * pai comum dos dois.
 */

import { useCallback, useEffect, useState } from "react";

import { listarEventos } from "./api";
import FormularioEvento from "./FormularioEvento";
import ListaEventos from "./ListaEventos";

export default function App() {
  // Os três estados que toda tela que fala com API precisa ter.
  // Esquecer qualquer um deles produz a tela em branco que o usuário
  // não sabe interpretar.
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // useCallback mantém a mesma função entre renders. Sem isso, a função
  // seria nova a cada render e o useEffect abaixo rodaria em loop.
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      setEventos(await listarEventos());
    } catch (e) {
      setErro(e.message);
    } finally {
      // finally, não no fim do try: se der erro, o "carregando" também
      // precisa terminar. É o mesmo raciocínio do finally que fecha a
      // sessão do banco no backend.
      setCarregando(false);
    }
  }, []);

  // O array de dependências no fim é o que define QUANDO o efeito roda.
  // [carregar] significa "quando a função mudar" — e ela não muda.
  // Resultado: roda uma vez, ao montar.
  //
  // Se você esquecer o array, o efeito roda a cada render, e como ele
  // muda o estado, provoca outro render. É o loop infinito clássico:
  // a aba trava e a sua API leva centenas de requisições.
  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <main>
      <header>
        <h1>Eventos do Campus</h1>
        <p className="subtitulo">
          IBM4028 — a mesma API das aulas anteriores, agora com uma tela.
        </p>
      </header>

      <FormularioEvento aoCriar={carregar} />

      <ListaEventos
        eventos={eventos}
        carregando={carregando}
        erro={erro}
        aoAtualizar={carregar}
        aoTentarDeNovo={carregar}
      />
    </main>
  );
}
