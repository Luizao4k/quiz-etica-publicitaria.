import { useEffect, useRef, useState } from "react";
import type { Opcao } from "../../domain/entities/Opcao";
import type { Tentativa } from "../../domain/entities/Tentativa";

import topoQuiz from "../assets/image/tela-quiz/topo.webp";

import "../styles/quiz.css";

/**
 * Tempo, em milissegundos, em que a alternativa escolhida permanece em destaque
 * antes de o quiz avançar automaticamente para a próxima situação.
 */
const ATRASO_AVANCO_AUTOMATICO_MS = 700;

interface QuizPageProps {
    tentativa: Tentativa;
    onResponder: (opcaoId: string) => void;
    onAvancar: () => void;
    onVoltar: () => void;
}

/**
 * Texto anunciado por leitores de tela quando a resposta é registrada.
 */
function mensagemDeConfirmacao(ultimaSituacao: boolean): string {
    return ultimaSituacao
        ? "Resposta registrada. Abrindo o resultado."
        : "Resposta registrada. Avançando para a próxima situação.";
}

/**
 * Apresenta as situações do quiz e controla a navegação.
 *
 * Ao escolher uma alternativa, a resposta é registrada, a escolha fica em
 * destaque por um instante e o quiz avança sozinho. Ao voltar para uma situação
 * já respondida (consulta), a alternativa registrada é apenas exibida: as
 * alternativas ficam bloqueadas e o avanço é feito pelo botão PRÓXIMO.
 */
export function QuizPage({
    tentativa,
    onResponder,
    onAvancar,
    onVoltar,
}: QuizPageProps) {
    const [opcaoConfirmadaId, setOpcaoConfirmadaId] =
        useState<string | null>(null);
    const tituloSituacao = useRef<HTMLHeadingElement>(null);

    const situacao = tentativa.situacaoAtual;
    const respostaAtual = tentativa.respostaAtual;
    const confirmando = opcaoConfirmadaId !== null;
    const progresso =
        ((tentativa.indiceAtual + 1) / tentativa.totalSituacoes) * 100;

    // Avanço automático: depois de a escolha ficar em destaque por um instante,
    // segue para a próxima situação (ou para o resultado, na última).
    useEffect(() => {
        if (opcaoConfirmadaId === null) {
            return;
        }

        const temporizador = window.setTimeout(() => {
            setOpcaoConfirmadaId(null);
            onAvancar();
        }, ATRASO_AVANCO_AUTOMATICO_MS);

        return () => window.clearTimeout(temporizador);
    }, [opcaoConfirmadaId, onAvancar]);

    // Leva o foco ao título da situação exibida, para que leitores de tela e
    // navegação por teclado acompanhem o avanço automático.
    useEffect(() => {
        tituloSituacao.current?.focus({ preventScroll: true });
    }, [tentativa.indiceAtual]);

    function escolher(opcao: Opcao) {
        if (!tentativa.podeResponder || confirmando) {
            return;
        }

        onResponder(opcao.id);
        setOpcaoConfirmadaId(opcao.id);
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
                        Situação {tentativa.indiceAtual + 1} de{" "}
                        {tentativa.totalSituacoes}
                    </p>

                    <div
                        className="quiz-progresso"
                        role="progressbar"
                        aria-label="Progresso do questionário"
                        aria-valuemin={0}
                        aria-valuemax={tentativa.totalSituacoes}
                        aria-valuenow={tentativa.indiceAtual + 1}
                    >
                        <div
                            className="quiz-progresso-preenchido"
                            style={{ width: `${progresso}%` }}
                        />
                    </div>
                </header>

                <section className="quiz-situacao">
                    <p className="quiz-enunciado">{situacao.enunciado}</p>
                </section>

                <section
                    className={
                        confirmando
                            ? "quiz-opcoes quiz-opcoes-confirmando"
                            : "quiz-opcoes"
                    }
                    aria-label="Alternativas"
                >
                    {situacao.opcoes.map((opcao, indice) => {
                        const selecionada = respostaAtual?.id === opcao.id;
                        const confirmada = opcaoConfirmadaId === opcao.id;
                        const classes = ["quiz-opcao"];

                        if (selecionada) {
                            classes.push("quiz-opcao-selecionada");
                        }

                        if (confirmada) {
                            classes.push("quiz-opcao-confirmada");
                        }

                        return (
                            <button
                                key={opcao.id}
                                type="button"
                                className={classes.join(" ")}
                                onClick={() => escolher(opcao)}
                                disabled={!tentativa.podeResponder}
                                aria-pressed={selecionada}
                            >
                                <span className="quiz-opcao-letra">
                                    {confirmada ? (
                                        <svg
                                            className="quiz-opcao-check"
                                            viewBox="0 0 16 16"
                                            aria-hidden="true"
                                        >
                                            <path d="M3 8.5l3.2 3.2L13 5" />
                                        </svg>
                                    ) : (
                                        String.fromCharCode(65 + indice)
                                    )}
                                </span>

                                <span>{opcao.texto}</span>
                            </button>
                        );
                    })}
                </section>

                <p className="quiz-status" role="status">
                    {confirmando
                        ? mensagemDeConfirmacao(tentativa.ultimaSituacao)
                        : ""}
                </p>

                <footer className="quiz-acoes">
                    <button
                        type="button"
                        className="quiz-botao quiz-botao-secundario"
                        onClick={onVoltar}
                        disabled={!tentativa.podeVoltar || confirmando}
                    >
                        ANTERIOR
                    </button>

                    <button
                        type="button"
                        className="quiz-botao quiz-botao-principal"
                        onClick={onAvancar}
                        disabled={!tentativa.podeAvancar || confirmando}
                    >
                        PRÓXIMO
                    </button>
                </footer>
            </section>
        </main>
    );
}
