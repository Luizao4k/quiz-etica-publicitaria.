
/**
 * Representa uma alternativa disponível em uma situação do questionário.
 *
 * Cada opção contém um texto apresentado ao participante e identifica
 * a personalidade que receberá uma indicação caso ela seja selecionada.
 */
export interface Opcao {
  /** Identificador único da opção. */
  id: string;

  /** Texto apresentado ao participante como alternativa de resposta. */
  texto: string;

  /** Identificador da personalidade associada à opção selecionada. */
  perfilAlvo: string;
}
