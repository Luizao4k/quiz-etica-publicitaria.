import { useCallback, useEffect, useState } from "react";

import { CarregarQuiz } from "./application/use_cases/CarregarQuiz";
import { prepararTentativa } from "./application/services/prepararTentativa";
import { CalcularResultado } from "./application/use_cases/CalcularResultado";
import { ResultadoPage } from "./presentation/pages/ResultadoPage";

import { QuizRepositoryJson } from "./infrastructure/repositories/QuizRepositoryJson";

import type { Tentativa } from "./domain/entities/Tentativa";

import { InicioPage } from "./presentation/pages/InicioPage";
import { QuizPage } from "./presentation/pages/QuizPage";

const repositorio = new QuizRepositoryJson();
const carregarQuiz = new CarregarQuiz(repositorio);
const calcularResultado = new CalcularResultado();

function App() {
  const [tentativa, setTentativa] = useState<Tentativa | null>(null);

  // Cada troca de tela ou de situação começa no topo da página. Sem isso, o
  // avanço automático deixaria o participante no meio da situação seguinte.
  const posicao = !tentativa
    ? "inicio"
    : tentativa.finalizada
      ? "resultado"
      : tentativa.indiceAtual;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [posicao]);

  function iniciarQuiz() {
    setTentativa(prepararTentativa(carregarQuiz.executar()));
  }

  // As transições usam a forma funcional do setState e só agem quando a regra
  // da tentativa permite, evitando erros por cliques repetidos ou atrasados.
  const responder = useCallback((opcaoId: string) => {
    setTentativa((atual) =>
      atual?.podeResponder ? atual.responder(opcaoId) : atual,
    );
  }, []);

  const avancar = useCallback(() => {
    setTentativa((atual) => (atual?.podeAvancar ? atual.avancar() : atual));
  }, []);

  const voltar = useCallback(() => {
    setTentativa((atual) => (atual?.podeVoltar ? atual.voltar() : atual));
  }, []);

  if (!tentativa) {
    return <InicioPage onIniciar={iniciarQuiz} />;
  }

  if (tentativa.finalizada) {
    const resultado = calcularResultado.executar(
      tentativa.quiz.perfis,
      tentativa.opcoesSelecionadas(),
    );

    return (
      <ResultadoPage
        quiz={tentativa.quiz}
        resultado={resultado}
        onReiniciar={iniciarQuiz}
      />
    );
  }

  return (
    <QuizPage
      tentativa={tentativa}
      onResponder={responder}
      onAvancar={avancar}
      onVoltar={voltar}
    />
  );
}

export default App;
