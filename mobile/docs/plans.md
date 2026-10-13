# ShimoPay — plano de entrega da demo funcional

2026-10-12 · fonte: [SPEC.md](../SPEC.md). Plano anterior preservado em [arquivo](archive/plans-before-solana-demo.md). Milestones antigos concluídos se referem ao demo local, não à integração financeira.

## Ordem e dependências

Execução APP: login/cadastro/recovery/logout e validação server-side preparados, bloqueados por configuração Supabase. Câmera/QR com jsQR cacheado e GPS sob ação do usuário implementados/testados no browser. Dinheiro salva comprovante local anulável, sem crédito USDC. Cartão hospedado criou preferência sandbox real; aprovação depende de checkout do buyer de teste. Teste hardware e identidade/cloud de dinheiro permanecem abertos.

Gate APP solicitado em 12/10: APP-01 autenticação e ownership → APP-05 câmera/QR → APP-06 localização → APP-08 caixa/dinheiro → APP-09 cartão Mercado Pago. APP-02 marca, APP-03 Pix, APP-04 geração QR e APP-07 online/offline têm implementação/evidências; auditoria e dependências em [APP_CAPABILITIES.md](APP_CAPABILITIES.md). Não marcar APP completo por testes do CORE.

Abastecimento: TestFunds na home de consumidor/lojista, endereço da configuração pública atual, links oficiais de faucets, copy com fallback selecionável e bloqueio de links offline. Confirmar links/endereço/layout no browser; não solicitar tokens automaticamente nem fabricar crédito.

Revisão UX de 2026-10-12: ProductHeader compartilhado; WalletOverview com equivalente BRL, distribuição e atividade registrada; TransactionReceipt com download e Explorer; correção da landing; consulta de saldo antes de histórico. Aceite: layout mobile/desktop sem overflow, comprovante confirmado/pendente coerente, links Devnet, PWA e regressão merchant-only offline preservados. Cartão e checkout comercial de miniapps permanecem entregáveis separados do rail fiat.

D00 documentação → D01 integração → D02 online/saldo → D03 sessão/FX → D04 autorização/recebimento → D05 settlement/histórico → D06 PWA → D07 adversarial. D08 Pix foi integrado e verificado. D09 apresentação/deploy fecha os gates aplicáveis.

| ID | Entregável e arquivos/camadas previstos | Resultado de negócio | Dependência | AC | Status |
| --- | --- | --- | --- | --- | --- |
| D00 | SPEC, plano, progresso, status, avaliação e roteiro | Escopo verificável, sem confundir mocks com entrega | Revisão dos dois repos | Contrato de execução | VERIFIED documental |
| D01 | Pacote browser versionado; integrations/shimopay; PaymentProvider; gateway/API; configuração pública/env example | Reutilizar infraestrutura sem refazer app | Backend Solana existente | AC-02, AC-12 | VERIFIED demo — ver progress |
| D02 | Home/Wallet/Scanner + online transfer e snapshots | Consumidor paga online, merchant recebe valor test verificável | D01 + funding | AC-01, AC-02, AC-03 | VERIFIED demo — ver progress |
| D03 | Offline settings + wallet IndexedDB/WebCrypto + signed FX/session cache | Limite offline respaldado por escrow | D01 + reserve/allowance | AC-04, AC-11, AC-12 | VERIFIED demo — ver progress |
| D04 | QR/invoice/import + offline sign + merchant verification independente | Autorizar e aceitar sem internet | D03 + cache merchant | AC-06, AC-09 | VERIFIED demo — ver progress |
| D05 | Merchant settlement + reconciliation + History + persistent intents/receipts | Pendência vira recebimento confirmado rastreável | D02, D04 | AC-07, AC-08, AC-12 | VERIFIED demo — ver progress |
| D06 | Manifest/SW Vite; lazy-route/QR/crypto cache; browser offline tests | App reabre e opera em modo avião | D02–D05 | AC-05, AC-06, AC-07 | VERIFIED demo — ver progress |
| D07 | Protocol/program regression + UI de ataque e recovery fixtures | Provar risco limitado e rejeições honestas | D03–D06 | AC-09, AC-10, AC-11, AC-12 | VERIFIED demo — ver progress |
| D08 | Pix Orders adapter/UI; provider status/reconcile; fiat preference/simulated conversion/payout | Demonstrar rail fiat separadamente | D01 + provider | AC-13, AC-14 | VERIFIED sandbox — QR e aprovação confirmados |
| D09 | /pitch, /demo guiada, PT-BR/EN-US, deploy estável, preflight/recovery, README e evidência pública | Demo repetível de 90s com afirmações comprovadas | CORE: D01–D07; RAILS: também D08 | AC-01, AC-15 e gates | VERIFIED demo — ver progress |

