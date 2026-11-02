import type { Detalhe, TrechoDetalhe } from "../entities/Detalhe";
import type { Referencia } from "../entities/Referencia";

interface Ocorrencia {
  inicio: number;
  fim: number;
  referencia: Referencia;
}

const LETRA_OU_NUMERO = /[\p{L}\p{M}\p{N}]/u;

function escaparParaRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Verifica se o trecho encontrado é uma palavra (ou sequência de palavras)
 * inteira, isto é, não está colado a letras ou números do texto ao redor.
 */
function ehPalavraInteira(texto: string, inicio: number, fim: number): boolean {
  const anterior = inicio > 0 ? texto[inicio - 1] : "";
  const posterior = fim < texto.length ? texto[fim] : "";

  return !LETRA_OU_NUMERO.test(anterior) && !LETRA_OU_NUMERO.test(posterior);
}

function localizarOcorrencias(
  texto: string,
  referencia: Referencia,
): Ocorrencia[] {
  const expressao = referencia.expressao.trim();

  if (expressao === "") {
    return [];
  }

  const busca = new RegExp(escaparParaRegExp(expressao), "giu");
  const ocorrencias: Ocorrencia[] = [];

  for (const correspondencia of texto.matchAll(busca)) {
    const inicio = correspondencia.index;
    const fim = inicio + correspondencia[0].length;

    if (ehPalavraInteira(texto, inicio, fim)) {
      ocorrencias.push({ inicio, fim, referencia });
    }
  }

  return ocorrencias;
}

/**
 * Monta um tópico complementar a partir do texto e das referências do perfil.
 *
 * As expressões que possuem referência são localizadas no texto e separadas em
 * trechos próprios, para que a interface possa destacá-las. Regras:
 *
 * - a busca ignora diferenças de maiúsculas e minúsculas, e o trecho mantém a
 *   grafia do texto original;
 * - só valem palavras inteiras: "outro" não é encontrado dentro de "outros";
 * - todas as ocorrências de uma expressão são destacadas;
 * - se duas expressões se sobrepõem, prevalece a que começa primeiro e, com o
 *   mesmo início, a mais longa; empatando, a que aparece antes na lista;
 * - referências cuja expressão não aparece no texto são ignoradas.
 *
 * @param texto - Texto completo do tópico.
 * @param referencias - Referências do perfil ao qual o tópico pertence.
 * @returns Tópico com o texto original e os trechos que o compõem.
 */
export function montarDetalhe(
  texto: string,
  referencias: Referencia[],
): Detalhe {
  const ocorrencias = referencias
    .flatMap((referencia) => localizarOcorrencias(texto, referencia))
    .sort(
      (a, b) => a.inicio - b.inicio || b.fim - b.inicio - (a.fim - a.inicio),
    );

  const trechos: TrechoDetalhe[] = [];
  let cursor = 0;

  for (const ocorrencia of ocorrencias) {
    if (ocorrencia.inicio < cursor) {
      continue;
    }

    if (ocorrencia.inicio > cursor) {
      trechos.push({ texto: texto.slice(cursor, ocorrencia.inicio) });
    }

    trechos.push({
      texto: texto.slice(ocorrencia.inicio, ocorrencia.fim),
      referencia: ocorrencia.referencia,
    });
    cursor = ocorrencia.fim;
  }

  if (cursor < texto.length) {
    trechos.push({ texto: texto.slice(cursor) });
  }

  return { texto, trechos };
}
