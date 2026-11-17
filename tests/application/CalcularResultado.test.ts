import { describe, expect, it } from "vitest";
import { CalcularResultado } from "../../src/application/use_cases/CalcularResultado";
import type { Personalidade } from "../../src/domain/entities/Personalidade";
import type { Opcao } from "../../src/domain/entities/Opcao";
import type { Situacao } from "../../src/domain/entities/Situacao";

const PERFIS: Personalidade[] = [
  {
    id: "ARCO_E_FLECHA",
    titulo: "Carta Arco e Flecha",
    subtitulo: "Seu Perfil é de Execução",
    descricao: "Descrição de teste.",
    detalhes: [],
  },
  {
    id: "ESPELHO",
    titulo: "Carta Espelho",
    subtitulo: "Seu Perfil é de Reflexão",
    descricao: "Descrição de teste.",
    detalhes: [],
  },
  {
    id: "BALANCA",
    titulo: "Carta Balança",
    subtitulo: "Seu Perfil é de Equilíbrio",
    descricao: "Descrição de teste.",
    detalhes: [],
  },
  {
    id: "ESPADA",
    titulo: "Carta Espada",
    subtitulo: "Seu Perfil é de Combatividade",
    descricao: "Descrição de teste.",
    detalhes: [],
  },
];

/**
 * Monta situações e opções para simular respostas.
 *
 * Cada resposta representa o ID do perfil escolhido
 * em uma situação.
 */
function montarCenario(
  respostas: string[],
  idsSituacoes?: string[],
): {
  situacoes: Situacao[];
  opcoesSelecionadas: Opcao[];
} {
  const situacoes = respostas.map((_, indice) => {
    const situacaoId = idsSituacoes?.[indice] ?? `normal-${indice + 1}`;

    const opcoes: Opcao[] = PERFIS.map((perfil) => ({
      id: `${situacaoId}-${perfil.id}`,
      texto: `Opção ${perfil.id}`,
      perfilAlvo: perfil.id,
    }));

    return {
      id: situacaoId,
      numero: indice + 1,
      titulo: `Situação ${indice + 1}`,
      enunciado: "Enunciado de teste.",
      opcoes,
    };
  });

  const opcoesSelecionadas = situacoes.map((situacao, indice) => {
    const perfilEscolhido = respostas[indice];

    const opcao = situacao.opcoes.find(
      (item) => item.perfilAlvo === perfilEscolhido,
    );

    if (!opcao) {
      throw new Error(`Perfil não encontrado: ${perfilEscolhido}`);
    }

    return opcao;
  });

  return {
    situacoes,
    opcoesSelecionadas,
  };
}

const calcularResultado = new CalcularResultado();

