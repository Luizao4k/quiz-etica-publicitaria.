
"""
SIMULAÇÃO COMPORTAMENTAL DE PARTICIPANTES
Oráculo da Ética Publicitária

Simula participantes com diferentes tendências de comportamento
e estima a distribuição das cartas entregues pelo questionário.

As probabilidades comportamentais são hipóteses configuráveis,
não dados empíricos de participantes reais.
"""

import random
from collections import Counter

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
# 1. CALIBRAGEM COMPORTAMENTAL POR QUESTÃO
#
# Cada linha representa uma questão.
# A ordem das probabilidades é sempre [A, B, C, D].
#
# Cada linha deve somar 1.0.
# =====================================================================


# ---------------------------------------------------------------------
# PERFIL A — PRAGMÁTICO
# Evita conflitos e prioriza cumprimento de prazos e segurança.
# ---------------------------------------------------------------------

PROB_PERFIL_A = [
    [0.55, 0.15, 0.25, 0.05],
    [0.50, 0.10, 0.35, 0.05],
    [0.55, 0.20, 0.20, 0.05],
    [0.40, 0.25, 0.25, 0.10],
    [0.60, 0.05, 0.30, 0.05],
    [0.55, 0.05, 0.35, 0.05],
    [0.55, 0.25, 0.15, 0.05],
    [0.45, 0.05, 0.45, 0.05],
    [0.35, 0.20, 0.35, 0.10],
    [0.45, 0.15, 0.30, 0.10],
    [0.35, 0.25, 0.30, 0.10],
    [0.50, 0.10, 0.30, 0.10],
    [0.55, 0.20, 0.20, 0.05],
]


# ---------------------------------------------------------------------
# PERFIL B — AMBICIOSO
# Autoconfiante, orientado à carreira e à visão individual.
# ---------------------------------------------------------------------

PROB_PERFIL_B = [
    [0.15, 0.55, 0.20, 0.10],
    [0.10, 0.50, 0.25, 0.15],
    [0.15, 0.50, 0.25, 0.10],
    [0.15, 0.45, 0.25, 0.15],
    [0.10, 0.55, 0.25, 0.10],
    [0.10, 0.45, 0.35, 0.10],
    [0.15, 0.50, 0.25, 0.10],
    [0.05, 0.55, 0.30, 0.10],
    [0.10, 0.45, 0.30, 0.15],
    [0.10, 0.40, 0.35, 0.15],
    [0.10, 0.40, 0.35, 0.15],
    [0.10, 0.50, 0.25, 0.15],
    [0.15, 0.50, 0.15, 0.20],
]


# ---------------------------------------------------------------------
# PERFIL C — DIPLOMÁTICO
# Mediador, busca conciliar interesses e preservar relações.
# ---------------------------------------------------------------------

PROB_PERFIL_C = [
    [0.25, 0.15, 0.45, 0.15],
    [0.10, 0.15, 0.60, 0.15],
    [0.10, 0.15, 0.55, 0.20],
    [0.10, 0.10, 0.55, 0.25],
    [0.20, 0.10, 0.60, 0.10],
    [0.15, 0.10, 0.60, 0.15],
    [0.10, 0.15, 0.60, 0.15],
    [0.15, 0.10, 0.60, 0.15],
    [0.05, 0.10, 0.60, 0.25],
    [0.10, 0.10, 0.55, 0.25],
    [0.05, 0.10, 0.55, 0.30],
    [0.15, 0.20, 0.50, 0.15],
    [0.15, 0.15, 0.50, 0.20],
]


# ---------------------------------------------------------------------
# PERFIL D — ÉTICO E CRÍTICO
# Questionador, crítico e orientado à responsabilidade social.
# ---------------------------------------------------------------------

PROB_PERFIL_D = [
    [0.05, 0.10, 0.20, 0.65],
    [0.05, 0.20, 0.20, 0.55],
    [0.05, 0.05, 0.25, 0.65],
    [0.05, 0.05, 0.25, 0.65],
    [0.10, 0.05, 0.25, 0.60],
    [0.05, 0.10, 0.25, 0.60],
    [0.05, 0.10, 0.25, 0.60],
    [0.05, 0.15, 0.20, 0.60],
    [0.05, 0.05, 0.30, 0.60],
    [0.05, 0.05, 0.20, 0.70],
    [0.02, 0.03, 0.20, 0.75],
    [0.05, 0.15, 0.25, 0.55],
    [0.05, 0.15, 0.10, 0.70],
]


# ---------------------------------------------------------------------
# PERFIL HÍBRIDO B + D
# Pessoa dividida entre ambição individual e responsabilidade ética.
# ---------------------------------------------------------------------

PROB_HIBRIDO_BD = [
    [
        (prob_b + prob_d) / 2
        for prob_b, prob_d in zip(linha_b, linha_d)
    ]
    for linha_b, linha_d in zip(
        PROB_PERFIL_B,
        PROB_PERFIL_D,
    )
]


