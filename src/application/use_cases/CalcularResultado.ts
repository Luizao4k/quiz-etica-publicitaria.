
import type { Opcao } from "../../domain/entities/Opcao";
import type { Personalidade } from "../../domain/entities/Personalidade";

/**
 * Representa a pontuação de uma personalidade no questionário.
 */
export interface PontuacaoPersonalidade {
  /** Perfil ao qual a pontuação pertence. */
  personalidade: Personalidade;

  /** Quantidade de indicações recebidas pelo perfil. */
  indicacoes: number;
}

/**
 * Representa o resultado calculado do questionário.
 */
export interface ResultadoQuiz {
  /** Pontuação de todas as personalidades disponíveis. */
  pontuacoes: PontuacaoPersonalidade[];

  /** Perfis que alcançaram a maior pontuação, incluindo empates. */
  perfisMaisIndicados: Personalidade[];

  /** Maior quantidade de indicações recebidas. */
  maiorPontuacao: number;
}

/**
 * Calcula as indicações recebidas por cada personalidade.
 *
 * A regra considera o perfil associado a cada opção selecionada.
 * Se houver empate na maior pontuação, todos os perfis empatados
 * serão retornados.
 */
export class CalcularResultado {
  /**
   * Executa o cálculo do resultado.
   *
   * @param perfis - Personalidades disponíveis no questionário.
   * @param opcoesSelecionadas - Opções escolhidas pelo participante.
   * @returns Pontuações e perfis mais indicados.
   * @throws Error quando uma opção referencia um perfil inexistente.
   */
  executar(
    perfis: Personalidade[],
    opcoesSelecionadas: Opcao[],
  ): ResultadoQuiz {
    const contagem = new Map<string, number>(
      perfis.map((perfil) => [perfil.id, 0]),
    );

    for (const opcao of opcoesSelecionadas) {
      const pontuacaoAtual = contagem.get(opcao.perfilAlvo);

      if (pontuacaoAtual === undefined) {
        throw new Error(
          `A opção "${opcao.id}" referencia um perfil inexistente: "${opcao.perfilAlvo}".`,
        );
      }

      contagem.set(opcao.perfilAlvo, pontuacaoAtual + 1);
    }

    const pontuacoes: PontuacaoPersonalidade[] = perfis.map(
      (personalidade) => ({
        personalidade,
        indicacoes: contagem.get(personalidade.id) ?? 0,
      }),
    );

    const maiorPontuacao = Math.max(
      0,
      ...pontuacoes.map((pontuacao) => pontuacao.indicacoes),
    );

    const perfisMaisIndicados = pontuacoes
      .filter((pontuacao) => pontuacao.indicacoes === maiorPontuacao)
      .map((pontuacao) => pontuacao.personalidade);

    return {
      pontuacoes,
      perfisMaisIndicados,
      maiorPontuacao,
    };
  }
}
