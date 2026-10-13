# ShimoPay Product Spec

Este documento e a especificacao viva do ShimoPay Mobile MVP. Ele deve refletir o que o repositorio prova hoje, separar mocks de implementacao real e registrar decisoes pendentes.

## Legenda

- `CONFIRMED`: existe no codigo, docs, configs ou scripts.
- `INFERRED`: inferido com base no repo, mas nao declarado como fato.
- `PARTIAL/MOCK`: existe como UI, estado local ou simulacao, sem backend/rail real confirmado.
- `CONFIGURABLE`: depende de variavel, config ou ajuste local.
- `PLANNED`: aparece em docs/backlog, mas nao no runtime atual.
- `UNKNOWN`: nao ha evidencia suficiente.
- `NEEDS_SOURCE`: precisa de fonte.
- `NEEDS_DECISION`: depende de decisao humana.

## Produto

`CONFIRMED` ShimoPay e um app mobile-web de demonstracao para pagamentos no Brasil, com fluxos para cliente e lojista. Fontes: `README.md`, `src/App.tsx`, `src/pages/customer/*`, `src/pages/merchant/Dashboard.tsx`.

`CONFIRMED` A experiencia central atual prioriza pagar, receber, usar QR, manter reserva offline simulada, acessar servicos/miniapps e operar um dashboard de lojista. Fontes: `src/pages/customer/Home.tsx`, `src/pages/customer/Scanner.tsx`, `src/pages/customer/QR.tsx`, `src/pages/customer/Offline.tsx`, `src/pages/merchant/Dashboard.tsx`.

`INFERRED` O posicionamento mais forte do MVP e "pagamento local/offline para cliente e lojista pequeno", porque a auditoria existente recomenda foco nesse gesto e as telas recentes reduzem linguagem de blockchain em favor de uso de caixa, QR e reserva offline. Fontes: `docs/SHIMOPAY_REPAGINATION_AUDIT.md`, `src/pages/Landing.tsx`, `src/pages/customer/Home.tsx`.

`NEEDS_DECISION` O wedge comercial oficial ainda precisa ser escolhido: pequeno comercio, consumidor urbano, turista/visitante, offline acceptance ou plataforma de miniapps.

## Personas E Usuarios

| Persona | Status | Evidencia | Descricao |
| --- | --- | --- | --- |
| Cliente local | `CONFIRMED` | `src/pages/customer/Home.tsx`, `src/pages/Auth.tsx` | Usuario que paga, recebe, transfere, acessa carteira, historico e servicos. |
| Lojista | `CONFIRMED` | `src/pages/merchant/Dashboard.tsx`, `src/pages/Auth.tsx` | Operador de caixa/pequeno negocio que gera QR, recebe offline e acompanha vendas. |
| Visitante estrangeiro | `PARTIAL/MOCK` | `src/pages/Onboarding.tsx`, `src/pages/customer/Wallet.tsx` | Usuario que carregaria USDC/USDT e pagaria em BRL; fluxo e conversao sao demonstrativos. |
| Parceiro/miniapp | `PARTIAL/MOCK` | `src/pages/customer/Stores.tsx`, `src/components/miniapps/*` | Apps e parceiros aparecem como catalogo local; relacoes comerciais reais precisam de fonte. |
| Operador interno/admin | `UNKNOWN` | Sem tela/admin encontrada | Nao ha painel interno, backoffice ou suporte operacional confirmado. |

## Jornadas Principais

### 1. Entrar No App

- `CONFIRMED` A raiz `/` abre a LP pública sem onboarding obrigatório. `/landing` é um alias e `/onboarding` permanece acessível. Fonte: `src/App.tsx`.
- `PARTIAL/MOCK` O onboarding simula escolha de carteira, telefone, documento, selfie e conclusao. Fonte: `src/pages/Onboarding.tsx`.
- `PARTIAL/MOCK` A tela de auth aceita login/criacao e permite entrar como cliente demo ou lojista demo via `MockContext`. Fontes: `src/pages/Auth.tsx`, `src/contexts/MockContext.tsx`.

Critérios de aceite atuais:

- A raiz `/` apresenta a LP pública independentemente da flag de onboarding; `/onboarding` permanece uma rota opcional.
- Usuario demo cliente deve navegar para `/customer/home`.
- Usuario demo lojista deve navegar para `/merchant/dashboard`.

### 2. Pagar Como Cliente

