import { describe, expect, it } from "vitest";
import { RegistrarResposta } from "../../../quiz-etica-publicitaria/src/application/use_cases/RegistrarResposta";
import type { Situacao } from "../../../quiz-etica-publicitaria/src/domain/entities/Situacao";
import type { Opcao } from "../../../quiz-etica-publicitaria/src/domain/entities/Opcao";

function criarOpcao(id: string, perfilAlvo: string): Opcao {
  return {
    id,
    texto: `Texto da ${id}`,
    perfilAlvo,
  };
}

const opcaoA = criarOpcao("s1-a1", "ARCO_E_FLECHA");
const opcaoB = criarOpcao("s1-a2", "ESPELHO");
const opcaoOutraSituacao = criarOpcao("s2-a1", "BALANCA");

const situacao1: Situacao = {
  id: "s1",
  numero: 1,
  titulo: "Situação 1",
  enunciado: "Enunciado de teste.",
  opcoes: [opcaoA, opcaoB],
};

const situacao2: Situacao = {
  id: "s2",
  numero: 2,
  titulo: "Situação 2",
  enunciado: "Outro enunciado de teste.",
  opcoes: [opcaoOutraSituacao],
};

describe("RegistrarResposta", () => {
  it("deve registrar uma resposta válida", () => {
    const casoDeUso = new RegistrarResposta();

    casoDeUso.executar(situacao1, opcaoA);

    expect(casoDeUso.obterRespostas()).toEqual([opcaoA]);
    expect(casoDeUso.possuiResposta("s1")).toBe(true);
  });

  it("deve substituir a resposta anterior da mesma situação", () => {
    const casoDeUso = new RegistrarResposta();

    casoDeUso.executar(situacao1, opcaoA);
    casoDeUso.executar(situacao1, opcaoB);

    expect(casoDeUso.obterRespostas()).toEqual([opcaoB]);
    expect(casoDeUso.obterRespostas()).toHaveLength(1);
  });

  it("deve manter respostas de situações diferentes", () => {
    const casoDeUso = new RegistrarResposta();

    casoDeUso.executar(situacao1, opcaoA);
    casoDeUso.executar(situacao2, opcaoOutraSituacao);

    expect(casoDeUso.obterRespostas()).toEqual([
      opcaoA,
      opcaoOutraSituacao,
    ]);
  });

  it("deve rejeitar uma opção que não pertence à situação", () => {
    const casoDeUso = new RegistrarResposta();

    expect(() =>
      casoDeUso.executar(situacao1, opcaoOutraSituacao),
    ).toThrow(/não pertence à situação/i);
  });

  it("deve remover uma resposta existente", () => {
    const casoDeUso = new RegistrarResposta();

    casoDeUso.executar(situacao1, opcaoA);

    expect(casoDeUso.removerResposta("s1")).toBe(true);
    expect(casoDeUso.possuiResposta("s1")).toBe(false);
  });

  it("deve limpar todas as respostas", () => {
    const casoDeUso = new RegistrarResposta();

    casoDeUso.executar(situacao1, opcaoA);
    casoDeUso.executar(situacao2, opcaoOutraSituacao);
    casoDeUso.limpar();

    expect(casoDeUso.obterRespostas()).toEqual([]);
  });
});