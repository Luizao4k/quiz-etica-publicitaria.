
/**
 * Retorna uma cópia dos itens em ordem aleatória.
 *
 * Não modifica a lista original.
 */
export function embaralhar<T>(itens: readonly T[]): T[] {
  const resultado = [...itens];

  for (let i = resultado.length - 1; i > 0; i--) {
    const indiceAleatorio = Math.floor(Math.random() * (i + 1));

    [resultado[i], resultado[indiceAleatorio]] = [
      resultado[indiceAleatorio],
      resultado[i],
    ];
  }

  return resultado;
}
