/**
 * EnviarCartaz.jsx — envia a imagem para POST /eventos/{id}/cartaz.
 *
 * O input de arquivo é o único que NÃO é controlado. O navegador não
 * deixa o código definir o valor de um <input type="file"> — seria uma
 * brecha óbvia: qualquer site poderia enviar arquivos da sua máquina sem
 * você escolher nada.
 */

import { useRef, useState } from "react";

import { enviarCartaz } from "./api";

export default function EnviarCartaz({ eventoId, aoEnviar }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function selecionou(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    setEnviando(true);
    setErro(null);

    try {
      await enviarCartaz(eventoId, arquivo);

      // Limpa o input para que escolher o MESMO arquivo de novo volte a
      // disparar o onChange. Sem isso, a segunda tentativa não acontece.
      if (inputRef.current) inputRef.current.value = "";

      aoEnviar();
    } catch (e) {
      // Aqui aparecem os 415 e 413 do backend, com a mensagem que ele
      // escreveu. O usuário descobre por que o arquivo foi recusado.
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="upload">
      <label className="botao-arquivo">
        {enviando ? "Enviando…" : "Trocar cartaz"}
        <input
          ref={inputRef}
          type="file"
          // accept é uma conveniência do seletor de arquivos, não uma
          // validação: o usuário pode escolher "todos os arquivos". Quem
          // valida de verdade é o backend.
          accept="image/png, image/jpeg, image/webp"
          onChange={selecionou}
          disabled={enviando}
        />
      </label>

      {erro && <p className="erro-inline">{erro}</p>}
    </div>
  );
}
