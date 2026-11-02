import { describe, expect, it } from "vitest";
import type { Referencia } from "../../src/domain/entities/Referencia";
import { montarDetalhe } from "../../src/domain/services/montarDetalhe";

function criarReferencia(id: string, expressao: string): Referencia {
  return {
    id,
    perfilId: "ESPELHO",
    expressao,
    obras: [{ autor: "AUTOR, Teste", titulo: `Obra de ${id}` }],
  };
}

function destaques(texto: string, referencias: Referencia[]): string[] {
  return montarDetalhe(texto, referencias)
    .trechos.filter((trecho) => trecho.referencia !== undefined)
    .map((trecho) => trecho.texto);
}

describe("montarDetalhe", () => {
  it("deve devolver um único trecho comum quando não há referências", () => {
    const detalhe = montarDetalhe("Texto sem destaques.", []);

    expect(detalhe.texto).toBe("Texto sem destaques.");
    expect(detalhe.trechos).toHaveLength(1);
    expect(detalhe.trechos[0].texto).toBe("Texto sem destaques.");
    expect(detalhe.trechos[0].referencia).toBeUndefined();
  });

  it("deve separar a expressão destacada do texto antes e depois dela", () => {
    const referencia = criarReferencia("r1", "excesso de confiança");
    const detalhe = montarDetalhe(
      "Demonstra excesso de confiança e traços narcisistas.",
      [referencia],
    );

    expect(detalhe.trechos.map((trecho) => trecho.texto)).toEqual([
      "Demonstra ",
      "excesso de confiança",
      " e traços narcisistas.",
    ]);
    expect(detalhe.trechos[0].referencia).toBeUndefined();
    expect(detalhe.trechos[1].referencia).toBe(referencia);
    expect(detalhe.trechos[2].referencia).toBeUndefined();
  });

  it("não deve criar trechos vazios quando a expressão está no início ou no fim", () => {
    const inicio = montarDetalhe("Egoísta por natureza.", [
      criarReferencia("r1", "Egoísta"),
    ]);
    const fim = montarDetalhe("Age de forma egoísta", [
      criarReferencia("r1", "egoísta"),
    ]);

    expect(inicio.trechos.map((trecho) => trecho.texto)).toEqual([
      "Egoísta",
      " por natureza.",
    ]);
    expect(fim.trechos.map((trecho) => trecho.texto)).toEqual([
      "Age de forma ",
      "egoísta",
    ]);
  });

  it("deve recompor o texto original juntando os trechos", () => {
    const texto =
      "Prioriza seu bem-viver ao tomar decisões; afeta outros e a si mesmo.";
    const referencias = [
      criarReferencia("r1", "bem-viver"),
      criarReferencia("r2", "outros"),
    ];

    const detalhe = montarDetalhe(texto, referencias);

    expect(detalhe.trechos.map((trecho) => trecho.texto).join("")).toBe(texto);
    expect(destaques(texto, referencias)).toEqual(["bem-viver", "outros"]);
  });

  it("deve considerar apenas palavras inteiras", () => {
    const referencia = criarReferencia("r1", "outro");

    expect(destaques("Sacrifícios pelo outro.", [referencia])).toEqual(["outro"]);
    expect(destaques("Afeta outros e a si mesmo.", [referencia])).toEqual([]);
    expect(destaques("Era outrora diferente.", [referencia])).toEqual([]);
  });

  it("deve ignorar maiúsculas e minúsculas e manter a grafia do texto", () => {
    const referencia = criarReferencia("r1", "aceita pressões");

    expect(destaques("Aceita pressões para assegurar.", [referencia])).toEqual([
      "Aceita pressões",
    ]);
    expect(
      destaques("A ÉTICA é central.", [criarReferencia("r2", "ética")]),
    ).toEqual(["ÉTICA"]);
  });

  it("deve destacar todas as ocorrências da expressão", () => {
    const referencia = criarReferencia("r1", "ética");

    expect(
      destaques("A ética importa; sem ética não há confiança.", [referencia]),
    ).toEqual(["ética", "ética"]);
  });

  it("deve manter a expressão mais longa quando duas expressões se sobrepõem", () => {
    const texto = "Valoriza a ética de bem-viver no trabalho.";
    const curta = criarReferencia("curta", "bem-viver");
    const longa = criarReferencia("longa", "ética de bem-viver");

    const detalhe = montarDetalhe(texto, [curta, longa]);
    const destacados = detalhe.trechos.filter((trecho) => trecho.referencia);

    expect(destacados).toHaveLength(1);
    expect(destacados[0].texto).toBe("ética de bem-viver");
    expect(destacados[0].referencia?.id).toBe("longa");
  });

  it("deve manter a primeira referência quando duas têm a mesma expressão", () => {
    const primeira = criarReferencia("primeira", "bem-viver");
    const segunda = criarReferencia("segunda", "bem-viver");

    const destacados = montarDetalhe("Prioriza o bem-viver.", [
      primeira,
      segunda,
    ]).trechos.filter((trecho) => trecho.referencia);

    expect(destacados).toHaveLength(1);
    expect(destacados[0].referencia?.id).toBe("primeira");
  });

  it("deve ignorar referências cuja expressão não aparece no texto", () => {
    const detalhe = montarDetalhe("Texto simples.", [
      criarReferencia("r1", "expressão ausente"),
    ]);

    expect(detalhe.trechos).toHaveLength(1);
    expect(detalhe.trechos[0].referencia).toBeUndefined();
  });

  it("deve tratar caracteres especiais da expressão como texto comum", () => {
    const referencia = criarReferencia("r1", "(a+b)? [c]");

    expect(destaques("Veja (a+b)? [c] aqui.", [referencia])).toEqual([
      "(a+b)? [c]",
    ]);
    expect(destaques("Veja a+b c aqui.", [referencia])).toEqual([]);
  });

  it("deve ignorar referências com expressão vazia", () => {
    expect(destaques("Texto.", [criarReferencia("r1", "   ")])).toEqual([]);
  });

  it("deve devolver nenhum trecho para um texto vazio", () => {
    const detalhe = montarDetalhe("", [criarReferencia("r1", "algo")]);

    expect(detalhe.trechos).toHaveLength(0);
  });
});
