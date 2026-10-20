
import type { Quiz } from "../../domain/entities/Quiz";
import { embaralhar } from "../utils/embaralhar";

/**
 * Prepara uma nova tentativa com situações e opções embaralhadas.
 *
 * Não modifica os dados originais do questionário.
 */
export function prepararTentativa(quiz: Quiz): Quiz {
  return {
    ...quiz,
    situacoes: embaralhar(quiz.situacoes).map((situacao) => ({
      ...situacao,
      opcoes: embaralhar(situacao.opcoes),
    })),
  };
}
