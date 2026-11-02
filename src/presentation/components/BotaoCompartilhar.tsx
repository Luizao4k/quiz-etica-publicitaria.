
import { useState } from "react";
import "../styles/resultado.css";

import facebookIcon from "../assets/image/icone/facebook-icon.png";
import whatsappIcon from "../assets/image/icone/whatsapp-icon.png";
import xIcon from "../assets/image/icone/x-icon.png";

export function BotaoCompartilhar() {
    const [aberto, setAberto] = useState(false);
    const [mensagem, setMensagem] = useState("");

    // Compartilha somente o domínio principal.
    const url = window.location.origin;

    async function copiarLink() {
        try {
            await navigator.clipboard.writeText(url);
            setMensagem("Link copiado com sucesso!");
        } catch {
            window.prompt("Copie o link do site:", url);
            setMensagem("Copie o endereço exibido para compartilhar.");
        }
    }

    function compartilhar(rede: "facebook" | "x" | "whatsapp") {
        const links = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(url)}`,
        };

        window.open(links[rede], "_blank", "noopener,noreferrer");
    }

    function fecharModal() {
        setAberto(false);
        setMensagem("");
    }

    return (
        <>
            <button
                type="button"
                className="resultado-compartilhar"
                onClick={() => {
                    setMensagem("");
                    setAberto(true);
                }}
            >
                COMPARTILHAR
            </button>

            {aberto && (
                <div
                    className="resultado-compartilhar-overlay"
                    onClick={fecharModal}
                >
                    <section
                        className="resultado-compartilhar-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="compartilhar-titulo"
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="resultado-compartilhar-fechar"
                            onClick={fecharModal}
                            aria-label="Fechar janela de compartilhamento"
                        >
                            ×
                        </button>

                        <h2 id="compartilhar-titulo">
                            Compartilhe o Quiz Ética Publicitária com seus amigos!
                        </h2>

                        <div className="resultado-compartilhar-redes">
                            <button
                                type="button"
                                className="resultado-rede"
                                onClick={() => compartilhar("facebook")}
                                aria-label="Compartilhar no Facebook"
                            >
                                <img src={facebookIcon} alt="" />
                                <span>Facebook</span>
                            </button>

                            <button
                                type="button"
                                className="resultado-rede"
                                onClick={() => compartilhar("x")}
                                aria-label="Compartilhar no X"
                            >
                                <img src={xIcon} alt="" />
                                <span>X</span>
                            </button>

                            <button
                                type="button"
                                className="resultado-rede"
                                onClick={() => compartilhar("whatsapp")}
                                aria-label="Compartilhar no WhatsApp"
                            >
                                <img src={whatsappIcon} alt="" />
                                <span>WhatsApp</span>
                            </button>

                        </div>

                        <label
                            className="resultado-link-label"
                            htmlFor="resultado-link-site"
                        >
                            Link do site
                        </label>

                        <div className="resultado-link-container">
                            <input
                                id="resultado-link-site"
                                type="text"
                                value={url}
                                readOnly
                                onFocus={(evento) => evento.currentTarget.select()}
                            />

                            <button
                                type="button"
                                className="resultado-link-copiar"
                                onClick={() => void copiarLink()}
                            >
                                COPIAR
                            </button>
                        </div>

                        {mensagem && (
                            <p
                                className="resultado-compartilhar-mensagem"
                                role="status"
                            >
                                {mensagem}
                            </p>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}
