# ShimoPay Mobile MVP

ShimoPay é um app mobile-first com pagamentos online e autorização offline respaldada por escrow, liquidação Circle USDC na Solana Devnet e Pix Mercado Pago sandbox. Consumidor e lojista têm interfaces próprias; o legado de miniapps permanece em preview.

Status: demo funcional verificada, exclusivamente contas de desenvolvimento/Devnet/sandbox. Não é carteira financeira de produção ou integração bancária live.

## Entrega atual: Mobile + Solana online/offline

[**SPEC.md v2**](SPEC.md) define a demo funcional; [plano D01–D09](docs/plans.md), [progresso](docs/progress.md), [roteiro](docs/DEMO.md) e [entregáveis de negócio](docs/business/DEMO_DELIVERY.md) controlam a execução. O Mobile será a UX principal, integrada ao SDK/backend do `shimopay_solana`. **Integração publicada e testada.** R$25 online/offline, ataques e Pix QR→approved têm evidência em docs/evidence.

## Status Das Claims

- `CONFIRMED`: sustentado por codigo, docs, configs ou scripts deste repo.
- `INFERRED`: inferido a partir do repo, mas nao declarado explicitamente.
- `NEEDS_SOURCE`: precisa de fonte externa ou documento de negocio/produto.
- `NEEDS_DECISION`: depende de decisao humana de produto, negocio, juridico ou operacao.

## Inventário do legado preservado (antes da integração financeira)

