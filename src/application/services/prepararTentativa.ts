
import type { Quiz } from "../../domain/entities/Quiz";
import { Tentativa } from "../../domain/entities/Tentativa";
import { embaralhar } from "../utils/embaralhar";

/**
 * Prepara uma nova tentativa com situações e opções embaralhadas.
 *
 * Somente a ordem de apresentação muda: situações e opções mantêm seus
 * identificadores, textos e perfis associados. Não modifica os dados originais
 * do questionário.
 */
export function prepararTentativa(quiz: Quiz): Tentativa {
  return Tentativa.iniciar({
    ...quiz,
    situacoes: embaralhar(quiz.situacoes).map((situacao) => ({
      ...situacao,
      opcoes: embaralhar(situacao.opcoes),
    })),
  });
}
