
import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent as EventoDeMouse } from "react";

import type { Personalidade } from "../../domain/entities/Personalidade";
import { TopicosPerfil } from "./TopicosPerfil";
import type { ReferenciaAtiva } from "./TopicosPerfil";

import "../styles/carta.css";

const ATRASO_ROLAGEM_MS = 380;

interface CartaPerfilProps {
    perfil: Personalidade;
    imagemFrente?: string;
    imagemVerso: string;
}

export function CartaPerfil({
    perfil,
    imagemFrente,
    imagemVerso,
}: CartaPerfilProps) {
    const [virada, setVirada] = useState(false);
    const [acordeaoAberto, setAcordeaoAberto] = useState(false);
    const [referenciaAtiva, setReferenciaAtiva] =
        useState<ReferenciaAtiva | null>(null);

    const painel = useRef<HTMLDivElement>(null);
    const idPainel = useId();

    const painelAberto = virada && acordeaoAberto;
    const balaoAberto = referenciaAtiva !== null;

    // Vira automaticamente quando o mouse entra na carta.
    function aoEntrar() {
        setVirada(true);
    }

    // Retorna à frente quando o mouse sai da carta.
    function aoSair() {
        setVirada(false);
        setAcordeaoAberto(false);
        setReferenciaAtiva(null);
    }

    // Alternativa para dispositivos com tela sensível ao toque.
    function aoTocarNaCarta(evento: EventoDeMouse<HTMLElement>) {
        if (window.matchMedia("(hover: hover)").matches) {
            return;
        }

        const alvo = evento.target;

        if (alvo instanceof Element && alvo.closest("button")) {
            return;
        }

        if (window.getSelection()?.toString()) {
            return;
        }

        setVirada((atual) => !atual);
        setReferenciaAtiva(null);
    }

    // Abre a carta pelo teclado.
    function virarPeloTeclado() {
        setVirada((atual) => !atual);
        setReferenciaAtiva(null);
    }

    // Rolagem automática até os tópicos complementares.
    useEffect(() => {
        if (!painelAberto) return;

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

    // Fecha os balões ao clicar fora ou pressionar Esc.
    useEffect(() => {
        if (!balaoAberto) return;

        function aoClicar(evento: Event) {
            const alvo = evento.target;

            if (alvo instanceof Element) {
                const controle = alvo.closest(
                    "[data-expressao], [data-balao]",
                );

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

    function alternarAcordeao() {
        setAcordeaoAberto((atual) => !atual);
        setReferenciaAtiva(null);
    }

    function alternarReferencia(nova: ReferenciaAtiva) {
        setReferenciaAtiva((atual) =>
            atual &&
            atual.topico === nova.topico &&
            atual.trecho === nova.trecho
                ? null
                : nova,
        );
    }

    return (
        <article
            className="carta"
            aria-label={perfil.titulo}
            onMouseEnter={aoEntrar}
            onMouseLeave={aoSair}
        >
            <div className="carta-palco">
                <div className="carta-giro" data-virada={virada}>
                    <div
                        className="carta-face carta-frente"
                        onClick={aoTocarNaCarta}
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
                            <div className="carta-sem-imagem">
                                {perfil.titulo}
                            </div>
                        )}
                    </div>

                    <div
                        className="carta-face carta-verso"
                        onClick={aoTocarNaCarta}
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
                            <p className="carta-descricao">
                                {perfil.descricao}
                            </p>

                            {perfil.detalhes.length > 0 && (
                                <button
                                    type="button"
                                    className="carta-leia-mais"
                                    onClick={alternarAcordeao}
                                    aria-expanded={acordeaoAberto}
                                    aria-controls={idPainel}
                                >
                                    <span>
                                        LEIA MAIS SOBRE O SEU PERFIL
                                    </span>

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

                <button
                    type="button"
                    className="carta-virar"
                    onClick={virarPeloTeclado}
                    aria-label={`Virar carta: ${perfil.titulo}`}
                >
                    Virar carta
                    <span className="carta-oculto">
                        {" "}— {perfil.titulo}:{" "}
                        {virada
                            ? "ver a frente"
                            : "ler sobre o seu perfil"}
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