- `CONFIRMED` App Vite + React + TypeScript com Tailwind CSS, Shadcn/Radix UI, React Router, React Query e Supabase client configurado. Fontes: `package.json`, `vite.config.ts`, `components.json`, `src/App.tsx`, `src/integrations/supabase/client.ts`.
- `CONFIRMED` Fluxos principais de cliente: onboarding, auth demo, home, scanner, QR para receber/pagar offline, reserva offline, carteira, historico, perfil, notificacoes e servicos. Fontes: `src/App.tsx`, `src/pages/customer/*`, `src/pages/Onboarding.tsx`, `src/pages/Auth.tsx`.
- `CONFIRMED` Fluxo de lojista: dashboard com vendas recentes, gerar QR, receber offline, relatorios, transacoes, ajustes e catalogo integrado. Fonte: `src/pages/merchant/Dashboard.tsx`.
- `CONFIRMED` Miniapps/servicos locais: corrida, comida, bike, rachar conta, metas e catalogo/revenda. Fontes: `src/components/miniapps/*`, `src/pages/customer/Stores.tsx`.
- `PARTIAL/MOCK` Auth, KYC, pagamentos, DID/offline, relatorios, blockchain explorer, conversao USDC/USDT, parceiros e metricas sao simulados ou locais. Fontes: `src/contexts/MockContext.tsx`, `src/components/DIDHandshake.tsx`, `src/pages/Network.tsx`, `src/pages/customer/Offline.tsx`, `src/pages/customer/Wallet.tsx`.
- `CONFIRMED` Persistencia atual usa `localStorage` para usuario/onboarding e parte de lojas/transacoes locais. Fontes: `src/App.tsx`, `src/contexts/MockContext.tsx`, `src/lib/storage.ts`.
- `CONFIRMED` Modelo de dominio puro e testado (ledger pagar/receber/fidelidade, allowance offline com limites de risco, auditoria append-only). Fontes: `src/domain/*`, `src/domain/__tests__/*`.
- `CONFIRMED` Suite de testes Vitest (`npm test`) cobrindo o contrato de pagamento, offline e auditoria.
- `CONFIRMED` Baseline LGPD demo: consentimento no onboarding, exportar/apagar dados locais no perfil e paginas `/privacidade` + `/termos` (rascunho pendente de revisao juridica). Fontes: `src/lib/privacy.ts`, `src/pages/legal/Legal.tsx`.
- `PARTIAL/MOCK` Portal de backoffice `/admin`: operador demo por papel, busca de usuarios/lojistas/transacoes, acoes com trilha de auditoria local, configuracao da chave Pix; sem auth/RBAC de servidor. Fontes: `src/pages/admin/Admin.tsx`, `src/lib/adminStore.ts`.
- `CONFIRMED` QR Code REAL escaneavel em todo o app (lib `qrcode`) e gerador de **BR Code Pix EMV** com CRC16 testado: com uma chave Pix real configurada no `/admin`, os QRs de receber e cobrar sao pagaveis por qualquer banco; com o placeholder, ficam marcados como demonstrativos. Fontes: `src/domain/brcode.ts`, `src/lib/pixConfig.ts`, `src/components/shimo/ShimoQrCode.tsx`.
- `CONFIRMED` Confirmacao de pagamento por biometria nativa do dispositivo via WebAuthn (platform authenticator, user verification obrigatoria), com fallback PIN demo fora de contexto seguro. Fontes: `src/lib/webauthn.ts`, `src/pages/customer/Scanner.tsx`. Nao substitui liveness/KYC (`NEEDS_SOURCE`).
- `CONFIRMED` Supabase esta configurado por variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, mas os tipos gerados nao declaram tabelas publicas e o client nao e usado por outras telas. Fontes: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env`, `supabase/config.toml`.

## Stack

- Frontend: Vite, React 18, TypeScript.
- UI: Tailwind CSS, Shadcn/Radix primitives, Lucide icons, Sonner/toasts.
- Navegacao: React Router DOM.
- Estado: React state/context, TanStack Query provider, `localStorage`.
- Backend/config: Supabase client configurado, sem uso funcional confirmado nas telas atuais.
- Build/dev: Vite, ESLint, TypeScript project references.

## Estrutura

- `src/App.tsx`: rotas principais e providers.
- `src/domain/*`: modelo de dominio puro e testavel (ledger, offline, auditoria).
- `src/domain/__tests__/*`: suite Vitest do dominio.
- `src/pages/customer/*`: experiencia do cliente.
- `src/pages/merchant/Dashboard.tsx`: experiencia do lojista.
- `src/pages/admin/Admin.tsx`: portal de backoffice demo (`/admin`).
- `src/pages/legal/Legal.tsx`: politica de privacidade e termos (rascunho).
- `src/components/miniapps/*`: miniapps locais e apps embutidos.
- `src/components/shimo/*`: shell visual, simbolos e ilustracoes Shimo.
- `src/components/ui/*`: componentes Shadcn/Radix.
- `src/contexts/MockContext.tsx`: provider mock que delega ao dominio.
- `src/lib/storage.ts`: armazenamento local de lojas/transacoes.
- `src/lib/privacy.ts`: consentimento, exportacao e eliminacao de dados locais (LGPD).
- `src/lib/adminStore.ts`: operador, status de usuarios e trilha de auditoria do backoffice.
- `src/integrations/supabase/*`: client/tipos Supabase gerados.
- `docs/*`: documentacao viva e auditorias.

## Setup Local

```powershell
npm install
npm run dev
```

O Vite esta configurado para servir na porta `8080` e host `::` em `vite.config.ts`.

Neste ambiente Windows, o `npm` global pode apontar para um caminho quebrado em `AppData\Roaming\npm`. Se isso acontecer, use o Node/npm instalado em `C:\Program Files\nodejs`:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run lint
```

## Scripts

- `npm run dev`: inicia Vite.
- `npm run test`: roda a suite Vitest do dominio.
- `npm run build`: build de producao.
- `npm run build:dev`: build em modo development.
- `npm run lint`: ESLint.
- `npm run preview`: preview Vite.
- `npm run start`: preview em `8080` com host aberto.

## Validação atual

Baseline verificada em 2026-10-12: 32/32 testes de domínio; lint 0 erros/8 avisos existentes; typecheck/build passaram. Chromium 390x844 em quatro rotas sem page errors/overflow; nenhum SW registrado. Não são testes de integração financeira/PWA. Evidência em [avaliação](docs/SOLANA_INTEGRATION_ASSESSMENT.md) e [progress](docs/progress.md).

```sh
npm ci
npm run spec:check
npm test
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm run build
npm run dev
```

A versão integrada passou 50 testes unitários, lint/typecheck/build e E2E; os scripts live verificaram R$25 online/offline, ataques Devnet e Pix QR→approved. WebAuthn do legado não é autenticação financeira de produção.

## Documentacao Viva

- [Spec canônico do produto](SPEC.md)
- [Modelo de negocio](docs/business-model.md)
- [Arquitetura](docs/architecture.md)
- [Desenvolvimento](docs/development.md)
- [Plano vivo](docs/plans.md)
- [Progresso consolidado](docs/progress.md)
- [Operacoes](docs/operations.md)
- [Registro de fontes](docs/source-registry.md)
- [Status para proximos agentes/devs](.project/spec-status.md)

Docs existentes preservadas como fonte:

- [Gap analysis original](docs/DOX_REFERENCES.md)
- [Repagination audit](docs/SHIMOPAY_REPAGINATION_AUDIT.md)

## Atualização de apresentação — 14/09/2026

A raiz `/` agora abre a LP pública, sem exigir onboarding. `/landing` permanece um alias e `/onboarding` continua acessível pela demonstração. A LP é responsiva; as telas do app mantêm a largura mobile. Miniapps permanecem no produto e na visão de superapp. Turismo/stablecoins é uma hipótese inicial de descoberta, sem clientes ou piloto confirmados. Ver `docs/business/icmlab-preparation.md` para candidatura e roteiro. Nenhuma integração Solana ou liquidação real foi adicionada nesta atualização.


## Demo publicada

- App: https://shimopay-mobile.vercel.app/customer/home
- Merchant: https://shimopay-mobile.vercel.app/merchant/dashboard
- Guia: https://shimopay-mobile.vercel.app/demo
- Pitch PT-BR/EN-US: https://shimopay-mobile.vercel.app/pitch

Solana program: `9iWAPSp9p9mbQ7LouMZEdt3qhtpnZGiaSyoCBSXDPYKg`. Circle USDC mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`. Gateway usa backend existente de https://shimopay-demo.vercel.app; secrets/keypairs permanecem nesse backend, não no frontend.

### Preparar e apresentar

1. Abrir app online, atualizar saldo e conferir USDC de teste disponível. Escolher senha local de 10+ caracteres. Na aba Offline, criar sessão 5 USDC/24h; depositar antes somente se reserva disponível for insuficiente.
2. Copiar endereço da sessão. Em outro browser/profile, Merchant → Receber → colar endereço → Preparar lojista online. Atualizar FX do consumer para cotação nova.
3. Merchant → Cobrar → R$25 → gerar payload/QR; consumer → Pagar → importar cobrança/revisar.
4. Desligar internet dos dois. Consumer desbloqueia sessão se necessário e autoriza offline; copiar/exportar envelope. Merchant importa e aceita, mostrando pendente.
5. Reconectar apenas merchant → Pendentes → Liquidar agora. Abrir Explorer. Consumer reconecta/atualiza para reconciliar receipt e saldo.
6. Online: consumer → Pagar → R$25 → Pagamento online, usando ATA livre. Não gastar escrow pelo rail online.
7. Pix: Carteira → Criar Pix de teste → QR retornado → Consultar status Pix até confirmação do provider. Não pagar QR sandbox com banco real. Esse fluxo não credita USDC. Merchant pode escolher preferência BRL com payout explicitamente simulado.

Developer Details permite reciclar 5 USDC de teste do merchant configurado para consumer por transferência real Devnet. Não é mint, refund de um pagamento particular ou apagamento do histórico. `/demo` tem fixture Try to cheat para sessão de 10 USDC: dois merchants isolados aceitam 8+8; segundo settlement falha. A fixture também produz intent expirado/wrong merchant; limites normais continuam ativos.

### Comandos reais testados (Node 24)

```sh
npm ci
npm run spec:check
npm test
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm run build
PORT=8082 NODE_USE_ENV_PROXY=1 npm start
npm run test:e2e
```

E2E default usa o servidor acima e fixtures de regressão, sem transferir tokens. CHROMIUM_PATH pode configurar Chromium; o ambiente Cloud usa `/usr/bin/chromium`. Para browser local, instalar Playwright Chromium/configurar caminho. NODE_USE_ENV_PROXY é necessário para o proxy Cloud; fora dele pode ser omitido.

```sh
SHIMOPAY_MOBILE_URL=https://shimopay-mobile.vercel.app NODE_USE_ENV_PROXY=1 npm run demo:preflight
SHIMOPAY_MOBILE_URL=https://shimopay-mobile.vercel.app SHIMOPAY_LIVE_DEVNET=1 SHIMOPAY_FULL_DEMO=1 NODE_USE_ENV_PROXY=1 npm run demo:verify
SHIMOPAY_MOBILE_URL=https://shimopay-mobile.vercel.app SHIMOPAY_LIVE_DEVNET=1 npm run test:e2e -- --grep 'Devnet:'
SHIMOPAY_MOBILE_URL=https://shimopay-mobile.vercel.app NODE_USE_ENV_PROXY=1 npm run demo:verify:pix
SHIMOPAY_MOBILE_URL=https://shimopay-mobile.vercel.app SHIMOPAY_LIVE_DEVNET=1 NODE_USE_ENV_PROXY=1 npm run demo:verify:expiry
```

Live verify transfere tokens reais **de teste** entre contas configuradas, pode reciclar funding, cria/cancela sessões e gera receipts. Não executar com contas/URLs mainnet. `demo:verify` sem FULL_DEMO usa R$0.01 bounded. Preflight é read-only. Não precisa Solana CLI no browser/servidor frontend.

### Evidência e limites

[Progresso/aceite](docs/progress.md), [R$25 Devnet](docs/evidence/mobile-live-full.json), [adversarial](docs/evidence/mobile-live-adversarial.json), [expiração](docs/evidence/mobile-session-expiry.json), [Pix lifecycle](docs/evidence/mobile-pix-lifecycle.json).

Contas dev compartilhadas, sem auth/custódia multiusuário real; Supabase não é dependência da demo e a integração atual não tem acesso ao projeto legado. Backend usa sandbox gerenciado e pode ter cold start. Offline acceptance mantém risco até settlement. Recovery online consulta memo/balances se journal estiver ausente; janela limitada a 500 registros, falhando fechada além disso. JavaScript não garante zeroização; produção requer hardware/keystore. Fees são pagas por contas dev com SOL; Kora não implementado. Conversão/payout fiat simulados, sem banco/mainnet/fundos reais. Parte das mensagens técnicas permanece em inglês.

### Experiência 3-1-0

[Revisão de design e critérios](docs/DESIGN_310.md). A carteira abre em `/customer/home`; Pagar usa QR/importação, Histórico mostra gráfico/comprovantes e Mais reúne configuração offline, fundos, Pix/cartão e localização. A apresentação `/demo` acompanha estados reais; reiniciar roteiro não remove dados nem revoga sessão. Login depende da configuração Supabase descrita em DEPLOYMENT.

Transações on-chain abrem [comprovante nativo](docs/ONCHAIN_RECEIPTS.md), com tracker de confirmação, taxa, participantes, PDF e link Solana. Detalhes são consultados sob demanda e cacheados para consulta offline.


### UX-09 — Valores no histórico
Entradas (+) e saídas (−) on-chain relativas à carteira, com valores exatos por ativo. Reservas são movimentos internos; falhas não contabilizam transferências. Taxas SOL separadas. Consulta read-only limitada a duas requisições simultâneas, cache para consulta offline. Sem conversão BRL histórica inventada. 66 testes unitários, teste browser de histórico/receipt/offline, typecheck/build verdes; lint sem erros (8 warnings existentes).

Em Pagar, selecione USDC, BRL/Pix ou cartão. USDC pede revisão antes de enviar; Pix e cartão usam Mercado Pago sandbox. O cabeçalho identifica perfil e carteira compartilhada; email aparece apenas quando há sessão validada. PIN de seis dígitos ainda não está disponível: exige autenticação transacional e vínculo individual de carteira (SPEC UX-10).

Miniapps: `/customer/stores` para cliente e `/merchant/miniapps` para lojista, com a mesma navegação da carteira. Receber online consulta a sessão a partir da autorização; para aceitar sem conexão, conecte antes a sessão compartilhada pelo cliente. Contato: shimopay@pm.me.

Revisão de produto: [relatório](docs/PRODUCT_REVIEW.md). Carteira em português; apresentação `/pitch` em PT/EN. `/onboarding` inicia a jornada sem KYC simulado. Links antigos de perfil, rede e notificações levam aos fluxos atuais, sem histórico ou alertas inventados.
