import type { Personalidade } from "./Personalidade";
import type { Situacao } from "./Situacao";

/**
 * Representa o conjunto de dados necessários para executar o questionário.
 *
 * Reúne os perfis de personalidade apresentados no resultado e as
 * situações respondidas pelo participante.
 */
export interface Quiz {
  /** Perfis de personalidade disponíveis no questionário. */
  perfis: Personalidade[];

  /** Situações e alternativas que compõem o questionário. */
  situacoes: Situacao[];
}
