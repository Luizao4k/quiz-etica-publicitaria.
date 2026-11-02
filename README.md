# Quiz de Ética Publicitária

Aplicação web de perguntas e respostas sobre ética publicitária, desenvolvida com React e TypeScript. O projeto busca organizar as situações apresentadas ao usuário e identificar seu perfil predominante com base nas escolhas realizadas durante o questionário.

## Objetivo

Desenvolver uma aplicação interativa que apresente situações relacionadas à ética publicitária, registre as respostas e calcule o perfil resultante de acordo com as opções selecionadas.

O projeto também tem como objetivo aplicar boas práticas de desenvolvimento de software, priorizando organização, legibilidade, desacoplamento e facilidade de manutenção.

## Funcionalidades

- [x] Estrutura inicial do projeto.
- [x] Modelagem das entidades e contratos do domínio.
- [x] Carregamento dos dados do questionário a partir de três arquivos JSON (perfis, referências teóricas e situações).
- [x] Registro de respostas por identificador, imutáveis depois de registradas.
- [x] Cálculo do resultado com suporte a empates entre perfis.
- [x] Testes automatizados da tentativa, dos casos de uso e do repositório.
- [x] Navegação entre as situações (avanço automático após a escolha e consulta de respostas anteriores) e indicador de progresso.
- [x] Apresentação visual do resultado: carta virável com mão apontando (RF03), leitura complementar em acordeão (RF04) e balão de referências teóricas (RF05).
- [x] Reinício completo do questionário.
- [x] Testes do fluxo completo da aplicação.

> As funcionalidades concluídas referem-se à camada de aplicação e à infraestrutura já implementadas. A interface visual completa ainda está em desenvolvimento.

## Perfis de personalidade

O questionário trabalha com quatro perfis:

| Perfil | Carta | Característica |
|---|---|---|
| `ARCO_E_FLECHA` | Arco e Flecha | Execução |
| `ESPELHO` | Espelho | Autoconfiança |
| `BALANCA` | Balança | Equilíbrio |
| `ESPADA` | Espada | Justiça |

O resultado é calculado a partir dos perfis associados às opções escolhidas pelo usuário. Em caso de empate, o sistema preserva todos os perfis empatados, evitando escolher arbitrariamente um único resultado.

## Conteúdo do quiz (arquivos JSON)

Os textos e as regras de pontuação ficam em `src/data/`, separados do código:

| Arquivo | Conteúdo |
|---|---|
| `perfil.json` | Os quatro perfis: título, subtítulo, resumo e os dez tópicos complementares de cada um. |
| `referencia.json` | As referências teóricas: perfil, expressão a destacar e as obras (autor e título). |
| `situacoe.json` | As situações, com suas quatro opções e o `perfilAlvo` de cada uma. |

Regras para editar `referencia.json`:

- A `expressao` deve aparecer nos tópicos do perfil indicado em `perfilId`. A busca ignora maiúsculas e minúsculas, considera apenas palavras inteiras (`outro` não casa com `outros`) e destaca todas as ocorrências.
- Se duas expressões se sobrepõem no mesmo trecho, prevalece a que começa primeiro e, com o mesmo início, a mais longa.
- Uma expressão que não aparece nos tópicos do perfil não é exibida. Os testes de `QuizRepositoryJson` avisam quando isso acontece, então execute-os depois de alterar qualquer arquivo de conteúdo.
- Mantenha os identificadores (`id`, `perfilId`, `perfilAlvo`): a pontuação, as imagens das cartas e os testes dependem deles.

## Tecnologias

- **React** — construção da interface.
- **TypeScript** — tipagem estática.
- **Vite** — ambiente de desenvolvimento e build.
- **JSON** — armazenamento inicial dos dados do questionário.
- **Testes automatizados** — validação dos casos de uso e do repositório.

## Arquitetura do projeto

O código está organizado em camadas, separando as regras de negócio, os casos de uso, o acesso aos dados e a apresentação.

