
"""
ANÁLISE MATEMÁTICA DE PROBABILIDADES
Oráculo da Ética Publicitária

Calcula todas as combinações possíveis de respostas do questionário,
utilizando distribuições combinatórias.

Não simula participantes individualmente.

Considera todas as alternativas igualmente prováveis e independentes.
"""

from math import comb

from configuracao_quiz import (
    PERFIS,
    SIGLAS_PERFIS,
    TOTAL_QUESTOES,
    QUESTOES_PONDERADAS,
    ALTERNATIVAS_PONDERADAS,
    PESO_NORMAL,
    PESO_ESPECIAL,
    REGRAS_DESEMPATE,
    validar_configuracao,
)


# =====================================================================
# 1. GERAÇÃO DAS DISTRIBUIÇÕES
# =====================================================================

def gerar_distribuicoes(quantidade):
    """
    Gera todas as distribuições possíveis de respostas entre os perfis.

    Exemplo para 3 questões e 2 perfis:
        (0, 3)
        (1, 2)
        (2, 1)
        (3, 0)

    Também calcula quantas sequências diferentes produzem
    cada distribuição.
    """

    def gerar(posicao, restante, atual):
        if posicao == len(SIGLAS_PERFIS) - 1:
            distribuicao = atual + (restante,)

            possibilidades = comb(
                quantidade,
                distribuicao[0],
            )

            restante_combinacoes = (
                quantidade - distribuicao[0]
            )

            for indice in range(1, len(distribuicao) - 1):
                possibilidades *= comb(
                    restante_combinacoes,
                    distribuicao[indice],
                )

                restante_combinacoes -= distribuicao[indice]

            yield distribuicao, possibilidades
            return

        for valor in range(restante + 1):
            yield from gerar(
                posicao + 1,
                restante - valor,
                atual + (valor,),
            )

    yield from gerar(0, quantidade, ())


# =====================================================================
# 2. RESOLUÇÃO DO RESULTADO
# =====================================================================

def resolver_vencedor(pontuacao):
    """Determina o vencedor considerando as regras de desempate."""

    maior_pontuacao = max(pontuacao.values())

    empatados = tuple(sorted(
        perfil
        for perfil, pontos in pontuacao.items()
        if pontos == maior_pontuacao
    ))

    if len(empatados) == 1:
        return empatados[0], False, empatados

    vencedor = REGRAS_DESEMPATE[empatados]

    return vencedor, True, empatados


# =====================================================================
# 3. CÁLCULO DO UNIVERSO
# =====================================================================

def calcular_universo():
    """
    Analisa todas as combinações possíveis do questionário.

    Agrupa as respostas por distribuição e utiliza coeficientes
    multinomiais para contabilizar quantas sequências representam
    cada distribuição.
    """

    validar_configuracao()

    quantidade_ponderadas = len(QUESTOES_PONDERADAS)
    quantidade_normais = TOTAL_QUESTOES - quantidade_ponderadas

    total_combinacoes = len(SIGLAS_PERFIS) ** TOTAL_QUESTOES

    estatisticas = {
        perfil: {
            "diretas": 0,
            "desempate": 0,
            "fora_empate": 0,
            "total": 0,
        }
        for perfil in SIGLAS_PERFIS
    }

    total_questionarios_com_empate = 0
    total_vitorias_fora_empate = 0

    distribuicoes_normais = list(
        gerar_distribuicoes(quantidade_normais)
    )

    distribuicoes_ponderadas = list(
        gerar_distribuicoes(quantidade_ponderadas)
    )

    for distribuicao_normal, formas_normais in distribuicoes_normais:

        for distribuicao_ponderada, formas_ponderadas in distribuicoes_ponderadas:

            pontuacao = {}

            for indice, perfil in enumerate(SIGLAS_PERFIS):

                peso = (
                    PESO_ESPECIAL
                    if perfil in ALTERNATIVAS_PONDERADAS
                    else PESO_NORMAL
                )

                pontuacao[perfil] = (
                    distribuicao_normal[indice] * PESO_NORMAL
                    + distribuicao_ponderada[indice] * peso
                )

            quantidade_questionarios = (
                formas_normais * formas_ponderadas
            )

            vencedor, houve_desempate, empatados = resolver_vencedor(
                pontuacao
            )

            dados = estatisticas[vencedor]

            dados["total"] += quantidade_questionarios

            if houve_desempate:
                dados["desempate"] += quantidade_questionarios
                total_questionarios_com_empate += quantidade_questionarios

                if vencedor not in empatados:
                    dados["fora_empate"] += quantidade_questionarios
                    total_vitorias_fora_empate += quantidade_questionarios

            else:
                dados["diretas"] += quantidade_questionarios

    total_calculado = sum(
        dados["total"]
        for dados in estatisticas.values()
    )

    if total_calculado != total_combinacoes:
        raise ArithmeticError(
            "O total calculado não corresponde ao universo esperado."
        )

    return {
        "total_combinacoes": total_combinacoes,
        "estatisticas": estatisticas,
        "total_questionarios_com_empate": total_questionarios_com_empate,
        "total_vitorias_fora_empate": total_vitorias_fora_empate,
        "quantidade_normais": quantidade_normais,
        "quantidade_ponderadas": quantidade_ponderadas,
    }


