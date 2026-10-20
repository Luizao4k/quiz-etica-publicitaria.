import { useState } from "react";

import { CarregarQuiz } from "./application/use_cases/CarregarQuiz";
import { RegistrarResposta } from "./application/use_cases/RegistrarResposta";
import { prepararTentativa } from "./application/services/prepararTentativa";
import { CalcularResultado } from "./application/use_cases/CalcularResultado";
import { ResultadoPage } from "./presentation/pages/ResultadoPage";
import type { ResultadoQuiz } from "./application/use_cases/CalcularResultado";

import { QuizRepositoryJson } from "./infrastructure/repositories/QuizRepositoryJson";

import type { Quiz } from "./domain/entities/Quiz";

import { InicioPage } from "./presentation/pages/InicioPage";
import { QuizPage } from "./presentation/pages/QuizPage";

const repositorio = new QuizRepositoryJson();
const carregarQuiz = new CarregarQuiz(repositorio);

function App() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [registrarResposta, setRegistrarResposta] =
    useState<RegistrarResposta | null>(null);

  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);

  function iniciarQuiz() {
    const dados = carregarQuiz.executar();
    const novaTentativa = prepararTentativa(dados);

    setResultado(null);
    setRegistrarResposta(new RegistrarResposta());
    setQuiz(novaTentativa);
  }

  function finalizarQuiz() {
    if (!quiz || !registrarResposta) {
      return;
    }

    const calcularResultado = new CalcularResultado();

    const resultadoCalculado = calcularResultado.executar(
      quiz.perfis,
      registrarResposta.obterRespostas(),
    );

    setResultado(resultadoCalculado);
  }

  if (!quiz || !registrarResposta) {
    return <InicioPage onIniciar={iniciarQuiz} />;
  }

  if (resultado && quiz) {
    return (
      <ResultadoPage
        quiz={quiz}
        resultado={resultado}
        onReiniciar={iniciarQuiz}
      />
    );
  }

  return (
    <QuizPage
      quiz={quiz}
      registrarResposta={registrarResposta}
      onFinalizar={finalizarQuiz}
    />
  );

}

export default App;
