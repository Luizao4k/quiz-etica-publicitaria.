import { afterEach, describe, expect, it, vi } from "vitest";
import { prepararTentativa } from "../../src/application/services/prepararTentativa";
import { QuizRepositoryJson } from "../../src/infrastructure/repositories/QuizRepositoryJson";

describe("prepararTentativa", () => {
  const quiz = new QuizRepositoryJson().obterQuiz();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve apresentar todas as situações exatamente uma vez (RN06)", () => {
    const tentativa = prepararTentativa(quiz);

    const idsOriginais = quiz.situacoes.map((situacao) => situacao.id).sort();
    const idsPreparados = tentativa.quiz.situacoes
      .map((situacao) => situacao.id)
      .sort();

    expect(tentativa.totalSituacoes).toBe(quiz.situacoes.length);
    expect(idsPreparados).toEqual(idsOriginais);
  });

  it("deve manter conteúdo, texto e perfil associado de situações e alternativas (RN04)", () => {
    const tentativa = prepararTentativa(quiz);

    for (const situacaoPreparada of tentativa.quiz.situacoes) {
      const original = quiz.situacoes.find(
        (situacao) => situacao.id === situacaoPreparada.id,
      );

      if (!original) {
        throw new Error(`A situação "${situacaoPreparada.id}" não existe no questionário original.`);
      }

      expect({ ...situacaoPreparada, opcoes: [] }).toEqual({
        ...original,
        opcoes: [],
      });
      expect(situacaoPreparada.opcoes).toHaveLength(original.opcoes.length);

      for (const opcao of situacaoPreparada.opcoes) {
        const opcaoOriginal = original.opcoes.find(
          (opcaoDisponivel) => opcaoDisponivel.id === opcao.id,
        );

        expect(opcao).toEqual(opcaoOriginal);
      }
    }
  });

  it("deve aplicar o embaralhamento às situações e às alternativas (RF06, RF07)", () => {
    // Com o sorteio fixo em zero, o embaralhamento sempre altera a ordem.
    vi.spyOn(Math, "random").mockReturnValue(0);

    const tentativa = prepararTentativa(quiz);

    expect(tentativa.quiz.situacoes.map((situacao) => situacao.id)).not.toEqual(
      quiz.situacoes.map((situacao) => situacao.id),
    );

    tentativa.quiz.situacoes.forEach((situacaoPreparada) => {
      const original = quiz.situacoes.find(
        (situacao) => situacao.id === situacaoPreparada.id,
      );

      expect(situacaoPreparada.opcoes.map((opcao) => opcao.id)).not.toEqual(
        original?.opcoes.map((opcao) => opcao.id),
      );
    });
  });

  it("não deve modificar os dados originais do questionário", () => {
    const antes = JSON.stringify(quiz);

    prepararTentativa(quiz);

    expect(JSON.stringify(quiz)).toBe(antes);
  });

  it("deve iniciar cada tentativa sem respostas e independente das anteriores (RN05)", () => {
    const primeira = prepararTentativa(quiz);
    const respondida = primeira.responder(primeira.situacaoAtual.opcoes[0].id);
    const segunda = prepararTentativa(quiz);

    expect(respondida.opcoesSelecionadas()).toHaveLength(1);
    expect(segunda.opcoesSelecionadas()).toHaveLength(0);
    expect(segunda.indiceAtual).toBe(0);
    expect(segunda.finalizada).toBe(false);
  });
});