# =====================================================================
# 4. FORMATAÇÃO DO TERMINAL
# =====================================================================

def formatar_numero(valor):
    return f"{valor:,}".replace(",", ".")


def formatar_percentual(valor):
    return f"{valor:.2f}%".replace(".", ",")


def imprimir_tabela(colunas, linhas):
    """Imprime uma tabela alinhada no terminal."""

    larguras = []

    for indice, coluna in enumerate(colunas):
        maior = max(
            len(str(coluna)),
            *[
                len(str(linha[indice]))
                for linha in linhas
            ],
        )

        larguras.append(maior)

    separador = (
        "+"
        + "+".join("-" * (largura + 2) for largura in larguras)
        + "+"
    )

    def imprimir_linha(valores):
        partes = [
            f" {str(valor):<{larguras[indice]}} "
            for indice, valor in enumerate(valores)
        ]

        print("|" + "|".join(partes) + "|")

    print(separador)
    imprimir_linha(colunas)
    print(separador.replace("-", "="))

    for linha in linhas:
        imprimir_linha(linha)

    print(separador)


# =====================================================================
# 5. RELATÓRIO
# =====================================================================

def gerar_relatorio(resultado):

    total = resultado["total_combinacoes"]
    estatisticas = resultado["estatisticas"]

    print("\n")
    print("=" * 100)
    print("             ANÁLISE MATEMÁTICA — ORÁCULO DA ÉTICA PUBLICITÁRIA")
    print("=" * 100)

    print("\nUNIVERSO ANALISADO")
    print("-" * 100)

    print(f"Questões: {TOTAL_QUESTOES}")
    print(f"Questões normais: {resultado['quantidade_normais']}")
    print(f"Questões ponderadas: {resultado['quantidade_ponderadas']}")
    print(f"Alternativas com peso especial: {', '.join(sorted(ALTERNATIVAS_PONDERADAS))}")
    print(f"Peso normal: {PESO_NORMAL}")
    print(f"Peso especial: {PESO_ESPECIAL}")

    print(
        f"\nTotal de combinações: {formatar_numero(total)}"
    )

    # ---------------------------------------------------------------
    # Distribuição dos vencedores
    # ---------------------------------------------------------------

    ranking = sorted(
        SIGLAS_PERFIS,
        key=lambda perfil: estatisticas[perfil]["total"],
        reverse=True,
    )

    linhas = []

    for perfil in ranking:
        dados = estatisticas[perfil]

        pontos_maximos = (
            TOTAL_QUESTOES * PESO_NORMAL
            + (
                resultado["quantidade_ponderadas"]
                * (PESO_ESPECIAL - PESO_NORMAL)
                if perfil in ALTERNATIVAS_PONDERADAS
                else 0
            )
        )

        percentual = dados["total"] / total * 100

        linhas.append([
            PERFIS[perfil],
            "0",
            str(pontos_maximos),
            formatar_numero(dados["total"]),
            formatar_percentual(percentual),
        ])

    print("\nDISTRIBUIÇÃO FINAL DOS VENCEDORES")
    print("-" * 100)

    imprimir_tabela(
        [
            "Perfil",
            "Mín. pontos",
            "Máx. pontos",
            "Combinações vencedoras",
            "Probabilidade",
        ],
        linhas,
    )

    # ---------------------------------------------------------------
    # Origem das vitórias
    # ---------------------------------------------------------------

    linhas_origem = []

    for perfil in ranking:
        dados = estatisticas[perfil]

        linhas_origem.append([
            PERFIS[perfil],
            formatar_numero(dados["diretas"]),
            formatar_numero(dados["desempate"]),
            formatar_numero(dados["fora_empate"]),
        ])

    print("\nORIGEM DAS VITÓRIAS")
    print("-" * 100)

    imprimir_tabela(
        [
            "Perfil",
            "Vitórias diretas",
            "Vitórias por desempate",
            "Vitórias fora do empate",
        ],
        linhas_origem,
    )

    # ---------------------------------------------------------------
    # Resumo do impacto do desempate
    # ---------------------------------------------------------------

    quantidade_empates = resultado["total_questionarios_com_empate"]
    quantidade_fora = resultado["total_vitorias_fora_empate"]

    print("\nIMPACTO DAS REGRAS DE DESEMPATE")
    print("-" * 100)

    print(
        f"Questionários decididos por empate: "
        f"{formatar_numero(quantidade_empates)}"
    )

    print(
        f"Percentual com empate: "
        f"{formatar_percentual(quantidade_empates / total * 100)}"
    )

    print(
        f"Vitórias atribuídas a perfis fora do empate: "
        f"{formatar_numero(quantidade_fora)}"
    )

    print(
        f"Percentual do universo com vencedor fora do empate: "
        f"{formatar_percentual(quantidade_fora / total * 100)}"
    )

    print("\n")
    print("=" * 100)
    print("                       ANÁLISE CONCLUÍDA")
    print("=" * 100)


# =====================================================================
# 6. EXECUÇÃO
# =====================================================================

if __name__ == "__main__":

    resultado = calcular_universo()

    gerar_relatorio(resultado)
