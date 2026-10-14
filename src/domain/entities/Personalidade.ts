
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

  /** Lista de características e informações complementares do perfil. */
  detalhes: string[];
}
