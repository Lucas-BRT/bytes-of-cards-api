# BytesOfCards — Documento de Especificação

> Projeto acadêmico de um jogo de cartas web voltado ao ensino de conversão entre bases numéricas (decimal ↔ binário). Este documento consolida as decisões tomadas até o momento sobre o MVP.

---

## 1. Visão geral

- **Nome:** BytesOfCards
- **Tema:** Tecnológico (a ser detalhado pelo time de design)
- **Objetivo pedagógico:** Ensinar conversão entre base decimal e base binária de forma lúdica.
- **Plataforma:** Web
- **Escopo MVP:** Single-player (modo história + modo livre)
- **Público-alvo:** Estudantes do ensino médio, com possibilidade de atender também alunos do 9º ano do ensino fundamental.

> Como o público majoritário tem 13+ anos, a LGPD trata como adolescente, não como criança — ver seção 11.

---

## 2. Objetivo do jogo

O jogador recebe um **número-alvo** (target) e deve baixar as cartas certas, cujos valores são potências de 2, para formar esse número. Exemplo: target 10 → precisa baixar as cartas 2 e 8 (pois 10 = 2 + 8 = `1010₂`).

A ordem em que as cartas são baixadas é irrelevante. O que importa é que o **conjunto** de cartas baixadas corretamente some o target.

---

## 3. Componentes e estado da partida

### 3.1 Baralho

- Composto por todas as **potências de 2 menores que o target**, sem cópias (cada carta é única no deck).
- Exemplo: target 10 → deck = {1, 2, 4, 8}. Das quatro, apenas 2 e 8 fazem parte do target; 1 e 4 são distratores.

### 3.2 Zonas

- **Deck** — pilha de compra, embaralhada pelo servidor.
- **Mão** — cartas disponíveis para o jogador usar.
- **Zona ativa** — cartas que o jogador já baixou corretamente (compõem o target parcialmente formado).
- **Descarte** — cartas removidas da partida (descartadas voluntariamente ou baixadas de forma incorreta).

### 3.3 Estado inicial

| Recurso | Valor inicial |
|---|---|
| Pontos de Vida (HP) | 3 |
| Cartas na mão | 1 |
| Tamanho máximo da mão | Igual ao tamanho do deck (sem limite prático no MVP) |

> **Pontos de Energia:** mecânica removida do MVP por simplificação. Pode ser reintroduzida em iteração futura se o balanceamento indicar necessidade de uma camada adicional de decisão.

---

## 4. Fluxo de turno

| Fase | Descrição | Ações disponíveis |
|---|---|---|
| **Compra** | O jogador saca 1 carta do topo do deck. | `drawCard()` |
| **Principal** | O jogador pode baixar cartas na zona ativa ou descartar cartas da mão. | `dropCard(cardId)`, `discardCard(cardId)` |
| **Fim** | Resolução de efeitos e atualização de pontuação. | `endTurn()` |

---

## 5. Condições de vitória e derrota

- **Vitória:** O conjunto de cartas baixadas na zona ativa soma exatamente o target.
- **Derrota por HP:** Pontos de Vida chegam a 0.
- **Derrota por impossibilidade:** Não há mais cartas no deck nem na mão que possam completar o target. Essa condição é verificada automaticamente pelo servidor a cada jogada.

### Resolução de erros

- Baixar uma carta que **não** faz parte do target → a carta vai para o descarte e o jogador perde **1 HP** + penalidade de pontuação.
- Descartar uma carta que fazia parte do target → partida pode se tornar impossível (derrota por impossibilidade). Consequência natural, sem penalidade adicional.

---

## 6. Pontuação

Fórmula inicial (sujeita a balanceamento após playtests):

```
score = 100 × num_bits_do_nivel
      + 50  × hp_restante
      + max(0, 300 - tempo_segundos)
      - 40  × cartas_erradas_baixadas
      - 10  × cartas_descartadas_incorretamente
```

- O componente de tempo é um **bônus decrescente**, não uma penalidade ameaçadora: um jogador lento ainda pontua positivamente por acertar.
- Os coeficientes devem ficar em tabela de configuração no banco (ou JSONB), não hardcoded, para permitir ajustes sem redeploy.

---

## 7. Progressão de níveis

Progressão linear com base no número de bits do target. Sugestão inicial para o MVP:

| Nível | Bits | Faixa de target | Deck | Foco pedagógico |
|---|---|---|---|---|
| 1 (Tutorial) | 2 | 1–3 | {1, 2} | Aprender a mecânica |
| 2 | 3 | 4–7 | {1, 2, 4} | Decomposição simples |
| 3 | 4 | 8–15 | {1, 2, 4, 8} | Introdução de distratores |
| 4 | 5 | 16–31 | {1, 2, 4, 8, 16} | Múltiplos distratores |
| 5 | 6 | 32–63 | {1, 2, 4, 8, 16, 32} | Consolidação |