# ---------------------------------------------------------------------
# PERFIL ALEATÓRIO
# Distribuição uniforme entre as quatro alternativas.
# ---------------------------------------------------------------------

PROB_ALEATORIO = [
    [0.25, 0.25, 0.25, 0.25]
    for _ in range(TOTAL_QUESTOES)
]


# =====================================================================
# 2. DISTRIBUIÇÃO HIPOTÉTICA DO PÚBLICO
#
# As proporções representam parâmetros do modelo de simulação.
# =====================================================================

DISTRIBUICAO_PUBLICO = [
    ("1. Perfil Pragmático (Base A)", 0.15, PROB_PERFIL_A),
    ("2. Perfil Ambicioso (Base B)", 0.20, PROB_PERFIL_B),
    ("3. Perfil Diplomático (Base C)", 0.25, PROB_PERFIL_C),
    ("4. Perfil Ético/Crítico (Base D)", 0.20, PROB_PERFIL_D),
    ("5. Dividido Extremo (B vs D)", 0.12, PROB_HIBRIDO_BD),
    ("6. Respondente Aleatório", 0.08, PROB_ALEATORIO),
]


# =====================================================================
# 3. VALIDAÇÃO DAS MATRIZES
# =====================================================================

def validar_matrizes():

    if len(DISTRIBUICAO_PUBLICO) == 0:
        raise ValueError("A distribuição do público está vazia.")

    soma_proporcoes = sum(
        proporcao
        for _, proporcao, _ in DISTRIBUICAO_PUBLICO
    )

    if abs(soma_proporcoes - 1.0) > 1e-9:
        raise ValueError(
            f"As proporções do público devem somar 1.0. "
            f"Valor atual: {soma_proporcoes}"
        )

    for nome, _, matriz in DISTRIBUICAO_PUBLICO:

        if len(matriz) != TOTAL_QUESTOES:
            raise ValueError(
                f"{nome}: a matriz precisa conter "
                f"{TOTAL_QUESTOES} questões."
            )

        for numero_questao, probabilidades in enumerate(matriz, start=1):

            if len(probabilidades) != len(SIGLAS_PERFIS):
                raise ValueError(
                    f"{nome}, questão {numero_questao}: "
                    "a linha deve conter quatro probabilidades."
                )

            if any(
                probabilidade < 0
                for probabilidade in probabilidades
            ):
                raise ValueError(
                    f"{nome}, questão {numero_questao}: "
                    "probabilidade negativa."
                )

            soma = sum(probabilidades)

            if abs(soma - 1.0) > 1e-9:
                raise ValueError(
                    f"{nome}, questão {numero_questao}: "
                    f"as probabilidades somam {soma}, não 1.0."
                )


# =====================================================================
# 4. CÁLCULO DA PONTUAÇÃO E DESEMPATE
# =====================================================================

def calcular_resultado(respostas):

    pontos = {
        perfil: 0
        for perfil in SIGLAS_PERFIS
    }

    for indice, alternativa in enumerate(respostas, start=1):

        peso = (
            PESO_ESPECIAL
            if (
                indice in QUESTOES_PONDERADAS
                and alternativa in ALTERNATIVAS_PONDERADAS
            )
            else PESO_NORMAL
        )

        pontos[alternativa] += peso

    maior_pontuacao = max(pontos.values())

    empatados = tuple(sorted(
        perfil
        for perfil, pontuacao in pontos.items()
        if pontuacao == maior_pontuacao
    ))

    if len(empatados) == 1:
        vencedor = empatados[0]
        houve_empate = False

    else:
        vencedor = REGRAS_DESEMPATE[empatados]
        houve_empate = True

    return {
        "vencedor": vencedor,
        "houve_empate": houve_empate,
        "empatados": empatados,
        "pontuacao": pontos,
    }


# =====================================================================
# 5. SIMULAÇÃO DE PARTICIPANTES
# =====================================================================

