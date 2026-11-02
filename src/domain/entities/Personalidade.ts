import type { Detalhe } from "./Detalhe";

/**
 * Representa um perfil de personalidade do questionário de ética publicitária.
 *
 * Contém as informações apresentadas ao participante após o cálculo
 * das indicações recebidas durante o questionário.
 */
export interface Personalidade {
  /** Identificador único do perfil. */
  id: string;

  /** Nome principal apresentado para o perfil. */
  titulo: string;

  /** Texto complementar que resume o perfil. */
  subtitulo: string;

  /** Descrição detalhada das características do perfil. */
  descricao: string;

  /**
   * Tópicos complementares do perfil, na ordem de apresentação.
   * As expressões com referência teórica já vêm separadas em trechos.
   */
  detalhes: Detalhe[];
}
