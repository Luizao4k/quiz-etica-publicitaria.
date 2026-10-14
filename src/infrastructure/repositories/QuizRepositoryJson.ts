import dadosQuiz from "../../data/quiz-data.json";
import type { Quiz } from "../../domain/entities/Quiz";
import type { QuizRepository } from "./QuizRepository";

/**
 * Fornece os dados do questionário a partir do arquivo JSON.
 *
 * A infraestrutura é responsável por conhecer a origem dos dados.
 */
export class QuizRepositoryJson implements QuizRepository {
  /**
   * Retorna os perfis e as situações do questionário.
   *
   * @returns Dados completos do questionário.
   */
  obterQuiz(): Quiz {
    return dadosQuiz as Quiz;
  }
}