import imagemInicio from "../assets/image/tela-inicial/inicio.png";
import "../styles/inicio.css";

interface InicioPageProps {
  onIniciar: () => void;
}

/**
 * Apresenta a tela inicial do questionário.
 */
export function InicioPage({ onIniciar }: InicioPageProps) {
  return (
    <main className="inicio-page">
      <div className="inicio-arte">
        <img
          className="inicio-imagem"
          src={imagemInicio}
          alt="Oráculo da Ética Publicitária. O que as cartas revelam sobre o seu perfil profissional?"
        />

        <button
          className="inicio-botao"
          type="button"
          onClick={onIniciar}
          aria-label="Iniciar quiz"
        />
      </div>
    </main>
  );
}