def emular_pessoas_reais(
    qtd_usuarios=10000,
    seed=None,
):

    if qtd_usuarios <= 0:
        raise ValueError(
            "A quantidade de participantes deve ser positiva."
        )

    validar_configuracao()
    validar_matrizes()

    random.seed(seed)

    resultados_gerais = Counter()
    empates_por_tipo = Counter()
    vencedores_fora_empate = Counter()

    total_empates = 0
    total_simulado = 0

    print("\n")
    print("=" * 100)
    print(
        "SIMULAÇÃO COMPORTAMENTAL — ORÁCULO DA ÉTICA PUBLICITÁRIA"
    )
    print("=" * 100)

    print(f"\nParticipantes solicitados: {qtd_usuarios:,}".replace(",", "."))
    print(f"Semente aleatória: {seed}")

    # ---------------------------------------------------------------
    # Distribuição inteira dos participantes
    # ---------------------------------------------------------------

    grupos = []

    for nome, proporcao, matriz in DISTRIBUICAO_PUBLICO:

        grupos.append({
            "nome": nome,
            "matriz": matriz,
            "quantidade": int(qtd_usuarios * proporcao),
        })

    # Corrige eventuais diferenças de arredondamento.
    diferenca = qtd_usuarios - sum(
        grupo["quantidade"]
        for grupo in grupos
    )

    grupos[0]["quantidade"] += diferenca

    print("\nDISTRIBUIÇÃO DOS GRUPOS SIMULADOS")
    print("-" * 100)

    print(
        f"{'GRUPO DE RESPONDENTES':<38} | "
        f"{'PARTICIPANTES':>14} | "
        f"{'A':>7} | {'B':>7} | {'C':>7} | {'D':>7}"
    )

    print("-" * 100)

    # ---------------------------------------------------------------
    # Simulação individual de cada grupo
    # ---------------------------------------------------------------

    for grupo in grupos:

        nome = grupo["nome"]
        matriz = grupo["matriz"]
        quantidade = grupo["quantidade"]

        contagem_grupo = Counter()

        for _ in range(quantidade):

            respostas = [
                random.choices(
                    SIGLAS_PERFIS,
                    weights=matriz[indice],
                    k=1,
                )[0]
                for indice in range(TOTAL_QUESTOES)
            ]

            resultado = calcular_resultado(respostas)

            vencedor = resultado["vencedor"]

            contagem_grupo[vencedor] += 1
            resultados_gerais[vencedor] += 1

            total_simulado += 1

            if resultado["houve_empate"]:

                total_empates += 1

                chave_empate = " + ".join(
                    resultado["empatados"]
                )

                empates_por_tipo[chave_empate] += 1

                if vencedor not in resultado["empatados"]:
                    vencedores_fora_empate[vencedor] += 1

        # Percentuais dentro do grupo.
        if quantidade > 0:
            percentuais = [
                f"{(contagem_grupo[p] / quantidade) * 100:6.1f}%"
                for p in SIGLAS_PERFIS
            ]
        else:
            percentuais = ["  0.0%"] * len(SIGLAS_PERFIS)

        print(
            f"{nome:<38} | "
            f"{quantidade:>14,} | "
            + " | ".join(percentuais)
        )

    # =================================================================
    # 6. RESULTADO GERAL
    # =================================================================

    print("\n")
    print("=" * 100)
    print("RESULTADO GERAL — CARTAS ENTREGUES")
    print("=" * 100)

    ranking = resultados_gerais.most_common()

    for perfil, quantidade in ranking:

        percentual = quantidade / total_simulado * 100

        barra = "█" * int(percentual / 2)

        print(
            f"{PERFIS[perfil]:<38} "
            f"{quantidade:>8,} "
            f"({percentual:6.2f}%) {barra}"
        )

    # =================================================================
    # 7. ANÁLISE DOS EMPATES
    # =================================================================

    print("\n")
    print("=" * 100)
    print("ANÁLISE DOS DESEMPATES")
    print("=" * 100)

    percentual_empates = (
        total_empates / total_simulado * 100
    )

    print(
        f"\nTotal de empates: {total_empates:,}".replace(",", ".")
    )

    print(
        f"Percentual de empates: {percentual_empates:.2f}%"
    )

    print("\nEMPATES MAIS FREQUENTES")

    if empates_por_tipo:

        for tipo, quantidade in empates_por_tipo.most_common(5):

            combinacao = tuple(tipo.split(" + "))
            vencedor = REGRAS_DESEMPATE[combinacao]

            print(
                f"  {tipo:<18} -> "
                f"{quantidade:>7,} ocorrências "
                f"(Carta entregue: {vencedor})"
            )

    else:
        print("  Nenhum empate foi observado.")

    # =================================================================
    # 8. VITÓRIAS DE PERFIS FORA DO EMPATE
    # =================================================================

    total_fora_empate = sum(
        vencedores_fora_empate.values()
    )

    print("\nVITÓRIAS DE PERFIS QUE NÃO ESTAVAM EMPATADOS")

    for perfil in SIGLAS_PERFIS:

        quantidade = vencedores_fora_empate[perfil]

        if quantidade:
            percentual = quantidade / total_simulado * 100

            print(
                f"  {PERFIS[perfil]:<38} "
                f"{quantidade:>7,} "
                f"({percentual:.2f}%)"
            )

    print(
        f"\nTotal de vitórias fora do empate: "
        f"{total_fora_empate:,}".replace(",", ".")
    )

    print("\n")
    print("=" * 100)
    print("SIMULAÇÃO CONCLUÍDA")
    print("=" * 100)


# =====================================================================
# 9. EXECUÇÃO
# =====================================================================

if __name__ == "__main__":

    emular_pessoas_reais(
        qtd_usuarios=10000,
        seed=None,
    )
