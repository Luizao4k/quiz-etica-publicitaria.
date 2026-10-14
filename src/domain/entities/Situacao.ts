import type { Opcao } from "./Opcao";

/**
 * Representa uma situação apresentada ao participante do questionário.
 *
 * Cada situação contém um enunciado e suas alternativas de resposta.
 */
export interface Situacao {
  /** Identificador único da situação. */
  id: string;

  /** Número de ordem da situação no questionário. */
  numero: number;

  /** Título da situação. */
  titulo: string;

  /** Enunciado que descreve o cenário apresentado ao participante. */
  enunciado: string;

  /** Alternativas disponíveis para a situação. */
  opcoes: Opcao[];
}
