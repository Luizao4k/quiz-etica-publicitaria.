import type { Referencia } from "./Referencia";

/**
 * Parte de um tópico complementar.
 *
 * Quando possui `referencia`, o trecho é uma expressão destacada, cuja
 * referência teórica pode ser consultada pelo participante.
 */
export interface TrechoDetalhe {
  /** Texto do trecho, exatamente como aparece no tópico. */
  texto: string;

  /** Referência associada à expressão, quando o trecho é um destaque. */
  referencia?: Referencia;
}

/**
 * Tópico complementar de um perfil, exibido na leitura "Leia mais".
 */
export interface Detalhe {
  /** Texto completo do tópico, sem marcações. */
  texto: string;

  /** O mesmo texto dividido em trechos; juntos, recompõem o tópico. */
  trechos: TrechoDetalhe[];
}
