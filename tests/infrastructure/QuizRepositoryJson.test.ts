
import { describe, expect, it } from "vitest";
import perfisJson from "../../src/data/perfil.json";
import referenciasJson from "../../src/data/referencia.json";
import { QuizRepositoryJson } from "../../src/infrastructure/repositories/QuizRepositoryJson";

describe("QuizRepositoryJson", () => {
  const repositorio = new QuizRepositoryJson();

  it("deve carregar os quatro perfis de personalidade", () => {
    const quiz = repositorio.obterQuiz();

    expect(quiz.perfis).toHaveLength(4);
  });

  it("deve carregar as treze situações do questionário", () => {
    const quiz = repositorio.obterQuiz();

    expect(quiz.situacoes).toHaveLength(13);
  });

  it("deve fornecer quatro opções para cada situação", () => {
    const quiz = repositorio.obterQuiz();

    for (const situacao of quiz.situacoes) {
      expect(situacao.opcoes).toHaveLength(4);
    }
  });

  it("deve fornecer opções com os campos esperados", () => {
    const quiz = repositorio.obterQuiz();

    for (const situacao of quiz.situacoes) {
      for (const opcao of situacao.opcoes) {
        expect(opcao.id).toBeTruthy();
        expect(opcao.texto).toBeTruthy();
        expect(opcao.perfilAlvo).toBeTruthy();
      }
    }
  });

  describe("integridade dos dados", () => {
    it("deve ter identificadores únicos para perfis, situações e opções", () => {
      const quiz = repositorio.obterQuiz();
      const idsOpcoes = quiz.situacoes.flatMap((situacao) =>
        situacao.opcoes.map((opcao) => opcao.id),
      );

      expect(new Set(quiz.perfis.map((perfil) => perfil.id)).size).toBe(
        quiz.perfis.length,
      );
      expect(new Set(quiz.situacoes.map((situacao) => situacao.id)).size).toBe(
        quiz.situacoes.length,
      );
      expect(new Set(idsOpcoes).size).toBe(idsOpcoes.length);
    });

    it("deve associar cada opção a um perfil existente", () => {
      const quiz = repositorio.obterQuiz();
      const idsPerfis = quiz.perfis.map((perfil) => perfil.id);

      for (const situacao of quiz.situacoes) {
        for (const opcao of situacao.opcoes) {
          expect(idsPerfis).toContain(opcao.perfilAlvo);
        }
      }
    });

    it("deve fornecer dez tópicos complementares para cada perfil", () => {
      const quiz = repositorio.obterQuiz();

      for (const perfil of quiz.perfis) {
        expect(perfil.detalhes).toHaveLength(10);
      }
    });
  });

  describe("referências teóricas", () => {
    const referencias = referenciasJson.referencias;

    it("deve ter referências com identificador único, perfil existente e obras completas", () => {
      const idsPerfis = perfisJson.perfis.map((perfil) => perfil.id);

      expect(new Set(referencias.map((referencia) => referencia.id)).size).toBe(
        referencias.length,
      );

      for (const referencia of referencias) {
        expect(idsPerfis).toContain(referencia.perfilId);
        expect(referencia.expressao.trim()).toBeTruthy();
        expect(referencia.obras.length).toBeGreaterThan(0);

        for (const obra of referencia.obras) {
          expect(obra.autor.trim()).toBeTruthy();
          expect(obra.titulo.trim()).toBeTruthy();
        }
      }
    });

    it("deve manter o texto original de cada tópico ao dividi-lo em trechos", () => {
      const quiz = repositorio.obterQuiz();

      for (const perfil of quiz.perfis) {
        const textosOriginais = perfisJson.perfis.find(
          (perfilJson) => perfilJson.id === perfil.id,
        )?.detalhes;

        expect(perfil.detalhes.map((detalhe) => detalhe.texto)).toEqual(
          textosOriginais,
        );

        for (const detalhe of perfil.detalhes) {
          const recomposto = detalhe.trechos.map((trecho) => trecho.texto).join("");

          expect(recomposto).toBe(detalhe.texto);
        }
      }
    });

    it("deve destacar cada expressão nos tópicos do perfil correspondente", () => {
      const quiz = repositorio.obterQuiz();

      for (const referencia of referencias) {
        const perfil = quiz.perfis.find((item) => item.id === referencia.perfilId);
        const ocorrencias = (perfil?.detalhes ?? []).flatMap((detalhe) =>
          detalhe.trechos.filter((trecho) => trecho.referencia?.id === referencia.id),
        );

        // Uma referência sem destaque seria inalcançável para o participante.
        expect(ocorrencias.length).toBeGreaterThan(0);

        for (const trecho of ocorrencias) {
          expect(trecho.texto.toLowerCase()).toBe(referencia.expressao.toLowerCase());
        }
      }
    });

    it("não deve destacar a referência de um perfil nos tópicos de outro", () => {
      const quiz = repositorio.obterQuiz();

      for (const perfil of quiz.perfis) {
        for (const detalhe of perfil.detalhes) {
          for (const trecho of detalhe.trechos) {
            if (trecho.referencia) {
              expect(trecho.referencia.perfilId).toBe(perfil.id);
            }
          }
        }
      }
    });
  });
});
