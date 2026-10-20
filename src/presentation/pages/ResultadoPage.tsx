import { useState } from "react";

import type { Quiz } from "../../domain/entities/Quiz";
import type { Personalidade } from "../../domain/entities/Personalidade";
import type { ResultadoQuiz } from "../../application/use_cases/CalcularResultado";

import "../styles/resultado.css";

import cartaArcoEFlecha from "../assets/image/cartas/arco-e-flecha.webp"
import cartaEspelho from "../assets/image/cartas/espelho.webp"
import cartaBalanca from "../assets/image/cartas/balanca.webp"
import cartaEspada from "../assets/image/cartas/espada.webp"
import versoCarta from "../assets/image/cartas/verso.webp"

interface ResultadoPageProps {
    quiz: Quiz;
    resultado: ResultadoQuiz;
    onReiniciar: () => void;
}

const imagensCartas: Record<string, string> = {
    ARCO_E_FLECHA: cartaArcoEFlecha,
    ESPELHO: cartaEspelho,
    BALANCA: cartaBalanca,
    ESPADA: cartaEspada,
};

/**
 * Apresenta as cartas correspondentes aos perfis indicados no quiz.
 */
export function ResultadoPage({
    quiz,
    resultado,
    onReiniciar,
}: ResultadoPageProps) {
    const [detalhesAbertos, setDetalhesAbertos] = useState<string[]>([]);

    const perfisIndicados = quiz.perfis.filter((perfil) =>
        resultado.perfisMaisIndicados.some(
            (perfilIndicado) => perfilIndicado.id === perfil.id,
        ),
    );

    function alternarDetalhes(perfilId: string) {
        setDetalhesAbertos((atuais) =>
            atuais.includes(perfilId)
                ? atuais.filter((id) => id !== perfilId)
                : [...atuais, perfilId],
        );
    }

    function renderizarPerfil(perfil: Personalidade) {
        const detalhesVisiveis = detalhesAbertos.includes(perfil.id);
        const imagem = imagensCartas[perfil.id];

        return (
            <article className="resultado-carta" key={perfil.id}>
                <div className="resultado-carta-imagem">
                    {imagem ? (
                        <img src={imagem} alt={`Carta ${perfil.titulo}`} />
                    ) : (
                        <div className="resultado-imagem-indisponivel">
                            {perfil.titulo}
                        </div>
                    )}
                </div>

                <div className="resultado-verso">
                    <img
                        className="resultado-verso-imagem"
                        src={versoCarta}
                        alt=""
                        aria-hidden="true"
                    />

                    <div className="resultado-verso-conteudo">
                        <h2>{perfil.subtitulo}</h2>

                        <p className="resultado-descricao">{perfil.descricao}</p>

                        {perfil.detalhes.length > 0 && (
                            <>
                                {detalhesVisiveis && (
                                    <ul className="resultado-detalhes">
                                        {perfil.detalhes.map((detalhe, indice) => (
                                            <li key={`${perfil.id}-${indice}`}>{detalhe}</li>
                                        ))}
                                    </ul>
                                )}

                                <button
                                    type="button"
                                    className="resultado-ver-mais"
                                    onClick={() => alternarDetalhes(perfil.id)}
                                    aria-expanded={detalhesVisiveis}
                                >
                                    {detalhesVisiveis ? "Ver menos" : "Ver mais"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </article>
        );
    }

    return (
        <main className="resultado-page">
            <section className="resultado-container">
                <header className="resultado-header">
                    <h1>ESTA É SUA CARTA</h1>
                </header>

                <div className="resultado-perfis">
                    {perfisIndicados.map(renderizarPerfil)}
                </div>

                <button
                    type="button"
                    className="resultado-botao"
                    onClick={onReiniciar}
                >
                    REFAZER O QUIZ
                </button>
            </section>
        </main>
    );
}
