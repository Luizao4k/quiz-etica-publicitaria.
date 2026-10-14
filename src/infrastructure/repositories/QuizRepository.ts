import type { Quiz } from "../../domain/entities/Quiz";

/**
 * Define as operações disponíveis para obter os dados do questionário.
 *
 * A implementação pode utilizar JSON, API ou banco de dados,
 * sem exigir mudanças no contrato.
 */
export interface QuizRepository {
  /**
   * Obtém os dados completos do questionário.
   *
   * @returns Perfis e situações disponíveis.
   */
  obterQuiz(): Quiz;
}