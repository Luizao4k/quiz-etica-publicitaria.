import { useState } from "react";
import type { Quiz } from "../../domain/entities/Quiz";
import type { Opcao } from "../../domain/entities/Opcao";
import type { RegistrarResposta } from "../../application/use_cases/RegistrarResposta";

import topoQuiz from "../assets/image/tela-quiz/topo.webp";

import "../styles/quiz.css";

interface QuizPageProps {
    quiz: Quiz;
    registrarResposta: RegistrarResposta;
    onFinalizar: () => void;
}

/**
 * Apresenta as situações do quiz e controla a navegação.
 */
export function QuizPage({
    quiz,
    registrarResposta,
    onFinalizar,
}: QuizPageProps) {
    const [indiceAtual, setIndiceAtual] = useState(0);
    const [opcaoSelecionada, setOpcaoSelecionada] =
        useState<Opcao | null>(null);

    const situacao = quiz.situacoes[indiceAtual];
    const respostaRegistrada = registrarResposta.obterResposta(situacao.id);

    const respostaAtual = respostaRegistrada ?? opcaoSelecionada;
    const ultimaSituacao = indiceAtual === quiz.situacoes.length - 1;
    const progresso = ((indiceAtual + 1) / quiz.situacoes.length) * 100;

    function avancar() {
        if (!respostaAtual) {
            return;
        }

        if (!respostaRegistrada) {
            registrarResposta.executar(situacao, respostaAtual);
        }

        if (ultimaSituacao) {
            onFinalizar();
            return;
        }

        setIndiceAtual((indice) => indice + 1);
        setOpcaoSelecionada(null);
    }

    function voltar() {
        if (indiceAtual === 0) {
            return;
        }

        setIndiceAtual((indice) => indice - 1);
        setOpcaoSelecionada(null);
    }

    return (
        <main className="quiz-page">
            <section className="quiz-container">
                <header className="quiz-header">
                    <div className="quiz-topo">
                        <img
                            src={topoQuiz}
                            alt="Oráculo da Ética Publicitária"
                            className="quiz-topo-imagem"
                        />
                    </div>
                    <p className="quiz-contador">
                        Situação {indiceAtual + 1} de {quiz.situacoes.length}
                    </p>

                    <div
                        className="quiz-progresso"
                        role="progressbar"
                        aria-label="Progresso do questionário"
                        aria-valuemin={0}
                        aria-valuemax={quiz.situacoes.length}
                        aria-valuenow={indiceAtual + 1}
                    >
                        <div
                            className="quiz-progresso-preenchido"
                            style={{ width: `${progresso}%` }}
                        />
                    </div>
                </header>

                <section className="quiz-situacao">
                    <p className="quiz-numero">
                        SITUAÇÃO {situacao.numero}
                    </p>

                    <h1>{situacao.titulo}</h1>

                    <p className="quiz-enunciado">{situacao.enunciado}</p>
                </section>

                <section className="quiz-opcoes" aria-label="Alternativas">
                    {situacao.opcoes.map((opcao, indice) => {
                        const selecionada = respostaAtual?.id === opcao.id;
                        const bloqueada = Boolean(respostaRegistrada);

                        return (
                            <button
                                key={opcao.id}
                                type="button"
                                className={`quiz-opcao ${selecionada ? "quiz-opcao-selecionada" : ""
                                    }`}
                                onClick={() => setOpcaoSelecionada(opcao)}
                                disabled={bloqueada}
                                aria-pressed={selecionada}
                            >
                                <span className="quiz-opcao-letra">
                                    {String.fromCharCode(65 + indice)}
                                </span>

                                <span>{opcao.texto}</span>
                            </button>
                        );
                    })}
                </section>

                <footer className="quiz-acoes">
                    <button
                        type="button"
                        className="quiz-botao quiz-botao-secundario"
                        onClick={voltar}
                        disabled={indiceAtual === 0}
                    >
                        Voltar
                    </button>

                    <button
                        type="button"
                        className="quiz-botao quiz-botao-principal"
                        onClick={avancar}
                        disabled={!respostaAtual}
                    >
                        {ultimaSituacao ? "Ver resultado" : "Próxima situação"}
                    </button>
                </footer>
            </section>
        </main>
    );
}
