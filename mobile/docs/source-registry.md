# Source Registry

Registro de fontes usadas para a documentacao viva e claims que ainda precisam de fonte.

## Fontes Locais Usadas

| Fonte | Tipo | Claims sustentadas |
| --- | --- | --- |
| `README.md` | Doc existente | Nome, MVP, pagamentos mobile, offline-first, blockchain/superapp como narrativa anterior. |
| `package.json` | Config | Stack, dependencias, scripts, ausencia de script `test`. |
| `vite.config.ts` | Config | Porta 8080, host, allowed host de preview, plugin React SWC, alias. |
| `components.json` | Config | Shadcn UI, aliases e Tailwind config. |
| `tailwind.config.ts` | Config | Tailwind, tema, plugin animate. |
| `src/index.css` | UI/style | App mobile-first, root max-width 430px, tokens. |
| `src/App.tsx` | Runtime | Providers e rotas. |
| `src/contexts/MockContext.tsx` | Runtime | Usuario mock, login/logout, pay/receive e transacoes locais. |
| `src/lib/storage.ts` | Runtime | LocalStorage para stores/transacoes. |
| `src/integrations/supabase/client.ts` | Runtime/config | Supabase client e env vars. |
| `src/integrations/supabase/types.ts` | Generated types | Ausencia de tabelas publicas confirmadas. |
| `src/pages/Landing.tsx` | Produto/UI | Posicionamento atual de pagar/receber/offline/lojista. |
| `src/pages/Auth.tsx` | Produto/UI | Login/criacao demo cliente/lojista. |
| `src/pages/Onboarding.tsx` | Produto/UI | Onboarding, telefone, KYC e visitante simulados. |
| `src/pages/customer/*` | Produto/UI | Home, scanner, QR, offline, wallet, profile, history, stores, notifications. |
| `src/pages/merchant/Dashboard.tsx` | Produto/UI | Dashboard lojista, QR, offline, relatorios, ajustes, catalogo. |
| `src/components/miniapps/*` | Produto/UI | Miniapps locais. |
| `src/components/DIDHandshake.tsx` | Produto/UI | Handshake offline/DID simulado. |
| `src/pages/Network.tsx` | Produto/UI | Explorer Shimo Scan simulado. |
| `docs/DOX_REFERENCES.md` | Doc existente | Gap analysis e backlog original. |
| `docs/SHIMOPAY_REPAGINATION_AUDIT.md` | Doc existente | Auditoria de foco, riscos e roadmap recomendado. |
| `.env` | Config local | Nomes de variaveis Supabase. Valores nao devem ser citados. |
| `supabase/config.toml` | Config | Project id Supabase local. |
| Busca por Docker/CI/testes | Exploracao | Nenhum Dockerfile, docker-compose, CI ou suite de teste encontrada. |

## Claims Confirmadas

- `CONFIRMED` App e Vite/React/TypeScript/Tailwind/Shadcn.
- `CONFIRMED` Rotas de cliente, lojista, onboarding, auth, landing, network e 404.
- `CONFIRMED` Estado mockado em `MockContext`.
- `CONFIRMED` Persistencia local por `localStorage`.
- `CONFIRMED` Supabase client configurado.
- `CONFIRMED` Supabase types sem tabelas publicas.
- `CONFIRMED` Build, typecheck e lint passam no ambiente atual.
- `CONFIRMED` Nao ha script de teste em `package.json`.

## Claims Parciais Ou Mockadas

- `PARTIAL/MOCK` Auth e criacao de conta.
- `PARTIAL/MOCK` KYC/documento/selfie.
- `PARTIAL/MOCK` QR code e token offline.
- `PARTIAL/MOCK` Pagamento por scanner/aproximacao/PIN.
- `PARTIAL/MOCK` DID handshake e comprovante assinado.
- `PARTIAL/MOCK` Wallet multiativo, cartoes, USDC/USDT e cotacao.
- `PARTIAL/MOCK` Relatorios PDF/CSV.
- `PARTIAL/MOCK` Cashback, reputacao, dispositivos e modo rua.
- `PARTIAL/MOCK` Shimo Chain/Shimo Scan.
- `PARTIAL/MOCK` Miniapps e parceiros.

## Claims Que Precisam De Fonte

- `NEEDS_SOURCE` Pricing e modelo de receita.
- `NEEDS_SOURCE` Concorrentes e benchmarks.
- `NEEDS_SOURCE` Tamanho de mercado, CAC, demanda e validacao com usuarios.
- `NEEDS_SOURCE` Relacao real com parceiros, marcas, orgaos publicos ou provedores.
- `NEEDS_SOURCE` PIX real, cartao real, boleto real, adquirencia ou liquidacao.
- `NEEDS_SOURCE` KYC real, biometria real, AML, LGPD e postura regulatoria.
- `NEEDS_SOURCE` Stablecoin/cripto real, custody, cambio, spread e compliance.
- `NEEDS_SOURCE` Shimo Chain, mainnet, TPS, nodes, gas, block hash ou explorer real.
- `NEEDS_SOURCE` Seguranca criptografica, DID real, assinatura offline real e reconciliacao.
- `NEEDS_SOURCE` SLA/SLO, disponibilidade, monitoramento, backup e incidentes.

## Decisoes Pendentes

- `NEEDS_DECISION` Wedge comercial inicial.
- `NEEDS_DECISION` Modelo de negocio e comprador.
- `NEEDS_DECISION` Backend principal.
- `NEEDS_DECISION` Modelo de dados minimo.
- `NEEDS_DECISION` Suite de testes.
- `NEEDS_DECISION` Claims de blockchain/cripto no MVP.
- `NEEDS_DECISION` Politica de linguagem para produto sensivel/regulado.


## Fontes da demo funcional — 2026-10-12

- Mobile baseline c66b08a8e44bcae2cec901a2ceec8abf14b5bff3: código local, package-lock e 32 testes verificados; [avaliação](SOLANA_INTEGRATION_ASSESSMENT.md), [browser JSON](evidence/mobile-reuse-review.json).
- Repo privado [dshimo0/shimopay_solana](https://github.com/dshimo0/shimopay_solana), commit 2606c9e2406b1798f63ae345119cb23b785c7486: packages/solana/src, packages/sdk/src/storage.ts, backend solana-demo, docs/APP_UX_SPEC.md e evidências Devnet. Reuso alvo, não feature integrada neste Mobile.
- [SPEC v2](../SPEC.md), [plans](plans.md), [progress](progress.md), [DEMO](DEMO.md), [business delivery](business/DEMO_DELIVERY.md): especificação/contrato futuro, não prova de runtime ou tração.
- Mercado Pago: provider Orders sandbox na referência cria/consulta ordem; processing sem QR nas evidências existentes. Não classificar como rail concluído sem resposta QR e confirmação autenticada.


## Evidência da integração executada

Mobile live full/adversarial/expiry e Pix lifecycle em docs/evidence, executados pela URL pública. Dados históricos de processing sem QR foram superados por nova ordem com QR e approved/accredited autenticado. Progresso/README/SPEC v2.1 diferenciam baseline legado, mocks, testnet/sandbox e limites de produção.
