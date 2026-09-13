/**
 * main.jsx — o ponto de entrada.
 *
 * Pega a div #root do index.html e entrega o controle dela para o React.
 * É a única vez em que falamos com o DOM diretamente.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./estilos.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
