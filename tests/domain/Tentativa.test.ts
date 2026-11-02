import { describe, expect, it } from "vitest";
import { CalcularResultado } from "../../src/application/use_cases/CalcularResultado";
import type { Opcao } from "../../src/domain/entities/Opcao";
import type { Personalidade } from "../../src/domain/entities/Personalidade";
import type { Quiz } from "../../src/domain/entities/Quiz";
import type { Situacao } from "../../src/domain/entities/Situacao";
import { Tentativa } from "../../src/domain/entities/Tentativa";

function criarPerfil(id: string): Personalidade {
  return {
    id,
    titulo: `Carta ${id}`,
    subtitulo: `Perfil ${id}`,
    descricao: "Descrição de teste.",
    detalhes: [],
  };
}

function criarSituacao(numero: number): Situacao {
  return {
    id: `s${numero}`,
    numero,
    titulo: `Situação ${numero}`,
    enunciado: "Enunciado de teste.",
    opcoes: [
      { id: `s${numero}-a`, texto: "Alternativa A", perfilAlvo: "ESPELHO" },
      { id: `s${numero}-b`, texto: "Alternativa B", perfilAlvo: "BALANCA" },
    ],
  };
}

function criarQuiz(): Quiz {
  return {
    perfis: [criarPerfil("ESPELHO"), criarPerfil("BALANCA")],
    situacoes: [criarSituacao(1), criarSituacao(2), criarSituacao(3)],
  };
}

/** Responde a situação atual e avança, como faz o avanço automático da interface. */
function responderEAvancar(tentativa: Tentativa, opcaoId: string): Tentativa {
  return tentativa.responder(opcaoId).avancar();
}

/** Responde todas as situações escolhendo, em cada uma, a opção do perfil indicado. */
function responderPorPerfil(tentativa: Tentativa, perfis: string[]): Tentativa {
  let atual = tentativa;

  for (const perfil of perfis) {
    const opcao = atual.situacaoAtual.opcoes.find(
      (opcaoDisponivel) => opcaoDisponivel.perfilAlvo === perfil,
    );

    if (!opcao) {
      throw new Error(`Situação sem opção para o perfil ${perfil}.`);
    }

    atual = responderEAvancar(atual, opcao.id);
  }

  return atual;
}

/** Responde cada situação, na ordem apresentada, com as opções de identificadores informados. */
function responderPorIds(tentativa: Tentativa, opcoesIds: string[]): Tentativa {
  return opcoesIds.reduce(
    (atual, opcaoId) => responderEAvancar(atual, opcaoId),
    tentativa,
  );
}

/** Indicações por perfil, calculadas pelo mesmo caso de uso usado pela aplicação. */
function pontuacoesDe(tentativa: Tentativa): Record<string, number> {
  const resultado = new CalcularResultado().executar(
    tentativa.quiz.perfis,
    tentativa.opcoesSelecionadas(),
  );

  return Object.fromEntries(
    resultado.pontuacoes.map(({ personalidade, indicacoes }) => [
      personalidade.id,
      indicacoes,
    ]),
  );
}

