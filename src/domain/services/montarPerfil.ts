import type { Personalidade } from "../entities/Personalidade";
import type { Referencia } from "../entities/Referencia";
import { montarDetalhe } from "./montarDetalhe";

/**
 * Perfil como está armazenado: os tópicos ainda são textos simples, sem as
 * expressões separadas em trechos.
 */
export type PerfilBruto = Omit<Personalidade, "detalhes"> & {
  detalhes: string[];
};

/**
 * Monta um perfil completo, associando aos seus tópicos as referências teóricas.
 *
 * Somente as referências que pertencem ao perfil (`perfilId`) são consideradas:
 * uma expressão de outro perfil nunca é destacada aqui, mesmo que o mesmo texto
 * apareça nos tópicos.
 *
 * @param perfil - Perfil com os tópicos em texto simples.
 * @param referencias - Todas as referências teóricas do questionário.
 * @returns Perfil com os tópicos divididos em trechos.
 */
export function montarPerfil(
  perfil: PerfilBruto,
  referencias: Referencia[],
): Personalidade {
  const referenciasDoPerfil = referencias.filter(
    (referencia) => referencia.perfilId === perfil.id,
  );

  return {
    ...perfil,
    detalhes: perfil.detalhes.map((texto) =>
      montarDetalhe(texto, referenciasDoPerfil),
    ),
  };
}
