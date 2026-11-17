import type { Opcao } from "../../domain/entities/Opcao";
import type { Personalidade } from "../../domain/entities/Personalidade";
import type { Situacao } from "../../domain/entities/Situacao";

/**
 * Representa a pontuação de uma personalidade no questionário.
 */
export interface PontuacaoPersonalidade {
  personalidade: Personalidade;
  indicacoes: number;
}

/**
 * Representa o resultado calculado do questionário.
 */
export interface ResultadoQuiz {
  pontuacoes: PontuacaoPersonalidade[];
  perfisMaisIndicados: Personalidade[];
  maiorPontuacao: number;
}

/**
 * Situações que possuem pontuação ponderada.
 */
const SITUACOES_PONDERADAS = new Set([
  "s8",
  "s10",
  "s11",
]);

/**
 * Perfis que recebem 2 pontos nas situações ponderadas.
 */
const PERFIS_PONDERADOS = new Set([
  "ESPELHO",
  "ESPADA",
]);

/**
 * Regras de desempate.
 */
const REGRAS_DESEMPATE: Record<string, string> = {
  // Empates duplos
  "ARCO_E_FLECHA|ESPELHO": "ARCO_E_FLECHA",
  "ARCO_E_FLECHA|BALANCA": "BALANCA",
  "ARCO_E_FLECHA|ESPADA": "BALANCA",
  "BALANCA|ESPELHO": "BALANCA",
  "ESPADA|ESPELHO": "BALANCA",
  "BALANCA|ESPADA": "ESPADA",

  // Empates triplos
  "ARCO_E_FLECHA|BALANCA|ESPELHO": "BALANCA",
  "ARCO_E_FLECHA|ESPADA|ESPELHO": "BALANCA",
  "ARCO_E_FLECHA|BALANCA|ESPADA": "BALANCA",
  "BALANCA|ESPADA|ESPELHO": "ESPADA",

  // Empate quádruplo
  "ARCO_E_FLECHA|BALANCA|ESPADA|ESPELHO": "BALANCA",
};

/**
 * Calcula as indicações recebidas por cada personalidade.
 *
 * Situações s8, s10 e s11:
 * - BALANCA e ESPADA recebem 2 pontos.
 * - ARCO_E_FLECHA e ESPELHO recebem 1 ponto.
 *
 * Demais situações:
 * - Todos os perfis recebem 1 ponto.
 *
 * Em caso de empate, aplica as regras de desempate.
 */
export class CalcularResultado {

  /**
   * Executa o cálculo do resultado.
   *
   * @param perfis Personalidades disponíveis no questionário.
   * @param situacoes Situações e respectivas opções do questionário.
   * @param opcoesSelecionadas Opções escolhidas pelo participante.
   * @returns Pontuações e perfil vencedor.
   * @throws Error quando uma opção selecionada não pertence ao questionário
   * ou referencia um perfil inexistente.
   */
  executar(
    perfis: Personalidade[],
    situacoes: Situacao[],
    opcoesSelecionadas: Opcao[],
  ): ResultadoQuiz {

    // Inicializa a pontuação de todos os perfis.
    const contagem = new Map<string, number>(
      perfis.map((perfil) => [perfil.id, 0]),
    );

    // Relaciona cada opção à situação em que está cadastrada.
    const opcoesPorId = new Map<
      string,
      { situacaoId: string; opcao: Opcao }
    >();

    for (const situacao of situacoes) {
      for (const opcao of situacao.opcoes) {
        if (opcoesPorId.has(opcao.id)) {
          throw new Error(
            `Identificador de opção duplicado: "${opcao.id}".`,
          );
        }

        opcoesPorId.set(opcao.id, {
          situacaoId: situacao.id,
          opcao,
        });
      }
    }

    // Calcula a pontuação de cada opção selecionada.
    for (const opcaoSelecionada of opcoesSelecionadas) {

      const registro = opcoesPorId.get(opcaoSelecionada.id);

      if (!registro) {
        throw new Error(
          `A opção "${opcaoSelecionada.id}" não pertence ao questionário.`,
        );
      }

      if (
        registro.opcao.perfilAlvo !== opcaoSelecionada.perfilAlvo
      ) {
        throw new Error(
          `O perfil da opção "${opcaoSelecionada.id}" não corresponde ao cadastro.`,
        );
      }

      const pontuacaoAtual = contagem.get(
        registro.opcao.perfilAlvo,
      );

      if (pontuacaoAtual === undefined) {
        throw new Error(
          `A opção "${opcaoSelecionada.id}" referencia um perfil inexistente: "${registro.opcao.perfilAlvo}".`,
        );
      }

      const situacaoPonderada =
        SITUACOES_PONDERADAS.has(registro.situacaoId);

      const perfilPonderado =
        PERFIS_PONDERADOS.has(registro.opcao.perfilAlvo);

      const pontos =
        situacaoPonderada && perfilPonderado ? 2 : 1;

      contagem.set(
        registro.opcao.perfilAlvo,
        pontuacaoAtual + pontos,
      );
    }

    // Organiza a pontuação de todas as personalidades.
    const pontuacoes: PontuacaoPersonalidade[] = perfis.map(
      (personalidade) => ({
        personalidade,
        indicacoes: contagem.get(personalidade.id) ?? 0,
      }),
    );

    // Identifica a maior pontuação.
    const maiorPontuacao = Math.max(
      0,
      ...pontuacoes.map((pontuacao) => pontuacao.indicacoes),
    );

    // Identifica os perfis empatados na maior pontuação.
    const empatados = pontuacoes
      .filter(
        (pontuacao) => pontuacao.indicacoes === maiorPontuacao,
      )
      .map((pontuacao) => pontuacao.personalidade);

    // Sem empate, retorna diretamente o perfil mais indicado.
    if (empatados.length === 1) {
      return {
        pontuacoes,
        perfisMaisIndicados: empatados,
        maiorPontuacao,
      };
    }

    // Gera uma chave independente da ordem dos perfis.
    const chaveDesempate = empatados
      .map((perfil) => perfil.id)
      .sort()
      .join("|");

    const vencedorId = REGRAS_DESEMPATE[chaveDesempate];

    // Importante: o vencedor pode não estar entre os empatados.
    const vencedor = perfis.find(
      (perfil) => perfil.id === vencedorId,
    );

    return {
      pontuacoes,
      perfisMaisIndicados: vencedor
        ? [vencedor]
        : empatados,
      maiorPontuacao,
    };
  }
}