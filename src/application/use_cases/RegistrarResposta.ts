
import type { Opcao } from "../../domain/entities/Opcao";
import type { Situacao } from "../../domain/entities/Situacao";

/**
 * Registra e mantém as respostas selecionadas durante o questionário.
 *
 * Cada situação pode ter somente uma opção selecionada por vez.
 * Uma nova resposta para a mesma situação substitui a anterior.
 */
export class RegistrarResposta {
  private readonly respostas = new Map<string, Opcao>();

  /**
   * Registra a opção escolhida para uma situação.
   *
   * @param situacao - Situação que está sendo respondida.
   * @param opcao - Opção selecionada pelo participante.
   * @throws Error se a opção não pertencer à situação informada.
   */
  executar(situacao: Situacao, opcao: Opcao): void {
    const opcaoValida = situacao.opcoes.some(
      (opcaoDisponivel) => opcaoDisponivel.id === opcao.id,
    );

    if (!opcaoValida) {
      throw new Error(
        `A opção "${opcao.id}" não pertence à situação "${situacao.id}".`,
      );
    }

    this.respostas.set(situacao.id, opcao);
  }

  /**
   * Retorna as opções selecionadas até o momento.
   *
   * @returns Lista das opções escolhidas, na ordem de registro
   * das situações distintas.
   */
  obterRespostas(): Opcao[] {
    return Array.from(this.respostas.values());
  }

  /**
   * Verifica se uma situação já possui uma resposta.
   *
   * @param situacaoId - Identificador da situação.
   * @returns true quando existe uma resposta registrada.
   */
  possuiResposta(situacaoId: string): boolean {
    return this.respostas.has(situacaoId);
  }

  /**
   * Remove a resposta registrada para uma situação.
   *
   * @param situacaoId - Identificador da situação.
   * @returns true se uma resposta foi removida.
   */
  removerResposta(situacaoId: string): boolean {
    return this.respostas.delete(situacaoId);
  }

  /**
   * Remove todas as respostas registradas.
   */
  limpar(): void {
    this.respostas.clear();
  }
}