**Regra de desbloqueio:** acertar 3 partidas consecutivas com pelo menos 2 HP restantes libera o próximo nível.

**Variação intra-nível:** dentro de um mesmo nível, os targets devem ser sorteados com quantidade variada de bits ligados, para expor o aluno a diferentes padrões de decomposição.

---

## 8. Tutorial

- Target fixo **3** (`11₂`), com deck = {1, 2}.
- Não há distratores, então a criança não pode errar ao descartar.
- Objetivo do tutorial: ensinar os gestos básicos (sacar, baixar, descartar, encerrar turno) e o conceito de ler o target em binário.

---

## 9. Feedback pedagógico

Os textos abaixo devem ficar no catálogo estático e ser editáveis pelo time pedagógico sem necessidade de deploy.

- **Ao baixar carta correta:** animação de confirmação + o target é exibido em binário com o bit correspondente se "acendendo".
- **Ao baixar carta errada:** mensagem contextual explicando por quê.
  - Ex.: baixou 16 no target 12 → "16 sozinho já é maior que 12, não pode caber".
  - Ex.: baixou 4 no target 10 → "10 em binário é `1010`, e o bit do valor 4 está desligado".
- **Ao descartar:** nada (é uma decisão legítima).
- **Ao fim da partida:** tela de resumo mostrando a decomposição binária completa do target, comparando com as cartas efetivamente baixadas.

---

## 10. Arquitetura técnica

### 10.1 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React (desenvolvido por outro time) |
| Backend | A definir — recomendação: Node.js + NestJS (TypeScript) ou Python + FastAPI |
| Banco de dados | PostgreSQL |
| Transporte | HTTPS / REST (sem WebSocket no MVP, pois é single-player) |

### 10.2 Autoridade do servidor

Toda lógica de jogo é resolvida no servidor. O cliente apenas reflete o estado e envia ações. Consequências:

- O **embaralhamento do deck** ocorre no servidor no início da partida, com uma `seed` registrada para auditabilidade.
- A **validação de jogadas** (se a carta pertence ao target, se há HP suficiente, etc.) é feita exclusivamente no servidor.
- O cliente pode aplicar previsões locais ("optimistic updates") para responsividade, corrigindo o estado ao receber a confirmação do servidor.

### 10.3 Persistência por event log

A persistência é feita **registrando cada ação** como um evento imutável, em vez de sobrescrever um estado único. O estado atual da partida é uma projeção calculada a partir dos eventos.

Benefícios diretos:

- Reconstrução de partida a partir do log em caso de reconexão.
- Replay e depuração a partir do histórico.
- Analytics pedagógico sobre o comportamento do jogador.

### 10.4 Idempotência

Toda ação recebida do cliente carrega um `client_action_id` único. O servidor registra esse ID junto ao evento e rejeita duplicatas. Isso protege contra reenvios causados por falha de rede.

### 10.5 Partidas não finalizadas

Como o MVP é single-player via REST, não há "sala" sendo mantida na memória: o servidor não gasta recursos mantendo partidas abertas. Uma partida interrompida é simplesmente retomada a partir do log na próxima requisição do cliente.

---

## 11. Modelagem de dados (alto nível)

A modelagem separa dados **estáticos** (catálogo de conteúdo do jogo) de dados **dinâmicos** (atividade do jogador).

### 11.1 Dados estáticos (catálogo)

- `cartas_catalogo` — definição das cartas (valor, representação binária, arte, texto pedagógico).
- `niveis` — configuração da progressão (bits, faixa de target, deck).
- `mensagens_pedagogicas` — textos de feedback contextual.
- `configuracao_pontuacao` — coeficientes da fórmula de pontuação.

Características: volume baixo, leitura muito mais frequente que escrita, editado pelo time pedagógico. Candidato a **cache em memória** ou Redis.

### 11.2 Dados dinâmicos (transacional)

- `usuarios` — credenciais e perfil.
- `partidas` — metadados (nível, target, status, início, fim).
- `jogadas` — event log append-only.
- `progresso_usuario` — nível atual, partidas jogadas, estatísticas consolidadas.
- `aceites_termos` — registro de aceite de Termos e Política (ver seção 13).

Características: crescimento rápido, escrita intensa, indexação por `usuario_id` e `partida_id`.

### 11.3 Estrutura do event log (tabela `jogadas`)