```text
src/
├── application/
│   ├── services/
│   │   └── prepararTentativa.ts
│   ├── use_cases/
│   │   ├── CalcularResultado.ts
│   │   └── CarregarQuiz.ts
│   └── utils/
│       └── embaralhar.ts
├── data/
│   ├── perfil.json
│   ├── referencia.json
│   └── situacoe.json
├── domain/
│   ├── entities/
│   │   ├── Detalhe.ts
│   │   ├── Opcao.ts
│   │   ├── Personalidade.ts
│   │   ├── Quiz.ts
│   │   ├── Referencia.ts
│   │   ├── Situacao.ts
│   │   └── Tentativa.ts
│   └── services/
│       ├── montarDetalhe.ts
│       └── montarPerfil.ts
├── infrastructure/
│   └── repositories/
│       ├── QuizRepository.ts
│       └── QuizRepositoryJson.ts
├── presentation/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   └── styles/
├── App.tsx
├── App.css
├── index.css
└── main.tsx

tests/
├── application/
├── domain/
└── infrastructure/
```

### Responsabilidade das camadas

- **Domain:** define os conceitos centrais do questionário e suas entidades. A `Tentativa` representa uma execução do quiz e concentra as regras de resposta e navegação: a resposta registrada não pode ser alterada, só se avança depois de responder, é possível voltar para consultar respostas anteriores e avançar a partir da última situação respondida encerra a tentativa. Os serviços `montarPerfil` e `montarDetalhe` associam a cada perfil apenas as suas referências e localizam, nos tópicos, as expressões que as possuem.
- **Application:** implementa os casos de uso e serviços, como carregar o questionário, preparar a tentativa (com a randomização de situações e alternativas) e calcular o resultado.
- **Infrastructure:** define o contrato `QuizRepository` e implementa o acesso aos dados, atualmente reunindo os três arquivos JSON de `src/data/` no formato do domínio.
- **Presentation:** concentra a interface e a interação com o usuário. Na tela de resultado, `CartaPerfil` vira ao clique, `TopicosPerfil` mostra os tópicos com as expressões destacadas e o balão de referências, e `MaoApontando` é a dica do primeiro clique.

Essa separação facilita a manutenção e permite substituir implementações de infraestrutura sem espalhar detalhes técnicos pelas regras da aplicação.

## Requisitos

Para executar o projeto localmente, é necessário ter instalado:

- Node.js em uma versão compatível com o Vite utilizado pelo projeto.
- npm, normalmente instalado junto com o Node.js.
- Git, caso queira clonar e versionar o repositório.

## Como executar

### 1. Obter o código

Se o repositório estiver publicado no GitHub:

```bash
git clone https://github.com/Luizao4k/quiz-etica-publicitaria.git
cd quiz-etica-publicitaria
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir a aplicação no navegador.

### 4. Executar os testes

```bash
npm test
```

O comando executa o Vitest em modo de observação. Para uma execução única, por exemplo em integração contínua, use `npx vitest run`.

### 5. Gerar a versão de produção

```bash
npm run build
```

Os arquivos gerados serão disponibilizados no diretório `dist/`.

## Testes e qualidade

Os testes automatizados estão organizados de acordo com as camadas da aplicação.

Os principais comportamentos verificados incluem:

- Registro de respostas por identificador, sempre na situação atual.
- Imutabilidade da resposta registrada, inclusive durante a consulta de situações anteriores.
- Validação de opções pertencentes à situação correspondente.
- Navegação: avançar somente depois de responder, voltar para consulta e encerrar na última situação.
- Preparação da tentativa: todas as situações uma única vez, conteúdo preservado e dados originais intactos.
- Cálculo da pontuação por perfil.
- Tratamento de empates.
- Validação de referências a perfis inexistentes.
- Carregamento dos dados do questionário e integridade dos arquivos JSON: identificadores únicos, dez tópicos por perfil, `perfilAlvo` válido e todas as referências associadas a uma expressão destacada.
- Associação das referências às expressões dos tópicos: palavras inteiras, maiúsculas e minúsculas, ocorrências repetidas e sobreposição.

## Status do projeto

**Em desenvolvimento.**

A primeira etapa concentra-se na estruturação do domínio, nos casos de uso, no repositório de dados e nos testes automatizados. As próximas etapas priorizam a construção da interface e a integração do fluxo completo do questionário.

## Licença

Licença ainda não definida.
