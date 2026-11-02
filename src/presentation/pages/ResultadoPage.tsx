
import { useState } from "react";

import type { Quiz } from "../../domain/entities/Quiz";
import type { ResultadoQuiz } from "../../application/use_cases/CalcularResultado";
import { CartaPerfil } from "../components/CartaPerfil";
import { BotaoCompartilhar } from "../components/BotaoCompartilhar";

import "../styles/resultado.css";

import cartaArcoEFlecha from "../assets/image/cartas/arco-e-flecha.webp";
import cartaEspelho from "../assets/image/cartas/espelho.webp";
import cartaBalanca from "../assets/image/cartas/balanca.webp";
import cartaEspada from "../assets/image/cartas/espada.webp";
import versoCarta from "../assets/image/cartas/verso.webp";

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

export function ResultadoPage({
    quiz,
    resultado,
    onReiniciar,
}: ResultadoPageProps) {
    const [dicaVisivel, setDicaVisivel] = useState(true);

    const perfisIndicados = quiz.perfis.filter((perfil) =>
        resultado.perfisMaisIndicados.some(
            (perfilIndicado) => perfilIndicado.id === perfil.id,
        ),
    );

    return (
        <main className="resultado-page">
            <section className="resultado-container">
                <header className="resultado-header">
                    <h1>
                        {perfisIndicados.length > 1
                            ? "ESTAS SÃO SUAS CARTAS"
                            : "ESTA É SUA CARTA"}
                    </h1>
                </header>

                <div className="resultado-perfis">
                    {perfisIndicados.map((perfil, indice) => (
                        <CartaPerfil
                            key={perfil.id}
                            perfil={perfil}
                            imagemFrente={imagensCartas[perfil.id]}
                            imagemVerso={versoCarta}
                            mostrarDica={dicaVisivel && indice === 0}
                            onVirar={() => setDicaVisivel(false)}
                        />
                    ))}
                </div>

                <div className="resultado-acoes">
                    <BotaoCompartilhar />

                    <button
                        type="button"
                        className="resultado-botao"
                        onClick={onReiniciar}
                    >
                        REFAZER O QUIZ
                    </button>
                </div>
            </section>
        </main>
    );
}
