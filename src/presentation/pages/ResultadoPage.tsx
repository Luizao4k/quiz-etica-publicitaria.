import type { Quiz } from "../../domain/entities/Quiz";
import type { ResultadoQuiz } from "../../application/use_cases/CalcularResultado";
import { CartaPerfil } from "../components/CartaPerfil";
/*import { BotaoCompartilhar } from "../components/BotaoCompartilhar";*/

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


    const perfilIndicado = quiz.perfis.find((perfil) =>
        resultado.perfisMaisIndicados.some(
            (perfilResultado) => perfilResultado.id === perfil.id,
        ),
    );

    return (
        <main className="resultado-page">
            <section className="resultado-container">
                <header className="resultado-header">
                    <h1>
                        {perfilIndicado?.subtitulo.toUpperCase()}
                    </h1>
                </header>

                <div className="resultado-perfis">
                    {perfilIndicado && (
                        <CartaPerfil
                            key={perfilIndicado.id}
                            perfil={perfilIndicado}
                            imagemFrente={imagensCartas[perfilIndicado.id]}
                            imagemVerso={versoCarta}
                        />
                    )}
                </div>

                <div className="resultado-acoes">
                    {/* <BotaoCompartilhar /> */}

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
