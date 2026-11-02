import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent as EventoDeMouse } from "react";

import type { Personalidade } from "../../domain/entities/Personalidade";
import { MaoApontando } from "./MaoApontando";
import { TopicosPerfil } from "./TopicosPerfil";
import type { ReferenciaAtiva } from "./TopicosPerfil";

import "../styles/carta.css";

/**
 * Tempo, em milissegundos, para a leitura complementar terminar de abrir antes
 * de a página rolar até o início dos tópicos.
 */
const ATRASO_ROLAGEM_MS = 380;

interface CartaPerfilProps {
    perfil: Personalidade;
    imagemFrente?: string;
    imagemVerso: string;
    /** Exibe a mão apontando sobre a frente da carta. */
    mostrarDica: boolean;
    /** Avisa que o participante virou a carta (para encerrar a dica). */
    onVirar: () => void;
}

/**
 * Carta de um perfil que vira ao clique.
 *
 * Na frente, aparece a ilustração do perfil. No verso, o subtítulo, o resumo e
 * o botão "LEIA MAIS SOBRE O SEU PERFIL", que abre logo abaixo da carta um
 * acordeão com os dez tópicos complementares. Nos tópicos, as expressões com
 * referência teórica ficam destacadas e abrem um balão ao serem acionadas.
 */
export function CartaPerfil({
    perfil,
    imagemFrente,
    imagemVerso,
    mostrarDica,
    onVirar,
}: CartaPerfilProps) {
    const [virada, setVirada] = useState(false);
    const [acordeaoAberto, setAcordeaoAberto] = useState(false);
    const [referenciaAtiva, setReferenciaAtiva] =
        useState<ReferenciaAtiva | null>(null);
    const painel = useRef<HTMLDivElement>(null);
    const idPainel = useId();

    // A leitura complementar pertence ao verso: só aparece com a carta virada.
    const painelAberto = virada && acordeaoAberto;
    const balaoAberto = referenciaAtiva !== null;

    // Ao abrir a leitura complementar, leva a página até o início dos tópicos.
    useEffect(() => {
        if (!painelAberto) {
            return;
        }

        const temporizador = window.setTimeout(() => {
            const reduzirMovimento = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

            painel.current?.scrollIntoView({
                behavior: reduzirMovimento ? "auto" : "smooth",
                block: "start",
            });
        }, ATRASO_ROLAGEM_MS);

        return () => window.clearTimeout(temporizador);
    }, [painelAberto]);

    // Fecha o balão ao clicar fora dele e da expressão que o abriu, ou com Esc.
    useEffect(() => {
        if (!balaoAberto) {
            return;
        }

        function aoClicar(evento: Event) {
            const alvo = evento.target;

            if (alvo instanceof Element) {
                const controle = alvo.closest("[data-expressao], [data-balao]");

                if (controle && painel.current?.contains(controle)) {
                    return;
                }
            }

            setReferenciaAtiva(null);
        }

        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                setReferenciaAtiva(null);
            }
        }

        document.addEventListener("click", aoClicar);
        document.addEventListener("keydown", aoTeclar);

        return () => {
            document.removeEventListener("click", aoClicar);
            document.removeEventListener("keydown", aoTeclar);
        };
    }, [balaoAberto]);

    function virar() {
        setVirada((atual) => !atual);
        setReferenciaAtiva(null);
        onVirar();
    }

    function aoClicarNoVerso(evento: EventoDeMouse<HTMLElement>) {
        const alvo = evento.target;

        // Botões do verso têm ação própria; selecionar texto não deve virar a carta.
        if (alvo instanceof Element && alvo.closest("button")) {
            return;
        }

        if (window.getSelection()?.toString()) {
            return;
        }

        virar();
    }

    function alternarAcordeao() {
        setAcordeaoAberto((atual) => !atual);
        setReferenciaAtiva(null);
    }

    function alternarReferencia(nova: ReferenciaAtiva) {
        setReferenciaAtiva((atual) =>
            atual && atual.topico === nova.topico && atual.trecho === nova.trecho
                ? null
                : nova,
        );
    }

    return (
        <article className="carta" aria-label={perfil.titulo}>
            <div className="carta-palco">
                <div className="carta-giro" data-virada={virada}>
                    <div
                        className="carta-face carta-frente"
                        onClick={virar}
                        inert={virada}
                        aria-hidden={virada}
                    >
                        {imagemFrente ? (
                            <img
                                className="carta-imagem"
                                src={imagemFrente}
                                alt={perfil.titulo}
                                draggable={false}
                            />
                        ) : (
                            <div className="carta-sem-imagem">{perfil.titulo}</div>
                        )}

                        {mostrarDica && (
                            <span className="carta-mao" aria-hidden="true">
                                <MaoApontando />
                            </span>
                        )}
                    </div>

                    <div
                        className="carta-face carta-verso"
                        onClick={aoClicarNoVerso}
                        inert={!virada}
                        aria-hidden={!virada}
                    >
                        <img
                            className="carta-imagem"
                            src={imagemVerso}
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                        />

                        <div className="carta-verso-conteudo">
                            <h2>{perfil.subtitulo}</h2>

                            <p className="carta-descricao">{perfil.descricao}</p>

                            {perfil.detalhes.length > 0 && (
                                <button
                                    type="button"
                                    className="carta-leia-mais"
                                    onClick={alternarAcordeao}
                                    aria-expanded={acordeaoAberto}
                                    aria-controls={idPainel}
                                >
                                    <span>LEIA MAIS SOBRE O SEU PERFIL</span>
                                    <svg
                                        className="carta-leia-mais-seta"
                                        viewBox="0 0 16 16"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path d="M3 6l5 5 5-5" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controle para teclado e leitores de tela; o mouse e o toque usam a própria carta. */}
                <button type="button" className="carta-virar" onClick={virar}>
                    Virar carta
                    <span className="carta-oculto">
                        {" "}
                        — {perfil.titulo}:{" "}
                        {virada ? "ver a frente" : "ler sobre o seu perfil"}
                    </span>
                </button>
            </div>

            <div
                ref={painel}
                id={idPainel}
                className="carta-acordeao"
                data-aberto={painelAberto}
                inert={!painelAberto}
                aria-hidden={!painelAberto}
            >
                <div className="carta-acordeao-interno">
                    <section
                        className="carta-acordeao-conteudo"
                        aria-label={`Leitura complementar sobre o perfil ${perfil.titulo}`}
                    >
                        <TopicosPerfil
                            detalhes={perfil.detalhes}
                            ativa={referenciaAtiva}
                            onAlternar={alternarReferencia}
                        />
                    </section>
                </div>
            </div>
        </article>
    );
}