## Contrato de fechamento por entregável

1. Confirmar versão do SDK/backend e requisitos AC relacionados antes de alterar UI.
2. Implementar e manter mocks fora do caminho financeiro. Atualizar teste significativo de domínio/integração conforme risco.
3. Executar checks afetados; para marco de runtime, testes, lint, typecheck e build completos.
4. Registrar commit, ambiente, comandos, resultado, data, tx/blocktime/saldos quando financeiro e evidencia browser quando UX/offline.
5. Atualizar progress e status. Checkboxes só depois de VERIFIED; BLOCKED identifica ação, erro real e trabalho independente restante.

## Verificação documental disponível

`npm run spec:check` verifica links locais, 15 AC, 10 entregáveis D00–D09, 6 entregáveis de negócio e gates. Não verifica pagamentos.

## Scripts entregues

- npm run test:e2e: dois contexts independentes; online, offline real, settlement merchant-only e persistência. Fixtures não fecham aceite de Devnet real.
- npm run demo:preflight: checks read-only de config/cluster/mint/program/ATAs/fees/balances/cache; saída sem secrets e sem auto-funding.
- npm run demo:verify: demonstra transferências test com autorização explícita no comando/config; JSON de receipts/saldos; não roda por engano em mainnet.

Estes scripts estão no package.json; comandos reais e limites em README/progress. A demo não exige instalar Solana CLI no browser ou na Vercel do frontend.

## Gates

- [x] GATE-CORE: AC-01–AC-12 e AC-15 comprovados no Mobile integrado. Transações online/offline reais Devnet, PWA real e testes/recovery passam.
- [x] GATE-RAILS: CORE + AC-13/AC-14; QR e approval reais do sandbox, payout/conversão explicitamente simulados.

Falta de Pix não bloqueia implementar CORE; impede afirmar RAILS concluído. Nenhuma decisão Supabase/KYC/produção precisa ser repetida para iniciar D01.

## Qualidade atual e riscos

Baseline Mobile verificada em 2026-10-12: 32 testes; lint 0 erros/8 warnings existentes; typecheck e build verdes; smoke browser 390px em quatro rotas sem page errors/overflow. Isso não valida assinatura/PWA/settlement no Mobile.

Riscos de execução: coexistência ledger mock/real; Zod 3/4 e exports browser/server; cache merchant incompleto; saldo insuficiente; sessão/quote expiradas; API same-origin; sandbox expirável; retries e confirmação ambígua; provider Pix indisponível. Mitigar conforme SPEC, não com timers, hash fake, CORS wildcard ou segredo no browser.

## Revisão 3-1-0

Auditoria visual → hierarquia/identidade → onboarding e demo guiada → comprovante → regressão e publicação. Critérios UX-01–UX-07 em [DESIGN_310.md](DESIGN_310.md).

UX-08: parser RPC read-only/testes → receipt/tracker no histórico → cache/retry/compartilhar → E2E e publicação. Nenhuma assinatura ou movimentação financeira nova.


### UX-09 — Valores no histórico
Entradas (+) e saídas (−) on-chain relativas à carteira, com valores exatos por ativo. Reservas são movimentos internos; falhas não contabilizam transferências. Taxas SOL separadas. Consulta read-only limitada a duas requisições simultâneas, cache para consulta offline. Sem conversão BRL histórica inventada. 66 testes unitários, teste browser de histórico/receipt/offline, typecheck/build verdes; lint sem erros (8 warnings existentes).

UX-10: identidade visível → seletor de rails → revisão/loading → histórico por meio → testes provider/UX → publicação. PIN transacional só após vínculo de usuário/carteira e infraestrutura de proteção contra tentativas; não é uma máscara visual sobre as contas compartilhadas.

UX-11: limpar copy público → unificar miniapps por perfil → validar sessão antes do RPC → preparar sessão a partir do intent online → regressão offline e publicação. Catálogo antigo preservado em StoresLegacy.tsx, fora das rotas públicas.

UX-12: captura inicial → inventário de rotas/copy → correção de rotas legadas e textos → legibilidade/controles → 19 rotas em 3 larguras → regressão financeira/QR/offline → publicar e capturar novamente. Relatório em PRODUCT_REVIEW.md.
