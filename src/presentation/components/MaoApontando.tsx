/**
 * Mão apontando que orienta o participante a clicar na carta.
 *
 * É apenas decorativa: a instrução para leitores de tela está no botão de virar
 * a carta. As cores e a animação ficam em carta.css.
 */
export function MaoApontando() {
  return (
    <svg
      className="mao-apontando"
      viewBox="-4 -5 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="mao-onda" cx="8" cy="2" r="3.2" />

      <g className="mao-preenchimento">
        <rect x="6" y="2" width="4.3" height="14" rx="2" />
        <rect x="9.85" y="7" width="4.3" height="9" rx="2" />
        <rect x="13.85" y="8" width="4.3" height="9" rx="2" />
        <rect x="17.85" y="9" width="4.15" height="9" rx="2" />
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15Z" />
      </g>

      <g className="mao-contorno">
        <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
        <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
        <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </g>
    </svg>
  );
}
