
import { describe, expect, it, vi } from "vitest";
import { CarregarQuiz} from "../../../quiz-etica-publicitaria/src/application/use_cases/CarregarQuiz";
import type { QuizRepository } from "../../../quiz-etica-publicitaria/src/infrastructure/repositories/QuizRepository";
import type { Quiz } from "../../../quiz-etica-publicitaria/src/domain/entities/Quiz";

describe("CarregarQuiz", () => {
  it("deve retornar os dados fornecidos pelo repositório", () => {
    const quizEsperado: Quiz = {
      perfis: [],
      situacoes: [],
    };

    const repositorio: QuizRepository = {
      obterQuiz: vi.fn().mockReturnValue(quizEsperado),
    };

    const casoDeUso = new CarregarQuiz(repositorio);

    const resultado = casoDeUso.executar();

    expect(resultado).toBe(quizEsperado);
    expect(repositorio.obterQuiz).toHaveBeenCalledOnce();
  });
});