describe("CalcularResultado", () => {
  describe("Pontuação", () => {
    it("deve atribuir 1 ponto por resposta nas situações normais", () => {
      const respostas = Array(13).fill("ARCO_E_FLECHA");

      const { situacoes, opcoesSelecionadas } =
        montarCenario(respostas, [
          "s1",
          "s2",
          "s3",
          "s4",
          "s5",
          "s6",
          "s7",
          "s9",
          "s12",
          "s13",
          "normal-11",
          "normal-12",
          "normal-13",
        ]);

      const resultado = calcularResultado.executar(
        PERFIS,
        situacoes,
        opcoesSelecionadas,
      );

      const pontuacaoArco = resultado.pontuacoes.find(
        (item) => item.personalidade.id === "ARCO_E_FLECHA",
      );

      expect(pontuacaoArco?.indicacoes).toBe(13);
      expect(resultado.maiorPontuacao).toBe(13);
    });

    it("deve atribuir 2 pontos a ESPELHO nas situações ponderadas", () => {
      const idsSituacoes = [
        "s1", "s2", "s3", "s4", "s5", "s6", "s7",
        "s8", "s9", "s10", "s11", "s12", "s13",
      ];

      const respostas = Array(13).fill("ESPELHO");

      const { situacoes, opcoesSelecionadas } =
        montarCenario(respostas, idsSituacoes);

      const resultado = calcularResultado.executar(
        PERFIS,
        situacoes,
        opcoesSelecionadas,
      );

      const pontuacaoEspelho = resultado.pontuacoes.find(
        (item) => item.personalidade.id === "ESPELHO",
      );

      expect(pontuacaoEspelho?.indicacoes).toBe(16);
      expect(resultado.maiorPontuacao).toBe(16);
    });

    it("deve atribuir 2 pontos a ESPADA nas situações ponderadas", () => {
      const idsSituacoes = [
        "s1", "s2", "s3", "s4", "s5", "s6", "s7",
        "s8", "s9", "s10", "s11", "s12", "s13",
      ];

      const respostas = Array(13).fill("ESPADA");

      const { situacoes, opcoesSelecionadas } =
        montarCenario(respostas, idsSituacoes);

      const resultado = calcularResultado.executar(
        PERFIS,
        situacoes,
        opcoesSelecionadas,
      );

      const pontuacaoEspada = resultado.pontuacoes.find(
        (item) => item.personalidade.id === "ESPADA",
      );

      expect(pontuacaoEspada?.indicacoes).toBe(16);
    });
  });

  describe("Desempates", () => {
    const casosDesempate: {
      descricao: string;
      empatados: string[];
      vencedor: string;
    }[] = [
      {
        descricao: "empate A + B deve escolher A",
        empatados: ["ARCO_E_FLECHA", "ESPELHO"],
        vencedor: "ARCO_E_FLECHA",
      },
      {
        descricao: "empate A + C deve escolher C",
        empatados: ["ARCO_E_FLECHA", "BALANCA"],
        vencedor: "BALANCA",
      },
      {
        descricao: "empate A + D deve escolher C",
        empatados: ["ARCO_E_FLECHA", "ESPADA"],
        vencedor: "BALANCA",
      },
      {
        descricao: "empate B + C deve escolher C",
        empatados: ["ESPELHO", "BALANCA"],
        vencedor: "BALANCA",
      },
      {
        descricao: "empate B + D deve escolher C",
        empatados: ["ESPELHO", "ESPADA"],
        vencedor: "BALANCA",
      },
      {
        descricao: "empate C + D deve escolher D",
        empatados: ["BALANCA", "ESPADA"],
        vencedor: "ESPADA",
      },
      {
        descricao: "empate A + B + C deve escolher C",
        empatados: ["ARCO_E_FLECHA", "ESPELHO", "BALANCA"],
        vencedor: "BALANCA",
      },
      {
        descricao: "empate A + B + D deve escolher C",
        empatados: ["ARCO_E_FLECHA", "ESPELHO", "ESPADA"],
        vencedor: "BALANCA",
      },
      {
        descricao: "empate A + C + D deve escolher C",
        empatados: ["ARCO_E_FLECHA", "BALANCA", "ESPADA"],
        vencedor: "BALANCA",
      },
      {
        descricao: "empate B + C + D deve escolher D",
        empatados: ["ESPELHO", "BALANCA", "ESPADA"],
        vencedor: "ESPADA",
      },
      {
        descricao: "empate A + B + C + D deve escolher C",
        empatados: [
          "ARCO_E_FLECHA",
          "ESPELHO",
          "BALANCA",
          "ESPADA",
        ],
        vencedor: "BALANCA",
      },
    ];

    it.each(casosDesempate)(
      "$descricao",
      ({ empatados, vencedor }) => {
        // Distribui igualmente 12 respostas entre os perfis empatados.
        const quantidadePorPerfil = 12 / empatados.length;

        const respostas = empatados.flatMap((perfil) =>
          Array(quantidadePorPerfil).fill(perfil),
        );

        const { situacoes, opcoesSelecionadas } =
          montarCenario(respostas);

        const resultado = calcularResultado.executar(
          PERFIS,
          situacoes,
          opcoesSelecionadas,
        );

        expect(resultado.perfisMaisIndicados).toHaveLength(1);
        expect(resultado.perfisMaisIndicados[0].id).toBe(vencedor);
      },
    );
  });
});