- `CONFIRMED` Cliente acessa scanner por `/customer/scanner`. Fonte: `src/App.tsx`.
- `PARTIAL/MOCK` Scanner abre um drawer de pagamento apos temporizador ou modo aproximar, escolhe metodo e pede PIN de 6 digitos. Fonte: `src/pages/customer/Scanner.tsx`.
- `PARTIAL/MOCK` O pagamento debita saldo local e adiciona transacao em memoria. Fonte: `src/contexts/MockContext.tsx`.

Critérios de aceite atuais:

- Confirmar valor com saldo suficiente deve criar transacao local e voltar para home.
- Saldo insuficiente deve exibir erro.
- PIN e biometria sao experiencia visual, nao validacao real.

### 3. Receber/Pagar Offline

- `CONFIRMED` `/customer/qr` tem abas de receber e pagar offline, token rotativo e QR demonstrativo. Fonte: `src/pages/customer/QR.tsx`.
- `CONFIRMED` `/customer/offline` mostra reserva offline, limite visual, fila de sincronizacao e teste de pagamento. Fonte: `src/pages/customer/Offline.tsx`.
- `PARTIAL/MOCK` `DIDHandshake` e comprovante assinado sao simulacoes visuais. Fonte: `src/components/DIDHandshake.tsx`.

Critérios de aceite atuais:

- Reserva pode ser pausada/ativada localmente.
- Teste offline deve alternar estados `idle`, `signing` e `done`.
- Nenhuma liquidacao, assinatura criptografica ou sincronizacao real deve ser assumida sem fonte.

### 4. Operar Como Lojista

- `CONFIRMED` Dashboard de lojista exibe vendas, acoes rapidas, vendas recentes, relatorios, transacoes, ajustes e catalogo. Fonte: `src/pages/merchant/Dashboard.tsx`.
- `PARTIAL/MOCK` Gerar QR, receber offline, relatorios PDF/CSV, cashback, impressora e seguranca de caixa sao UI/simulacao. Fonte: `src/pages/merchant/Dashboard.tsx`.
- `PARTIAL/MOCK` Catalogo integrado usa `ResellerCatalogApp`. Fonte: `src/components/miniapps/ResellerCatalogApp.tsx`.

Critérios de aceite atuais:

- Lojista sem usuario logado deve voltar para `/auth`.
- Recebimento offline deve adicionar transacao recebida local.
- Relatorios devem refletir dados mockados/locais sem prometer export real.

### 5. Usar Servicos/Miniapps

- `CONFIRMED` `/customer/stores` filtra servicos por categoria e busca. Fonte: `src/pages/customer/Stores.tsx`.
- `PARTIAL/MOCK` Alguns miniapps executam pagamentos via `useMock.pay`; outros sao placeholder de abertura. Fontes: `src/components/miniapps/*`.
- `NEEDS_SOURCE` Qualquer relacao real com marcas, prefeituras, SPTrans, governo ou parceiros precisa de fonte.

## Contrato Do MVP De Pagamento

Fonte: `src/domain/ledger.ts` (puro, sem React/localStorage) coberto por `src/domain/__tests__/ledger.test.ts`. Provider React: `src/contexts/MockContext.tsx` (binding + persistencia demo).

- `CONFIRMED` Pagar com saldo suficiente altera saldo e historico de forma previsivel: novo saldo = saldo - valor (centavos normalizados), entrada `sent` prependada, pontos += floor(valor), nivel recalculado.
- `CONFIRMED` Saldo insuficiente, valor invalido (<=0, NaN, Infinity) ou conta ausente NAO alteram estado (retorno imutavel, mesma referencia).
- `CONFIRMED` Recebimento credita saldo e registra entrada `received`; comando invalido mantem estado identico.
- `CONFIRMED` Fidelidade pinada: Bronze < 1000 pts, Prata >= 1000, Ouro >= 3000 (`LOYALTY_TIERS`).
- `MOCK` Saldos iniciais demo: cliente R$ 1.234,56 / lojista R$ 5.430,00 (`DEMO_ACCOUNTS`). Nao sao valores reais.
- Fonte de verdade desta fase: memoria + `localStorage` (`shimo_user`). Backend real permanece `NEEDS_DECISION`.

## Modelo De Dominio

