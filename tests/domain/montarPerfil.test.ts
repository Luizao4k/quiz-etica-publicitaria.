import { describe, expect, it } from "vitest";
import type { Referencia } from "../../src/domain/entities/Referencia";
import { montarPerfil } from "../../src/domain/services/montarPerfil";
import type { PerfilBruto } from "../../src/domain/services/montarPerfil";

function criarPerfil(id: string, detalhes: string[]): PerfilBruto {
  return {
    id,
    titulo: `Carta ${id}`,
    subtitulo: `Perfil ${id}`,
    descricao: `Descrição de ${id}.`,
    detalhes,
  };
}

function criarReferencia(id: string, perfilId: string, expressao: string): Referencia {
  return {
    id,
    perfilId,
    expressao,
    obras: [{ autor: "AUTOR, Teste", titulo: `Obra de ${id}` }],
  };
}

describe("montarPerfil", () => {
  it("deve manter os dados do perfil e a ordem dos tópicos", () => {
    const perfil = montarPerfil(
      criarPerfil("A", ["Primeiro tópico.", "Segundo tópico."]),
      [],
    );

    expect(perfil.id).toBe("A");
    expect(perfil.titulo).toBe("Carta A");
    expect(perfil.subtitulo).toBe("Perfil A");
    expect(perfil.descricao).toBe("Descrição de A.");
    expect(perfil.detalhes.map((detalhe) => detalhe.texto)).toEqual([
      "Primeiro tópico.",
      "Segundo tópico.",
    ]);
  });

  it("deve destacar as expressões das referências do próprio perfil", () => {
    const perfil = montarPerfil(criarPerfil("A", ["Texto com alfa e beta."]), [
      criarReferencia("ref-a", "A", "alfa"),
    ]);

    const destaques = perfil.detalhes[0].trechos.filter((trecho) => trecho.referencia);

    expect(destaques.map((trecho) => trecho.texto)).toEqual(["alfa"]);
    expect(destaques[0].referencia?.id).toBe("ref-a");
  });

  it("não deve usar referências de outro perfil, mesmo que o texto coincida (RN03, RF05)", () => {
    const referencias = [
      criarReferencia("ref-a", "A", "alfa"),
      criarReferencia("ref-b", "B", "alfa"),
    ];

    const perfilA = montarPerfil(criarPerfil("A", ["Texto com alfa."]), referencias);
    const perfilB = montarPerfil(criarPerfil("B", ["Outro texto com alfa."]), [
      criarReferencia("ref-a", "A", "alfa"),
    ]);

    const idsEmA = perfilA.detalhes[0].trechos.map((trecho) => trecho.referencia?.id);

    expect(idsEmA).toContain("ref-a");
    expect(idsEmA).not.toContain("ref-b");
    // O perfil B não tem referência própria: nada é destacado nos tópicos dele.
    expect(perfilB.detalhes[0].trechos.every((trecho) => trecho.referencia === undefined)).toBe(true);
  });
});
