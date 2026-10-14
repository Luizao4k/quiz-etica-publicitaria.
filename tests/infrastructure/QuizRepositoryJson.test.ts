
import { describe, expect, it } from "vitest";
import { QuizRepositoryJson } from "../../../quiz-etica-publicitaria/src/infrastructure/repositories/QuizRepositoryJson";

describe("QuizRepositoryJson", () => {
  const repositorio = new QuizRepositoryJson();

  it("deve carregar os quatro perfis de personalidade", () => {
    const quiz = repositorio.obterQuiz();

    expect(quiz.perfis).toHaveLength(4);
  });

  it("deve carregar as treze situações do questionário", () => {
    const quiz = repositorio.obterQuiz();

    expect(quiz.situacoes).toHaveLength(13);
  });

  it("deve fornecer quatro opções para cada situação", () => {
    const quiz = repositorio.obterQuiz();

    for (const situacao of quiz.situacoes) {
      expect(situacao.opcoes).toHaveLength(4);
    }
  });

  it("deve fornecer opções com os campos esperados", () => {
    const quiz = repositorio.obterQuiz();

    for (const situacao of quiz.situacoes) {
      for (const opcao of situacao.opcoes) {
        expect(opcao.id).toBeTruthy();
        expect(opcao.texto).toBeTruthy();
        expect(opcao.perfilAlvo).toBeTruthy();
      }
    }
  });
});
