import { Fragment, useEffect, useId, useRef } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";

import type { Detalhe } from "../../domain/entities/Detalhe";
import type { Referencia } from "../../domain/entities/Referencia";

/**
 * Expressão destacada cujo balão de referências está aberto.
 *
 * A ocorrência é identificada pela posição (tópico e trecho), pois a mesma
 * referência pode destacar a expressão em mais de um ponto do texto.
 */
export interface ReferenciaAtiva {
    topico: number;
    trecho: number;
    referencia: Referencia;
    /** Posição horizontal da seta do balão, a partir da borda esquerda do texto. */
    setaX: number;
}

interface TopicosPerfilProps {
    detalhes: Detalhe[];
    ativa: ReferenciaAtiva | null;
    onAlternar: (ativa: ReferenciaAtiva) => void;
}

/**
 * Lista os tópicos complementares de um perfil.
 *
 * As expressões que possuem referência teórica aparecem destacadas. Ao acioná-las,
 * um balão com as obras de referência é exibido logo abaixo do tópico.
 */
export function TopicosPerfil({ detalhes, ativa, onAlternar }: TopicosPerfilProps) {
    const idBalao = useId();
    const balao = useRef<HTMLDivElement>(null);
    const chaveAtiva = ativa ? `${ativa.topico}-${ativa.trecho}` : null;

    // Se o balão abrir fora da tela (expressão perto do rodapé), rola só o necessário para mostrá-lo.
    useEffect(() => {
        if (chaveAtiva === null) {
            return;
        }

        const reduzirMovimento = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        balao.current?.scrollIntoView({
            block: "nearest",
            behavior: reduzirMovimento ? "auto" : "smooth",
        });
    }, [chaveAtiva]);

    function acionar(
        evento: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
        topico: number,
        trecho: number,
        referencia: Referencia,
    ) {
        const expressao = evento.currentTarget;
        const texto = expressao.closest("p");
        const retanguloExpressao =
            expressao.getClientRects()[0] ?? expressao.getBoundingClientRect();
        const retanguloTexto = texto?.getBoundingClientRect();

        // A seta aponta para o centro da expressão (na primeira linha, se ela quebrar).
        const setaX = retanguloTexto
            ? Math.min(
                  Math.max(
                      retanguloExpressao.left +
                          retanguloExpressao.width / 2 -
                          retanguloTexto.left,
                      16,
                  ),
                  Math.max(retanguloTexto.width - 16, 16),
              )
            : 24;

        onAlternar({ topico, trecho, referencia, setaX });
    }

    return (
        <ol className="topicos" role="list">
            {detalhes.map((detalhe, indiceTopico) => {
                const ativaNoTopico =
                    ativa !== null && ativa.topico === indiceTopico ? ativa : null;

                return (
                    <li className="topico" key={indiceTopico}>
                        <span className="topico-numero" aria-hidden="true">
                            {indiceTopico + 1}
                        </span>

                        <div className="topico-corpo">
                            <p className="topico-texto">
                                {detalhe.trechos.map((trecho, indiceTrecho) => {
                                    const referencia = trecho.referencia;

                                    if (!referencia) {
                                        return (
                                            <Fragment key={indiceTrecho}>
                                                {trecho.texto}
                                            </Fragment>
                                        );
                                    }

                                    const aberta =
                                        ativaNoTopico?.trecho === indiceTrecho;

                                    return (
                                        <span
                                            key={indiceTrecho}
                                            className="expressao"
                                            role="button"
                                            tabIndex={0}
                                            data-expressao=""
                                            aria-expanded={aberta}
                                            aria-controls={aberta ? idBalao : undefined}
                                            onClick={(evento) =>
                                                acionar(evento, indiceTopico, indiceTrecho, referencia)
                                            }
                                            onKeyDown={(evento) => {
                                                if (evento.key === "Enter" || evento.key === " ") {
                                                    evento.preventDefault();
                                                    acionar(evento, indiceTopico, indiceTrecho, referencia);
                                                }
                                            }}
                                        >
                                            {trecho.texto}
                                        </span>
                                    );
                                })}
                            </p>

                            {ativaNoTopico && (
                                <div
                                    ref={balao}
                                    className="balao"
                                    id={idBalao}
                                    role="note"
                                    data-balao=""
                                    style={
                                        {
                                            "--seta-x": `${ativaNoTopico.setaX}px`,
                                        } as CSSProperties
                                    }
                                >
                                    <p className="balao-titulo">
                                        {ativaNoTopico.referencia.obras.length > 1
                                            ? "Referências"
                                            : "Referência"}
                                    </p>

                                    <ul className="balao-obras">
                                        {ativaNoTopico.referencia.obras.map((obra) => (
                                            <li key={`${obra.autor}-${obra.titulo}`}>
                                                <span className="balao-autor">{obra.autor}.</span>{" "}
                                                <cite>{obra.titulo}</cite>.
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