- `CONFIRMED` `src/domain/ledger.ts`: contas, entradas, fidelidade, pay/receive.
- `CONFIRMED` `src/domain/offline.ts`: allowance offline com limites de risco.
- `CONFIRMED` `src/domain/audit.ts`: trilha append-only para acoes de suporte/backoffice.
- Regra: dominio puro e testavel; UI/persistencia ficam em camadas separadas.

## Modelo De Risco Offline (Reserva)

Fonte: `src/domain/offline.ts`, testes em `src/domain/__tests__/offline.test.ts`. Continua SIMULACAO: nao ha assinatura criptografica nem liquidacao real (`NEEDS_SOURCE`).

- Allowance exige identidades (`userDid`, `deviceDid`), teto total positivo, limite por transacao <= teto total, maximo de vouchers >= 1 e validade futura.
- Voucher so e emitido: dentro da validade, <= limite por transacao, <= restante acumulado e abaixo do maximo de transacoes; caso contrario a allowance volta inalterada com motivo (`expired`, `over_per_tx`, `over_remaining`, `over_count`).
- Cada emissao incrementa contador e consumo (sequence = uso n).
- `NEEDS_DECISION` Valores padrao de produto (allowance sugerida na UI: R$ 180) e politica regulatoria seguem pendentes.

## Privacidade E LGPD (Baseline Demo)

Fontes: `src/lib/privacy.ts`, `src/pages/legal/Legal.tsx`, onboarding e perfil.

- `CONFIRMED` Consentimento registrado com versao/timestamp antes de dados de uso (`setConsent`), exigido no fim do onboarding.
- `CONFIRMED` Direitos do titular sobre dados locais: exportar JSON portavel ("Exportar meus dados") e eliminacao definitiva local ("Apagar meus dados") no Perfil → Privacidade e dados.
- `CONFIRMED` Paginas `/privacidade` e `/termos` (rascunho) linkadas na Landing, Onboarding e Perfil.
- `NEEDS_SOURCE` Textos legais finais, DPO/canal real, base legal para rails reais, retencao em backend e RIPD.

## Backoffice/Admin (Demo)

Fontes: `src/pages/admin/Admin.tsx` (`/admin`), `src/lib/adminStore.ts`, `src/domain/audit.ts`.

- `CONFIRMED` Login de operador demo (nome + papel support/risk/admin) em sessionStorage; sem auth real (`NEEDS_DECISION` RBAC de servidor).
- `CONFIRMED` Busca por usuarios, lojistas e transacoes (fontes: mock da sessao + localStorage).
- `CONFIRMED` Acoes registradas em trilha append-only persistida: bloquear/desbloquear (risk/admin), marcar incidente (todos), ajustar limite offline (admin). Bloqueio e override local, nao afeta pagamentos.


## Inventario De Features

