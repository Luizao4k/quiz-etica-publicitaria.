import perfisJson from "../../data/perfil.json";
import referenciasJson from "../../data/referencia.json";
import situacoesJson from "../../data/situacoe.json";
import type { Personalidade } from "../../domain/entities/Personalidade";
import type { Quiz } from "../../domain/entities/Quiz";
import type { Referencia } from "../../domain/entities/Referencia";
import { montarPerfil } from "../../domain/services/montarPerfil";
import type { QuizRepository } from "./QuizRepository";

/**
 * Fornece os dados do questionário a partir dos arquivos JSON.
 *
 * Os dados estão divididos em três arquivos: perfis (com seus tópicos),
 * referências teóricas e situações. A infraestrutura é responsável por
 * conhecer a origem dos dados e por reuni-los no formato do domínio.
 */
export class QuizRepositoryJson implements QuizRepository {
  /**
   * Retorna os perfis e as situações do questionário.
   *
   * As referências teóricas são associadas às expressões dos tópicos do perfil
   * a que pertencem.
   *
   * @returns Dados completos do questionário.
   */
  obterQuiz(): Quiz {
    const referencias: Referencia[] = referenciasJson.referencias;

    const perfis: Personalidade[] = perfisJson.perfis.map((perfil) =>
      montarPerfil(perfil, referencias),
    );

    return { perfis, situacoes: situacoesJson.situacoes };
  }
}
