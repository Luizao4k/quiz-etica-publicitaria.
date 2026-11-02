/**
 * Obra consultada para fundamentar uma expressão do conteúdo complementar.
 */
export interface Obra {
  /** Autor ou autores da obra, como devem ser apresentados. */
  autor: string;

  /** Título da obra. */
  titulo: string;
}

/**
 * Referência teórica associada a uma expressão dos tópicos de um perfil.
 *
 * A expressão é localizada no texto dos tópicos do perfil indicado e, quando
 * encontrada, aparece destacada para que o participante consulte as obras.
 */
export interface Referencia {
  /** Identificador único da referência. */
  id: string;

  /** Perfil cujos tópicos contêm a expressão. */
  perfilId: string;

  /** Expressão que recebe o destaque, escrita como aparece no texto. */
  expressao: string;

  /** Obras que fundamentam a expressão. */
  obras: Obra[];
}