| Area | Status | Fonte | Observacao |
| --- | --- | --- | --- |
| App shell mobile | `CONFIRMED` | `src/index.css`, `src/components/shimo/ShimoShell.tsx` | Root limitado a largura mobile. |
| Landing | `CONFIRMED` | `src/pages/Landing.tsx` | Entrada para cliente, lojista e status da rede. |
| Onboarding/KYC | `PARTIAL/MOCK` | `src/pages/Onboarding.tsx` | Sem provedor real. |
| Auth | `PARTIAL/MOCK` | `src/pages/Auth.tsx`, `src/contexts/MockContext.tsx` | Sem Supabase Auth conectado no fluxo. |
| Home cliente | `CONFIRMED` | `src/pages/customer/Home.tsx` | Saldo, pagar, receber, reserva offline, miniapps, atividade. |
| Scanner/PIN | `PARTIAL/REAL` | `src/pages/customer/Scanner.tsx`, `src/lib/webauthn.ts` | Leitura simulada; confirmacao com biometria nativa real (WebAuthn) + fallback PIN demo. |
| QR receber/pagar offline | `CONFIRMED` (QR real) / `SIMULATED` (settlement) | `src/pages/customer/QR.tsx`, `src/components/shimo/ShimoQrCode.tsx` | Matriz QR escaneavel real; conteudo offline continua demonstrativo. |
| BR Code Pix | `CONFIRMED/SIMULATED` | `src/domain/brcode.ts`, `src/lib/pixConfig.ts` | Payload EMV com CRC16 real e testado; pagavel somente com chave Pix real configurada no `/admin`; sem confirmacao automatica (webhook) — provedor pendente. |
| Reserva offline | `PARTIAL/MOCK` | `src/pages/customer/Offline.tsx` | Nao ha assinatura/liquidacao real. |
| Wallet | `PARTIAL/MOCK` | `src/pages/customer/Wallet.tsx` | Saldos USDC/USDT, cartoes e cotacao sao simulados. |
| Historico | `CONFIRMED` | `src/pages/customer/History.tsx`, `src/contexts/MockContext.tsx` | Filtra transacoes mockadas/em memoria. |
| Perfil/seguranca | `PARTIAL/MOCK` | `src/pages/customer/Profile.tsx` | Modo Rua, dispositivos e dark mode sao UI local. |
| Notificacoes | `PARTIAL/MOCK` | `src/pages/customer/Notifications.tsx` | Lista estatica. |
| Dashboard lojista | `PARTIAL/MOCK` | `src/pages/merchant/Dashboard.tsx` | Operacional, mas sem backend real. |
| Shimo Scan | `PARTIAL/MOCK` | `src/pages/Network.tsx` | Transacoes/hash/TPS gerados por random. |
| Supabase | `CONFIGURABLE/PARTIAL` | `src/integrations/supabase/*`, `.env` | Client existe, mas sem tabelas ou uso funcional confirmado. |
| Testes automatizados | `CONFIRMED` | `package.json` (`npm test`), `src/domain/__tests__/*` | Vitest, 24 testes do dominio (ledger, offline, auditoria). |
| Dominio do ledger | `CONFIRMED` | `src/domain/ledger.ts` | Contrato puro pagar/receber/historico testado. |
| Reserva offline (modelo) | `CONFIRMED/SIMULATED` | `src/domain/offline.ts` | Regras de risco testadas; sem assinatura/liquidacao real. |
| Privacidade/LGPD demo | `CONFIRMED` | `src/lib/privacy.ts`, `src/pages/legal/Legal.tsx` | Consentimento, exportar/apagar dados locais, pagamentos legais rascunho. |
| Backoffice admin | `PARTIAL/MOCK` | `src/pages/admin/Admin.tsx`, `src/lib/adminStore.ts` | Busca, acoes e auditoria locais; sem auth/RBAC de servidor. |
| Docker/CI | `UNKNOWN/NOT_IMPLEMENTED` | busca por Docker/CI | Nao foram encontrados arquivos. |

## Nao-Features Atuais

- `NEEDS_SOURCE` Shimo Chain mainnet, TPS real, nodes reais, gas e block hash real.
- `NEEDS_SOURCE` PIX real, boleto real, adquirencia, cartoes reais, KYC real, biometria real e assinatura criptografica real.
- `NEEDS_SOURCE` Parcerias reais com marcas/orgaos listados no marketplace.
- `NEEDS_DECISION` Modelo regulatorio e operacao como instituicao de pagamento, wallet custodial, gateway, adquirente, marketplace ou camada de demonstracao.
- `NEEDS_DECISION` Politica real de chargeback, fraude, limites offline, conciliacao e liquidacao.

## Riscos

- Tecnico: alto acoplamento de UI e estado mockado pode dificultar migracao para backend real.
- Produto: superficie ampla demais pode diluir o loop principal pagar/receber.
- Regulatorio/legal: pagamentos, KYC, cripto, conversao e offline settlement exigem linguagem cautelosa e fonte juridica.
- Comercial: pricing, comprador e canal nao estao declarados.
- Seguranca: auth, PIN, biometria, assinatura e dispositivo confiavel sao demonstrativos.

## Decisoes Pendentes

- `NEEDS_DECISION` Escolher wedge MVP comercial.
- `NEEDS_DECISION` Definir quais claims de blockchain/cripto ficam no MVP.
- `NEEDS_DECISION` Definir se Supabase sera backend principal.
- `NEEDS_DECISION` Definir modelo de dados minimo para usuarios, contas, transacoes, offline vouchers, merchants e miniapps.
- `NEEDS_DECISION` Definir politica de testes antes de evoluir runtime.


## Decisão de apresentação — 14/09/2026

Pagamentos são o ponto de entrada e miniapps permanecem na visão de superapp. Turismo/stablecoins é hipótese de descoberta, não mercado validado. A LP usa largura responsiva; o app mantém o shell mobile. Candidatura, métricas e pendências: `docs/business/icmlab-preparation.md`. Esta atualização não adiciona liquidação financeira ou Solana.
