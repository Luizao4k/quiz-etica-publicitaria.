# Quiz de Ética Publicitária

Aplicação web de perguntas e respostas sobre ética publicitária, desenvolvida com React e TypeScript. O projeto busca organizar as situações apresentadas ao usuário e identificar seu perfil predominante com base nas escolhas realizadas durante o questionário.

## Objetivo

Desenvolver uma aplicação interativa que apresente situações relacionadas à ética publicitária, registre as respostas e calcule o perfil resultante de acordo com as opções selecionadas.

O projeto também tem como objetivo aplicar boas práticas de desenvolvimento de software, priorizando organização, legibilidade, desacoplamento e facilidade de manutenção.

## Funcionalidades

- [x] Estrutura inicial do projeto.
- [x] Modelagem das entidades e contratos do domínio.
- [x] Carregamento dos dados do questionário por meio de um repositório JSON.
- [x] Registro e atualização de respostas.
- [x] Cálculo do resultado com suporte a empates entre perfis.
- [x] Testes automatizados dos casos de uso e do repositório.
- [ ] Implementação da interface do questionário.
- [ ] Navegação entre as situações e indicador de progresso.
- [ ] Apresentação visual do resultado.
- [ ] Reinício completo do questionário.
- [ ] Testes do fluxo completo da aplicação.

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
│   └── use-cases/
│       ├── CalcularResultado.ts
│       ├── CarregarQuiz.ts
│       └── RegistrarResposta.ts
├── data/
│   └── quiz-data.json
├── domain/
│   ├── entities/
│   └── repositories/
├── infrastructure/
│   └── repositories/
│       └── QuizRepositoryJson.ts
├── presentation/
├── App.tsx
├── App.css
├── index.css
└── main.tsx

tests/
├── application/
│   └── use-cases/
└── infrastructure/
    └── repositories/
```

### Responsabilidade das camadas

- **Domain:** define os conceitos centrais do questionário, suas entidades e os contratos dos repositórios.
- **Application:** implementa os casos de uso, como carregar o questionário, registrar respostas e calcular o resultado.
- **Infrastructure:** implementa o acesso aos dados, atualmente utilizando um arquivo JSON.
- **Presentation:** concentra a interface e a interação com o usuário.

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

Execute o comando de testes configurado no `package.json`. O script exato depende da configuração atual do projeto.

### 5. Gerar a versão de produção

```bash
npm run build
```

Os arquivos gerados serão disponibilizados no diretório `dist/`.

## Testes e qualidade

Os testes automatizados estão organizados de acordo com as camadas da aplicação.

Os principais comportamentos verificados incluem:

- Registro de respostas por situação.
- Substituição de uma resposta anterior.
- Validação de opções pertencentes à situação correspondente.
- Cálculo da pontuação por perfil.
- Tratamento de empates.
- Validação de referências a perfis inexistentes.
- Carregamento dos dados do questionário.

## Status do projeto

**Em desenvolvimento.**

A primeira etapa concentra-se na estruturação do domínio, nos casos de uso, no repositório de dados e nos testes automatizados. As próximas etapas priorizam a construção da interface e a integração do fluxo completo do questionário.

## Licença

Licença ainda não definida.