describe("Tentativa", () => {
  describe("iniciar", () => {
    it("deve começar na primeira situação, sem respostas e sem estar finalizada", () => {
      const tentativa = Tentativa.iniciar(criarQuiz());

      expect(tentativa.indiceAtual).toBe(0);
      expect(tentativa.totalSituacoes).toBe(3);
      expect(tentativa.situacaoAtual.id).toBe("s1");
      expect(tentativa.situacaoAtualRespondida).toBe(false);
      expect(tentativa.opcoesSelecionadas()).toHaveLength(0);
      expect(tentativa.finalizada).toBe(false);
    });

    it("deve rejeitar um questionário sem situações", () => {
      const quiz: Quiz = { ...criarQuiz(), situacoes: [] };

      expect(() => Tentativa.iniciar(quiz)).toThrow(/não possui situações/i);
    });

    it("deve rejeitar situações com identificadores repetidos", () => {
      const quiz: Quiz = {
        ...criarQuiz(),
        situacoes: [criarSituacao(1), criarSituacao(1)],
      };

      expect(() => Tentativa.iniciar(quiz)).toThrow(/identificadores repetidos/i);
    });
  });

  describe("responder", () => {
    it("deve registrar a resposta da situação atual por identificador", () => {
      const tentativa = Tentativa.iniciar(criarQuiz()).responder("s1-b");

      expect(tentativa.situacaoAtualRespondida).toBe(true);
      expect(tentativa.respostaAtual?.id).toBe("s1-b");
      expect(tentativa.respostaAtual?.perfilAlvo).toBe("BALANCA");
      expect(tentativa.podeResponder).toBe(false);
    });

    it("deve manter a posição ao responder, deixando o avanço para outra operação", () => {
      const tentativa = Tentativa.iniciar(criarQuiz()).responder("s1-a");

      expect(tentativa.indiceAtual).toBe(0);
      expect(tentativa.situacaoAtual.id).toBe("s1");
      expect(tentativa.podeAvancar).toBe(true);
    });

    it("deve rejeitar uma opção que não pertence à situação atual", () => {
      const tentativa = Tentativa.iniciar(criarQuiz());

      expect(() => tentativa.responder("s2-a")).toThrow(/não pertence à situação/i);
      expect(() => tentativa.responder("inexistente")).toThrow(
        /não pertence à situação/i,
      );
    });

    it("não deve permitir alterar uma resposta já registrada (RN01)", () => {
      const tentativa = Tentativa.iniciar(criarQuiz()).responder("s1-a");

      expect(() => tentativa.responder("s1-b")).toThrow(/não pode ser alterada/i);
      expect(() => tentativa.responder("s1-a")).toThrow(/não pode ser alterada/i);
      expect(tentativa.respostaAtual?.id).toBe("s1-a");
    });

    it("não deve alterar a tentativa original", () => {
      const original = Tentativa.iniciar(criarQuiz());
      const respondida = original.responder("s1-a");

      expect(original.situacaoAtualRespondida).toBe(false);
      expect(original.opcoesSelecionadas()).toHaveLength(0);
      expect(respondida.opcoesSelecionadas()).toHaveLength(1);
    });
  });

  describe("avancar", () => {
    it("deve exigir resposta antes de avançar", () => {
      const tentativa = Tentativa.iniciar(criarQuiz());

      expect(tentativa.podeAvancar).toBe(false);
      expect(() => tentativa.avancar()).toThrow(/antes de avançar/i);
    });

    it("deve seguir a sequência normal das situações", () => {
      let tentativa = Tentativa.iniciar(criarQuiz());

      tentativa = responderEAvancar(tentativa, "s1-a");
      expect(tentativa.situacaoAtual.id).toBe("s2");
      expect(tentativa.indiceAtual).toBe(1);

      tentativa = responderEAvancar(tentativa, "s2-b");
      expect(tentativa.situacaoAtual.id).toBe("s3");
      expect(tentativa.ultimaSituacao).toBe(true);
      expect(tentativa.finalizada).toBe(false);
    });

    it("deve finalizar ao avançar a partir da última situação respondida", () => {
      const tentativa = responderPorPerfil(Tentativa.iniciar(criarQuiz()), [
        "ESPELHO",
        "BALANCA",
        "ESPELHO",
      ]);

      expect(tentativa.finalizada).toBe(true);
      expect(tentativa.indiceAtual).toBe(2);
      expect(tentativa.opcoesSelecionadas()).toHaveLength(3);
    });

    it("deve rejeitar qualquer operação depois de finalizada", () => {
      const tentativa = responderPorPerfil(Tentativa.iniciar(criarQuiz()), [
        "ESPELHO",
        "ESPELHO",
        "ESPELHO",
      ]);

      expect(tentativa.podeResponder).toBe(false);
      expect(tentativa.podeAvancar).toBe(false);
      expect(tentativa.podeVoltar).toBe(false);
      expect(() => tentativa.responder("s3-a")).toThrow(/já foi finalizada/i);
      expect(() => tentativa.avancar()).toThrow(/já foi finalizada/i);
      expect(() => tentativa.voltar()).toThrow(/já foi finalizada/i);
    });
  });

  describe("voltar e consulta de respostas", () => {
    it("não deve permitir voltar na primeira situação", () => {
      const tentativa = Tentativa.iniciar(criarQuiz());

      expect(tentativa.podeVoltar).toBe(false);
      expect(() => tentativa.voltar()).toThrow(/não há situação anterior/i);
    });

    it("deve permitir voltar a partir de uma situação ainda não respondida", () => {
      const tentativa = responderEAvancar(Tentativa.iniciar(criarQuiz()), "s1-a");

      expect(tentativa.situacaoAtualRespondida).toBe(false);
      expect(tentativa.podeVoltar).toBe(true);
      expect(tentativa.voltar().situacaoAtual.id).toBe("s1");
    });

    it("deve voltar à situação imediatamente anterior mantendo a resposta registrada", () => {
      let tentativa = Tentativa.iniciar(criarQuiz());
      tentativa = responderEAvancar(tentativa, "s1-b");
      tentativa = responderEAvancar(tentativa, "s2-a");

      const consulta = tentativa.voltar();

      expect(consulta.situacaoAtual.id).toBe("s2");
      expect(consulta.respostaAtual?.id).toBe("s2-a");

      const consultaAnterior = consulta.voltar();

      expect(consultaAnterior.situacaoAtual.id).toBe("s1");
      expect(consultaAnterior.respostaAtual?.id).toBe("s1-b");
    });

    it("deve bloquear novas respostas em situação já respondida durante a consulta", () => {
      const consulta = responderEAvancar(
        Tentativa.iniciar(criarQuiz()),
        "s1-a",
      ).voltar();

      expect(consulta.podeResponder).toBe(false);
      expect(() => consulta.responder("s1-b")).toThrow(/não pode ser alterada/i);
      expect(consulta.respostaAtual?.id).toBe("s1-a");
    });

    it("deve exigir avanço explícito na consulta e liberar a resposta na primeira situação ainda não respondida", () => {
      let tentativa = Tentativa.iniciar(criarQuiz());
      tentativa = responderEAvancar(tentativa, "s1-a");
      tentativa = responderEAvancar(tentativa, "s2-b");

      // Consulta: s3 ainda não foi respondida; voltar duas vezes leva até s1.
      const emConsulta = tentativa.voltar().voltar();

      expect(emConsulta.situacaoAtual.id).toBe("s1");
      expect(emConsulta.podeAvancar).toBe(true);

      const emS2 = emConsulta.avancar();

      expect(emS2.situacaoAtual.id).toBe("s2");
      expect(emS2.podeResponder).toBe(false);

      const emS3 = emS2.avancar();

      expect(emS3.situacaoAtual.id).toBe("s3");
      expect(emS3.situacaoAtualRespondida).toBe(false);
      expect(emS3.podeResponder).toBe(true);
      expect(emS3.podeAvancar).toBe(false);
    });

    it("deve encerrar ao avançar a partir da última situação já respondida", () => {
      const ultimaRespondida = responderEAvancar(
        Tentativa.iniciar(criarQuiz()),
        "s1-a",
      );
      const naUltima = responderEAvancar(ultimaRespondida, "s2-a").responder(
        "s3-a",
      );

      expect(naUltima.ultimaSituacao).toBe(true);
      expect(naUltima.finalizada).toBe(false);
      expect(naUltima.podeAvancar).toBe(true);
      expect(naUltima.avancar().finalizada).toBe(true);
    });
  });

  describe("opções selecionadas e resultado", () => {
    it("deve listar as opções escolhidas na ordem de apresentação das situações", () => {
      let tentativa = Tentativa.iniciar(criarQuiz());
      tentativa = responderEAvancar(tentativa, "s1-b");
      tentativa = responderEAvancar(tentativa, "s2-a");

      const ids = tentativa.opcoesSelecionadas().map((opcao: Opcao) => opcao.id);

      expect(ids).toEqual(["s1-b", "s2-a"]);
    });

    it("não deve alterar respostas nem resultado ao consultar situações anteriores (RF01, RN01)", () => {
      const perfis = ["ESPELHO", "ESPELHO", "BALANCA"];
      const semConsulta = responderPorPerfil(Tentativa.iniciar(criarQuiz()), perfis);

      // Mesma sequência de respostas, mas indo e voltando antes de concluir.
      let tentativa = Tentativa.iniciar(criarQuiz());
      tentativa = responderEAvancar(tentativa, "s1-a");
      tentativa = responderEAvancar(tentativa, "s2-a");
      tentativa = tentativa.voltar().voltar().avancar().avancar();
      tentativa = responderEAvancar(tentativa, "s3-b");

      expect(tentativa.finalizada).toBe(true);
      expect(tentativa.opcoesSelecionadas().map((opcao) => opcao.id)).toEqual(
        semConsulta.opcoesSelecionadas().map((opcao) => opcao.id),
      );
      expect(pontuacoesDe(tentativa)).toEqual(pontuacoesDe(semConsulta));
    });

    it("deve calcular o mesmo resultado independentemente da ordem de apresentação (RN04)", () => {
      const quiz = criarQuiz();
      const invertido: Quiz = {
        ...quiz,
        situacoes: [...quiz.situacoes].reverse().map((situacao) => ({
          ...situacao,
          opcoes: [...situacao.opcoes].reverse(),
        })),
      };

      // As posições realmente mudam: s3 vem primeiro e as opções estão invertidas.
      expect(invertido.situacoes[0].id).toBe("s3");
      expect(invertido.situacoes[0].opcoes[0].id).toBe("s3-b");

      // O participante escolhe as mesmas alternativas (por identificador),
      // apresentadas em outra ordem.
      const naOrdemOriginal = responderPorIds(Tentativa.iniciar(quiz), [
        "s1-a",
        "s2-a",
        "s3-b",
      ]);
      const naOrdemInvertida = responderPorIds(Tentativa.iniciar(invertido), [
        "s3-b",
        "s2-a",
        "s1-a",
      ]);

      expect(pontuacoesDe(naOrdemOriginal)).toEqual({ ESPELHO: 2, BALANCA: 1 });
      expect(pontuacoesDe(naOrdemInvertida)).toEqual({ ESPELHO: 2, BALANCA: 1 });
    });
  });
});