```
id, partida_id, usuario_id, client_action_id,
tipo (SACAR | BAIXAR | DESCARTAR | FIM_TURNO),
carta_id, resultado (ACERTO | ERRO | NEUTRO),
payload (jsonb com snapshot da carta no momento),
tempo_desde_ultima_jogada_ms,
ocorrida_em
```

Com essa tabela, é possível responder sem mudança de schema perguntas como: "qual carta é mais confundida no nível 3?", "tempo médio entre sacar e baixar uma carta correta?", "qual target tem maior taxa de erro?".

### 11.4 Versionamento de catálogo

Ao registrar uma jogada, o `payload` JSONB guarda um **snapshot** da definição da carta no momento. Isso garante que análises históricas não quebrem se o catálogo for alterado posteriormente.

---

## 12. Autenticação e segurança

### 12.1 Cadastro e login

- Credenciais: **username + senha** (modelo Pokémon Showdown).
- **Email opcional** no cadastro, usado exclusivamente para recuperação de senha. A tela de cadastro deve deixar claro que, sem email, a recuperação é impossível.
- Não há cadastro de responsável no MVP (público majoritariamente adolescente).

### 12.2 Armazenamento de senha

- **Argon2id** (preferencial) ou **bcrypt com cost ≥ 12**.
- Senha nunca é armazenada ou logada em texto plano.

### 12.3 Outras medidas de segurança

- TLS em toda comunicação.
- Rate limiting no endpoint de login para dificultar brute force.
- Sessões/tokens com expiração e possibilidade de revogação.
- Validação rigorosa de entrada no servidor (prevenção a injeção e manipulação de estado de partida).
- Logs estruturados de eventos de segurança (tentativas de login, ações suspeitas).

### 12.4 Verificação de idade

- Campo de idade ou ano escolar no cadastro.
- Se o usuário se declarar menor de 13 anos, o cadastro é **bloqueado no MVP** (ou, em iteração futura, redirecionado para um fluxo de consentimento parental).

---

## 13. LGPD e privacidade

> *Aviso:* esta seção reflete um entendimento prático aplicado a um projeto acadêmico. Para evolução a produto, recomenda-se consulta a profissional da área jurídica e à documentação da ANPD.

### 13.1 Documentos obrigatórios

- **Política de Privacidade** — acessível antes do cadastro. Deve descrever:
  - Que dados são coletados (username, senha com hash, email opcional, IP, logs de partida, dados pedagógicos).
  - Finalidades de cada tipo de dado.
  - Prazo de retenção.
  - Com quem são compartilhados (ninguém, no MVP).
  - Como o titular exerce os direitos garantidos pela LGPD.
  - Contato do responsável pelo tratamento.
- **Termos de Uso** — regras de conduta (incluindo restrições de username), limitações de responsabilidade.

### 13.2 Aceite versionado

Tabela `aceites_termos` com `usuario_id`, `versao_termos`, `versao_privacidade`, `aceito_em`, `ip`. Toda vez que um documento for atualizado, o usuário precisa aceitar novamente no próximo login.

### 13.3 Bases legais

- **Execução de contrato:** operação do jogo (cadastro, autenticação, estado de partida).
- **Consentimento:** rastreio de progresso pedagógico e analytics.

### 13.4 Direitos do titular

Canal de contato (email) para que o usuário possa solicitar: acesso aos seus dados, correção, exclusão da conta. No MVP, o atendimento manual via email é aceitável.

### 13.5 Retenção

- Contas com **12 meses de inatividade** têm dados eliminados automaticamente (valor a validar).
- Exclusão solicitada pelo usuário é honrada em prazo razoável, com remoção efetiva (não apenas soft delete).

### 13.6 Dados sensíveis

Não são coletados dados sensíveis (saúde, religião, etnia, orientação, biometria, etc.).

---

## 14. Roadmap pós-MVP

Itens conscientemente deixados fora do escopo do MVP:

- **Multiplayer em tempo real** (2–4 jogadores, WebSocket, matchmaking).
- **Mecânica de Pontos de Energia** (sacar cartas extras, reviver cartas descartadas).
- **Dashboard para professores**, com criação de turmas e acompanhamento de alunos.
- **Consentimento parental** para usuários menores de 13 anos.
- **Progressão adaptativa** (algoritmo que ajusta dificuldade conforme desempenho individual).
- **Níveis com mais de 6 bits** (extensão da progressão atual).

---

## 15. Questões em aberto

Itens que ainda precisam de decisão antes da implementação começar:

- Escolha definitiva do framework de backend (NestJS vs FastAPI).
- Definição visual e narrativa do tema tecnológico.
- Valores finais dos coeficientes de pontuação (exige playtests).
- Prazo exato de retenção por inatividade.
- Se haverá modo história com enredo linear ou apenas progressão de níveis.
