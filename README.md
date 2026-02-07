# Selah | Jornada de Reflexão Espiritual

> "Pausa. Pense nisso."

## 📖 Sobre o Projeto (Conceito e Propósito)

O **Selah** é uma aplicação web progressiva (PWA) nascida da necessidade de transformar a anotação passiva de cultos e ministrações em uma jornada ativa de reflexão e consolidação espiritual.

Originalmente concebida a partir de uma ferramenta de estudos seculares ("Ciclo SMART"), esta aplicação foi refatorada para atender a um propósito religioso e devocional. O objetivo central é fornecer uma ferramenta para organizar anotações feitas durante os cultos na igreja, permitindo que o usuário reflita sobre as ministrações do pastor ou pastora de forma estruturada.

**A Filosofia do Motor (Engine):**
Diferente de listas de tarefas comuns, o Selah utiliza um **Sistema de Repetição Espaçada (SRS)** simplificado. Ao registrar uma nova ministração, o sistema cria automaticamente um ciclo de "retornos" para garantir que a mensagem não seja esquecida:
1.  **Registro Inicial (Origem):** O dia da ministração.
2.  **Ciclo de 24 Horas:** Para revisão imediata no dia seguinte.
3.  **Ciclo de 7 Dias:** Para relembrar a mensagem uma semana depois.
4.  **Ciclo de 30 Dias:** Para consolidação mensal.

**Identidade Visual e Funcional:**
A interface foge da estética de produtividade agressiva (cores vibrantes, cronômetros, gamificação) e adota uma postura sóbria e serena (tons de pedra, âmbar e branco), propícia para leitura e oração. O foco não é "atacar" conteúdo, mas "refletir" sobre ele.

---

## 🚀 Funcionalidades Principais

* **Motor de Ciclos Automáticos:** Gera 3 cards de revisão futuros automaticamente ao criar uma nova reflexão.
* **Radar Espiritual (Heatmap):** Um gráfico visual de 30 dias que mostra a constância das reflexões, oferecendo feedback visual sem a pressão de "metas de produtividade".
* **Kanban Temporal:** Organização dos cards em três colunas lógicas:
    * *Passados:* O que ficou pendente.
    * *Hoje:* O foco devocional do dia.
    * *Jornada Futura:* O que está programado.
* **Anexos Inteligentes:**
    * **Upload de HTML:** Capacidade de carregar resumos formatados em HTML e visualizá-los dentro da aplicação.
    * **Links Externos:** Integração rápida com Google Drive, Notion ou vídeos do YouTube.
* **Sincronização na Nuvem:** Utiliza Google Firebase para manter os dados salvos e sincronizados entre dispositivos (Autenticação + Realtime Database).
* **Progressive Web App (PWA):** Pode ser instalado no celular como um aplicativo nativo.

---

## 📂 Estrutura de Arquivos (Guia Técnico)

Abaixo, uma descrição do que cada arquivo faz, para facilitar futuras manutenções:

### Camada Visual (Frontend)
* **`index.html`**: A estrutura da página. Contém o cabeçalho, as colunas do Kanban, os modais (janelas) de novo estudo e o código de inicialização do Firebase.
* **`style.css`**: O design. Define as cores (paleta Stone/Amber), fontes, animações suaves e a customização das barras de rolagem.
* **`view.js`**: O "desenhista". É responsável por pegar os dados e criar o HTML dos cartões, pintar o Radar (Heatmap) e controlar o que aparece na tela.

### Camada Lógica (Backend Local)
* **`core.js`**: O "cérebro". Gerencia o banco de dados local (`store`), salva as informações no navegador/nuvem e contém as configurações globais.
* **`engine.js`**: O "motor". Contém a regra de negócio exclusiva do Selah: calcula as datas futuras (24h, 7d, 30d) e gera os IDs únicos para cada reflexão.
* **`controller.js`**: O "gerente". Conecta os cliques do usuário (botões, formulários) com a lógica do sistema. Ele diz para o `engine` criar o ciclo e para a `view` atualizar a tela.
* **`fileManager.js`**: O "bibliotecário". Cuida exclusivamente do upload, leitura e abertura dos arquivos de resumo (`.html`) anexados aos cards.

### Infraestrutura
* **`sw.js` (Service Worker)**: Permite que o site funcione offline e seja instalável.
* **`manifest.json`**: Informações para o navegador tratar o site como um App (ícone, nome, cor de fundo).

---

## ⚙️ Como Configurar e Rodar

Como o projeto é feito em **Vanilla JS** (Javascript puro), ele não precisa de instalação complexa (npm/node), mas requer um servidor local devido às políticas de segurança do navegador para módulos JS.

1.  **Firebase:**
    * Abra o arquivo `index.html`.
    * Procure a constante `firebaseConfig`.
    * **Importante:** Você deve substituir as chaves ali presentes pelas chaves do seu próprio projeto no Console do Firebase, caso mude de projeto.

2.  **Rodando Localmente:**
    * Se usar VS Code: Instale a extensão "Live Server". Clique com o botão direito em `index.html` e escolha "Open with Live Server".

---

## 🤖 Contexto para IA (Prompt Booster)

> **Dica:** Se você for pedir para uma IA (como o Gemini ou ChatGPT) fazer alterações neste projeto no futuro, copie e cole o bloco abaixo no início da conversa. Isso dará a ela todo o contexto técnico necessário.

```text
CONTEXTO TÉCNICO DO PROJETO "SELAH":

ESTACK TECNOLÓGICO:
- Frontend: HTML5, TailwindCSS (via CDN), Vanilla JS (ES6 Modules).
- Backend/Persistência: LocalStorage (cache) + Firebase Realtime Database.
- Auth: Firebase Authentication.
- Arquitetura: MVC Simplificado (View.js, Controller.js, Core.js/Model).

REGRA DE NEGÓCIO (ENGINE):
- O sistema é um gerenciador de reflexões espirituais baseado em SRS (Spaced Repetition).
- Ao criar um card "Origem", o Engine gera automaticamente 3 revisões filhas:
  1. +1 dia (Label: 24h)
  2. +7 dias (Label: 7d)
  3. +30 dias (Label: 30d)
- Não existe conceito de "concluir disciplina", apenas marcar a reflexão do dia como feita.
- O sistema suporta anexo de strings HTML longas (resumos) diretamente no objeto JSON do card.

DESIGN SYSTEM:
- Cores: Stone (Neutros), Amber (Destaque), Emerald (Anexos).
- Estilo: Minimalista, serifado para títulos, focado em leitura.
