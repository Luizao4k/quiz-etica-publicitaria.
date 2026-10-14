
import type { Quiz } from "../../domain/entities/Quiz";
import type { QuizRepository } from "../../infrastructure/repositories/QuizRepository";

/**
 * Coordena o carregamento dos dados necessários para iniciar o quiz.
 *
 * O caso de uso depende do contrato do repositório, não de sua
 * implementação concreta.
 */
export class CarregarQuiz {
  private readonly repositorio: QuizRepository;

  /**
   * Recebe o repositório responsável por fornecer os dados.
   *
   * @param repositorio - Fonte dos dados do questionário.
   */
  constructor(repositorio: QuizRepository) {
    this.repositorio = repositorio;
  }

  /**
   * Carrega os perfis e as situações do questionário.
   *
   * @returns Dados necessários para iniciar o quiz.
   */
  executar(): Quiz {
    return this.repositorio.obterQuiz();
  }
}
