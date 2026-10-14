import { describe, expect, it } from "vitest";
import { CalcularResultado } from "../../../quiz-etica-publicitaria/src/application/use_cases/CalcularResultado";
import { Personalidade } from "../../../quiz-etica-publicitaria/src/domain/entities/Personalidade";
import { Opcao } from "../../../quiz-etica-publicitaria/src/domain/entities/Opcao";

const perfis: Personalidade[] = [
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
    subtitulo: "Seu Perfil é de Autoconfiança",
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
    subtitulo: "Seu Perfil é de Justiça",
    descricao: "Descrição de teste.",
    detalhes: [],
  },
];

function criarOpcao(id: string, perfilAlvo: string): Opcao {
  return {
    id,
    texto: "Opção de teste",
    perfilAlvo,
  };
}

describe("CalcularResultado", () => {
  const casoDeUso = new CalcularResultado();

  it("deve iniciar todos os perfis com zero indicações", () => {
    const resultado = casoDeUso.executar(perfis, []);

    expect(resultado.pontuacoes).toHaveLength(4);
    expect(resultado.pontuacoes.every(
      (pontuacao) => pontuacao.indicacoes === 0,
    )).toBe(true);
  });

  it("deve identificar o perfil com mais indicações", () => {
    const opcoes = [
      criarOpcao("a1", "ARCO_E_FLECHA"),
      criarOpcao("a2", "ARCO_E_FLECHA"),
      criarOpcao("a3", "ARCO_E_FLECHA"),
      criarOpcao("a4", "ESPELHO"),
      criarOpcao("a5", "BALANCA"),
    ];

    const resultado = casoDeUso.executar(perfis, opcoes);

    expect(resultado.maiorPontuacao).toBe(3);
    expect(resultado.perfisMaisIndicados.map((perfil) => perfil.id))
      .toEqual(["ARCO_E_FLECHA"]);
  });

  it("deve preservar o empate entre os perfis mais indicados", () => {
    const opcoes = [
      criarOpcao("a1", "ARCO_E_FLECHA"),
      criarOpcao("a2", "ARCO_E_FLECHA"),
      criarOpcao("a3", "ESPELHO"),
      criarOpcao("a4", "ESPELHO"),
      criarOpcao("a5", "BALANCA"),
    ];

    const resultado = casoDeUso.executar(perfis, opcoes);

    expect(resultado.maiorPontuacao).toBe(2);
    expect(resultado.perfisMaisIndicados.map((perfil) => perfil.id))
      .toEqual(["ARCO_E_FLECHA", "ESPELHO"]);
  });

  it("deve lançar erro quando uma opção referencia um perfil inexistente", () => {
    const opcoes = [
      criarOpcao("a1", "PERFIL_INEXISTENTE"),
    ];

    expect(() => casoDeUso.executar(perfis, opcoes))
      .toThrow(/perfil inexistente/i);
  });
});