import type { Opcao } from "./Opcao";
import type { Quiz } from "./Quiz";
import type { Situacao } from "./Situacao";

/**
 * Representa uma execução do questionário.
 *
 * Reúne as situações na ordem em que serão apresentadas nesta execução, as
 * respostas já registradas e a posição atual do participante. Concentra as
 * regras de resposta e de navegação:
 *
 * - a resposta de uma situação é registrada uma única vez e não pode ser
 *   alterada depois, nem durante a consulta de situações anteriores;
 * - só é possível avançar a partir de uma situação respondida;
 * - o participante pode voltar para consultar suas respostas, sem modificá-las;
 * - avançar a partir da última situação respondida finaliza a tentativa.
 *
 * A entidade é imutável: cada operação devolve uma nova tentativa e nunca
 * altera a anterior. Assim, consultar respostas anteriores não interfere nas
 * respostas registradas nem no resultado.
 */
export class Tentativa {
  /** Questionário desta execução, com situações e opções na ordem de apresentação. */
  readonly quiz: Quiz;

  /** Indica que o questionário foi encerrado e o resultado já pode ser calculado. */
  readonly finalizada: boolean;

  private readonly indice: number;
  private readonly respostas: ReadonlyMap<string, Opcao>;

  private constructor(
    quiz: Quiz,
    indice: number,
    respostas: ReadonlyMap<string, Opcao>,
    finalizada: boolean,
  ) {
    this.quiz = quiz;
    this.indice = indice;
    this.respostas = respostas;
    this.finalizada = finalizada;
  }

  /**
   * Inicia uma tentativa na primeira situação, sem respostas registradas.
   *
   * @param quiz - Questionário já preparado para esta execução.
   * @returns Nova tentativa, independente de qualquer execução anterior.
   * @throws Error se o questionário não tiver situações ou se houver
   * situações com identificadores repetidos.
   */
  static iniciar(quiz: Quiz): Tentativa {
    if (quiz.situacoes.length === 0) {
      throw new Error("O questionário não possui situações.");
    }

    const identificadores = new Set(quiz.situacoes.map((situacao) => situacao.id));

    if (identificadores.size !== quiz.situacoes.length) {
      throw new Error(
        "O questionário possui situações com identificadores repetidos.",
      );
    }

    return new Tentativa(quiz, 0, new Map(), false);
  }

  /** Situação exibida no momento. */
  get situacaoAtual(): Situacao {
    return this.quiz.situacoes[this.indice];
  }

  /** Posição da situação atual, começando em zero. */
  get indiceAtual(): number {
    return this.indice;
  }

  /** Quantidade de situações desta execução. */
  get totalSituacoes(): number {
    return this.quiz.situacoes.length;
  }

  /** Indica se a situação atual é a última da sequência. */
  get ultimaSituacao(): boolean {
    return this.indice === this.totalSituacoes - 1;
  }

  /** Opção registrada para a situação atual, se ela já foi respondida. */
  get respostaAtual(): Opcao | undefined {
    return this.respostas.get(this.situacaoAtual.id);
  }

  /** Indica se a situação atual já possui resposta registrada. */
  get situacaoAtualRespondida(): boolean {
    return this.respostas.has(this.situacaoAtual.id);
  }

  /** Indica se a situação atual ainda pode receber uma resposta. */
  get podeResponder(): boolean {
    return !this.finalizada && !this.situacaoAtualRespondida;
  }

  /** Indica se é possível avançar, o que exige a situação atual respondida. */
  get podeAvancar(): boolean {
    return !this.finalizada && this.situacaoAtualRespondida;
  }

  /** Indica se existe uma situação anterior para consulta. */
  get podeVoltar(): boolean {
    return !this.finalizada && this.indice > 0;
  }

  /**
   * Registra a opção escolhida para a situação atual.
   *
   * A posição não muda: avançar é uma operação separada, o que permite à
   * interface exibir a escolha antes de passar para a próxima situação.
   *
   * @param opcaoId - Identificador da opção escolhida.
   * @returns Nova tentativa com a resposta registrada.
   * @throws Error se a tentativa estiver finalizada, se a situação já tiver
   * sido respondida (a resposta registrada não pode ser alterada) ou se a
   * opção não pertencer à situação atual.
   */
  responder(opcaoId: string): Tentativa {
    this.garantirEmAndamento();

    const situacao = this.situacaoAtual;

    if (this.situacaoAtualRespondida) {
      throw new Error(
        `A situação "${situacao.id}" já foi respondida e a resposta registrada não pode ser alterada.`,
      );
    }

    const opcao = situacao.opcoes.find((opcaoDisponivel) => opcaoDisponivel.id === opcaoId);

    if (!opcao) {
      throw new Error(
        `A opção "${opcaoId}" não pertence à situação "${situacao.id}".`,
      );
    }

    const respostas = new Map(this.respostas).set(situacao.id, opcao);

    return new Tentativa(this.quiz, this.indice, respostas, false);
  }

  /**
   * Avança para a próxima situação. Na última situação, finaliza a tentativa.
   *
   * @returns Nova tentativa na situação seguinte ou finalizada.
   * @throws Error se a tentativa estiver finalizada ou se a situação atual
   * ainda não tiver sido respondida.
   */
  avancar(): Tentativa {
    this.garantirEmAndamento();

    if (!this.situacaoAtualRespondida) {
      throw new Error(
        `Responda a situação "${this.situacaoAtual.id}" antes de avançar.`,
      );
    }

    if (this.ultimaSituacao) {
      return new Tentativa(this.quiz, this.indice, this.respostas, true);
    }

    return new Tentativa(this.quiz, this.indice + 1, this.respostas, false);
  }

  /**
   * Volta para a situação imediatamente anterior, para consulta.
   *
   * As respostas registradas permanecem como estão.
   *
   * @returns Nova tentativa na situação anterior.
   * @throws Error se a tentativa estiver finalizada ou se a situação atual for
   * a primeira.
   */
  voltar(): Tentativa {
    this.garantirEmAndamento();

    if (this.indice === 0) {
      throw new Error("Não há situação anterior.");
    }

    return new Tentativa(this.quiz, this.indice - 1, this.respostas, false);
  }

  /**
   * Retorna as opções escolhidas até o momento.
   *
   * @returns Opções selecionadas, na ordem de apresentação das situações.
   */
  opcoesSelecionadas(): Opcao[] {
    return this.quiz.situacoes.flatMap((situacao) => {
      const opcao = this.respostas.get(situacao.id);

      return opcao ? [opcao] : [];
    });
  }

  private garantirEmAndamento(): void {
    if (this.finalizada) {
      throw new Error("A tentativa já foi finalizada.");
    }
  }
}
