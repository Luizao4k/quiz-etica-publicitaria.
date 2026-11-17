
"""
CONFIGURAÇÃO CENTRAL DO QUIZ
Oráculo da Ética Publicitária

Este arquivo centraliza as configurações utilizadas pelos scripts:
- analise_probabilidades.py
- simulacao_comportamental.py

Altere as regras de desempate ou os pesos somente aqui.
Os demais scripts importarão estas configurações.
"""

# =====================================================================
# 1. PERFIS
# =====================================================================

PERFIS = {
    "A": "A — Arco e Flecha (Execução)",
    "B": "B — Espelho (Autoconfiança)",
    "C": "C — Balança (Equilíbrio)",
    "D": "D — Espada (Justiça)",
}

SIGLAS_PERFIS = tuple(PERFIS.keys())


# =====================================================================
# 2. CONFIGURAÇÃO DA PONTUAÇÃO
# =====================================================================

TOTAL_QUESTOES = 13

QUESTOES_PONDERADAS = {8, 10, 11}

ALTERNATIVAS_PONDERADAS = {"B", "D"}

PESO_NORMAL = 1

PESO_ESPECIAL = 2


# =====================================================================
# 3. REGRAS DE DESEMPATE
#
# A chave representa os perfis que obtiveram a maior pontuação.
# O valor representa o perfil escolhido como vencedor.
#
# ATENÇÃO:
# O vencedor não precisa necessariamente estar entre os empatados.
# =====================================================================

REGRAS_DESEMPATE = {

    # Empates duplos
    ("A", "B"): "A",
    ("A", "C"): "C",
    ("A", "D"): "C",
    ("B", "C"): "C",
    ("B", "D"): "C",
    ("C", "D"): "D",

    # Empates triplos
    ("A", "B", "C"): "C",
    ("A", "B", "D"): "C",
    ("A", "C", "D"): "C",
    ("B", "C", "D"): "D",

    # Empate quádruplo
    ("A", "B", "C", "D"): "C",
}


# =====================================================================
# 4. VALIDAÇÃO DA CONFIGURAÇÃO
# =====================================================================

def validar_configuracao():
    """
    Verifica a consistência das configurações compartilhadas.

    Impede que os scripts sejam executados com:
    - quantidade inválida de questões;
    - questões ponderadas inexistentes;
    - alternativas ponderadas inválidas;
    - regras de desempate incompletas;
    - vencedores inexistentes.
    """

    if TOTAL_QUESTOES <= 0:
        raise ValueError("O total de questões deve ser positivo.")

    if not QUESTOES_PONDERADAS.issubset(
        set(range(1, TOTAL_QUESTOES + 1))
    ):
        raise ValueError(
            "Existem questões ponderadas fora do intervalo configurado."
        )

    if PESO_NORMAL <= 0 or PESO_ESPECIAL <= 0:
        raise ValueError("Os pesos devem ser positivos.")

    if not ALTERNATIVAS_PONDERADAS.issubset(
        set(SIGLAS_PERFIS)
    ):
        raise ValueError(
            "Existe uma alternativa ponderada que não corresponde a um perfil."
        )

    combinacoes_esperadas = set()

    def gerar_combinacoes(inicio, atual, tamanho):
        if len(atual) == tamanho:
            combinacoes_esperadas.add(tuple(atual))
            return

        for indice in range(inicio, len(SIGLAS_PERFIS)):
            gerar_combinacoes(
                indice + 1,
                atual + [SIGLAS_PERFIS[indice]],
                tamanho,
            )

    for tamanho in range(2, len(SIGLAS_PERFIS) + 1):
        gerar_combinacoes(0, [], tamanho)

    regras_normalizadas = {
        tuple(sorted(combinacao)): vencedor
        for combinacao, vencedor in REGRAS_DESEMPATE.items()
    }

    combinacoes_cadastradas = set(regras_normalizadas)

    faltantes = combinacoes_esperadas - combinacoes_cadastradas
    excedentes = combinacoes_cadastradas - combinacoes_esperadas

    if faltantes:
        raise ValueError(
            f"Regras de desempate ausentes: {sorted(faltantes)}"
        )

    if excedentes:
        raise ValueError(
            f"Combinações de desempate inválidas: {sorted(excedentes)}"
        )

    for combinacao, vencedor in regras_normalizadas.items():
        if vencedor not in PERFIS:
            raise ValueError(
                f"Vencedor inválido para {combinacao}: {vencedor}"
            )

    return True


# =====================================================================
# 5. EXECUÇÃO DIRETA PARA CONFERÊNCIA
# =====================================================================

if __name__ == "__main__":

    validar_configuracao()

    print("=" * 65)
    print("CONFIGURAÇÃO DO ORÁCULO DA ÉTICA PUBLICITÁRIA")
    print("=" * 65)

    print(f"\nTotal de questões: {TOTAL_QUESTOES}")
    print(f"Questões ponderadas: {sorted(QUESTOES_PONDERADAS)}")
    print(f"Alternativas ponderadas: {sorted(ALTERNATIVAS_PONDERADAS)}")
    print(f"Peso normal: {PESO_NORMAL}")
    print(f"Peso especial: {PESO_ESPECIAL}")

    print("\nPERFIS:")
    for sigla, nome in PERFIS.items():
        print(f"  {nome}")

    print("\nREGRAS DE DESEMPATE:")
    for combinacao, vencedor in REGRAS_DESEMPATE.items():
        empatados = " + ".join(combinacao)
        print(f"  {empatados} -> {vencedor}")

    print("\nConfiguração validada com sucesso.")
