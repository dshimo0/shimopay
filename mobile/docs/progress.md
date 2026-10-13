# ShimoPay — progresso rastreável

Atualização: 2026-10-12. Fonte normativa: [SPEC.md](../SPEC.md). Histórico anterior em [arquivo](archive/progress-before-solana-demo.md).

## Resultado atual

Publicação APP: Mobile `dpl_9M3jhCZvCSLxojYWRVKybmvcQvzB` READY, backend `dpl_GU3M545mZnguM6FMBkg9BkPRuzWC` READY. [Verificação pública](evidence/mobile-app-delivery.json): login ausente recusa acesso (503), UI leitor/GPS/caixa, consulta cartão pendente via provider, sem overflow/page errors. Supabase permanece bloqueado; nenhuma conta pessoal foi provisionada. Dados de cartão não foram coletados nem cobrança aprovada nesta verificação.

Execução APP na ordem de prioridade: login fake removido; Supabase Auth/signUp/recovery/signOut, verificação server-side e allowlist de operadores no gateway preparados, mas projeto/variáveis ainda indisponíveis. Câmera/import QR offline com revisão (sem pagamento automático), GPS sob clique e permissões negativas testados. Dinheiro com persistência local, comprovante/anulação e nenhum crédito digital. Checkout cartão hospedado criou preferência R$25 sandbox real; aprovação não alegada. 55 testes Mobile, 12 SDK Pix/cartão, 3 E2Es; lint 0 erros/8 warnings legados, typecheck/build passaram. [Cartão provider](evidence/mobile-card-provider.json). Celular físico, Supabase ativo/ownership individual e dinheiro autenticado/cloud continuam pendentes. CORE/RAILS Devnet/sandbox não equivalem a produção.

Atalhos de abastecimento publicados na carteira: Circle USDC e SOL Devnet, endereço copiável e saldo atualizado somente pelo fluxo on-chain. As contas de taxas backend são explicitadas em detalhes. [Evidência pública](evidence/mobile-funding-shortcuts.json): links oficiais, copy, bloqueio offline, sem overflow; deploy `dpl_EAESz8QchkS1KSkqS3zZQV4rc51E`. 50 testes/E2E/typecheck/build passaram; lint 0 erros/8 avisos existentes. Nenhum faucet foi acessado nem token solicitado pelo agente nesta alteração.

Revisão de produto (12/10): header com ícones compartilhado em landing/app/pitch; saldo USDC e equivalente BRL com quote assinada; distribuição livre/reserva e atividade confirmada no aparelho; Explorer da carteira; comprovante acessível com download/Explorer; textos antigos da landing corrigidos. Consulta do saldo agora atualiza o snapshot antes das consultas de histórico. Verificações locais: 50 testes, E2E offline merchant-only com comprovante confirmado, lint sem erros (8 warnings preexistentes), typecheck e build. [Verificação pública](evidence/mobile-product-review.json): equivalente R$92,48 consultado, preservado em reload offline; zero page errors/overflow mobile/desktop. Hero apresenta fluxo e link à transação R$25 já comprovada. Cartão Mercado Pago e checkout de miniapp ainda não implementados.

**Demo Mobile integrada e publicada.** Evidências abaixo distinguem fixtures, Devnet real, sandbox fiat e limites de produção.

Fechamento: PR #1 merged em `0a00f163699b62dd3bac169111977c33533694c3`. Deploy final `dpl_HTpv8aokCkQEebpUPp6HFmiJHhMS` READY em https://shimopay-mobile.vercel.app. [Verificação pública final](evidence/mobile-final-deployment.json): consumidor, lojista, demo e pitch HTTP 200; reload físico offline; zero page errors. [Preparação financeira](evidence/mobile-demo-ready.json): tokens Circle Devnet existentes reciclados entre contas de teste, sem mint; saldo livre 7.625452 USDC e reserva disponível 5.552726 USDC, suficientes para sessão de 5 USDC e R$25 online. Saldos são snapshots, não promessa permanente; a próxima sessão exige senha escolhida pelo usuário.

| Entregável | Estado | Evidência / bloqueio |
| --- | --- | --- |
| D00 spec-driven + business-driven | VERIFIED documental | SPEC v2, plans, status, avaliação, DEMO e business/DEMO_DELIVERY; links/IDs revisados |
| D01 SDK/provider/gateway | VERIFIED | SDK browser snapshot versionado, PaymentProvider, bridge same-origin e deploy Vercel |
| D02 online/saldos | VERIFIED | mobile-live-full.json: R$25 → 4.545455 USDC, ATA debit/credit |
| D03 sessão/FX | VERIFIED | Sessão criada on-chain, chave criptografada local, FX signed/cache; unit regressions |
| D04 intent/merchant validation | VERIFIED | R$25 offline em browsers separados; zero APIs na assinatura/aceitação |
| D05 settlement/histórico | VERIFIED | Merchant-only reconnect, receipt/hash/Explorer e payer reconciliado |
| D06 PWA real | VERIFIED | Reload offline e assets lazy em SW; E2E fixture e Devnet |
| D07 adversarial/recovery | VERIFIED | mobile-live-adversarial.json, mobile-session-expiry.json; replay/tamper/signers/merchants/expiry/8+8/10; recovery do memo com regressão |
| D08 Pix/rails | VERIFIED sandbox | mobile-pix-lifecycle.json: mesma ordem QR→approved/accredited, USDC inalterado; payout/conversion simulados |
| D09 pitch/guia/deploy | VERIFIED demo | URL HTTPS Mobile, /pitch bilíngue, /demo, scripts; cold start variável e produção fora de escopo |
| GATE-CORE | VERIFIED demo | R$25 online/offline Devnet, PWA, adversarial e UI nativa |
| GATE-RAILS | VERIFIED sandbox | QR + aprovação Mercado Pago reais de teste; bridge fiat/USDC e payout explicitamente simulados |

## Verificação documental da entrega

`npm run spec:check`: links locais e rastreabilidade AC/D/B/gates; resultado em [spec-check.json](evidence/spec-check.json). Não substitui testes de runtime.

## Checks executados na avaliação do baseline

Repo Mobile c66b08a8e44bcae2cec901a2ceec8abf14b5bff3 em 2026-10-12:

| Check | Resultado |
| --- | --- |
| npm ci --no-audit --no-fund | Dependências instaladas por lockfile |
| npm test | 32/32, quatro arquivos |
| npm run lint | 0 erros, 8 avisos Fast Refresh existentes |
| npx tsc --noEmit -p tsconfig.app.json | Passou; strict false na config atual |
| npm run build | Passou, Vite 7.3.6 conforme lockfile |
| Chromium 390x844 | home/wallet/offline/merchant sem page errors ou overflow; fixture local, sem auth de servidor |
| Service workers | 0 registrados |

Evidência: [JSON browser](evidence/mobile-reuse-review.json) e screenshots; [avaliação](SOLANA_INTEGRATION_ASSESSMENT.md). Alterações posteriores de documentação não alteraram runtime nem repetiram checks de runtime.

## Evidência integrada por AC

| AC | Evidência |
| --- | --- |
| AC-01, AC-02 | Mobile nativo/header/nav/labels bilíngues, snapshots ATA/escrow, browser smoke e preflight |
| AC-03, AC-04 | [R$25 real Devnet](evidence/mobile-live-full.json): ATA, reserve, session PDA, datas e Explorer |
| AC-05, AC-06, AC-07 | Mesmo JSON: offline reload, 0 API calls, merchant independente reconecta sozinho |
| AC-08, AC-12 | History persistida/reconciliação por receipt; SDK/model unit tests; E2E fixture; recuperação online por memo testada em packages/solana/test/recovery.test.ts no backend |
| AC-09, AC-10 | [Adversarial Devnet](evidence/mobile-live-adversarial.json): 8+8/10, replay, alteração, wrong merchant/signer |
| AC-11 | [Sessão expirada](evidence/mobile-session-expiry.json), expired intent na prova adversarial, cancel/release e SDK quote expiry tests |
| AC-13 | [Pix lifecycle](evidence/mobile-pix-lifecycle.json): order QR pending→approved/accredited, mesmo ID, consulta autenticada |
| AC-14 | Preferência USDC/BRL na UI; payout explícito SIMULATED; nenhuma conversão ou transferência bancária real |
| AC-15 | /pitch e /demo públicos, README e scripts reais; verificação passiva pós-publicação |

## Validação runtime integrada

50/50 testes Mobile (32 legado + 18 protocolo/model). Lint 0 erros/8 avisos existentes; typecheck e build passaram. E2E default: um teste fixture passando; teste adversarial live separado passando com SHIMOPAY_LIVE_DEVNET=1. Scripts live: R$0.01 bounded, R$25 completo, Pix QR→approved, expired session/cancel — todos passaram. Backend build/typecheck e regressão de recovery passaram. Transações reais e screenshots nos JSONs acima; nenhum fundo mainnet usado.

## Limites residuais

Contas de desenvolvimento compartilhadas; não há auth/custódia multiusuário real. Supabase existente inacessível pela conexão atual e não usado no caminho financeiro. Backend sandbox tem cold start/resume; demanda servidor/journal duráveis em produção, além da recovery chain. Recovery online é limitada a 500 referências e depende de RPC com memo/metadata adequados, falhando fechada ao atingir janela. Kora/zero-SOL não implementado; fee accounts têm SOL Devnet. Payout/conversão Pix simulados; QR sandbox não deve ser pago num banco real. Algumas mensagens técnicas permanecem em inglês. JavaScript memory erasure é best effort. Offline acceptance continua com risco de contraparte.

## Revisão visual 3-1-0 · 12/10/2026

UX-01–UX-07 implementados e testados localmente, conforme [DESIGN_310.md](DESIGN_310.md). Landing 2413 px/390 px; home essencial, navegação inferior e Mais; gráfico em Histórico, comprovante com timeline; demo guiada com reinício não destrutivo. Preview financeiro por timers removido do roteamento público. 55 testes unitários, 5 E2E, lint (0 erros/8 avisos), typecheck e build verdes. Nenhuma nova transferência Devnet feita nesta revisão visual; testes financeiros E2E usam fixtures. Auth/provedor/hardware pendentes não mudaram de status.

Publicado: runtime `d5134f8`, Vercel `dpl_FQ8KH1S46gMzNV5CsxBPYZLFWtX8` READY; [verificação pública](evidence/design/public-verification.json), sete rotas 200/sem overflow/sem page errors. Teste de permissão/login foi repetido após esconder o formulário indisponível e passou.

## UX-08 · Comprovantes on-chain

Receipt nativo/tracker e leitura RPC Devnet implementados; [contrato e testes](ONCHAIN_RECEIPTS.md). 62 unitários/6 E2E passaram; build/typecheck/lint verdes. Consulta read-only real confirmou valor, taxa e participantes da transação histórica, sem movimentar fundos. Publicação em andamento.

UX-08 publicado: `92f70f9` / `dpl_GxPvZXxS7ko72C7sKvYk3hHYgrPF` READY. Receipt real de 20 USDC conferido na URL pública, com fee 0.000012209 SOL e finality. [Evidência](evidence/chain-receipt-public.json). Impressão PDF e cache offline passaram no E2E específico após ajuste final do modal.


### UX-09 — Valores no histórico
Entradas (+) e saídas (−) on-chain relativas à carteira, com valores exatos por ativo. Reservas são movimentos internos; falhas não contabilizam transferências. Taxas SOL separadas. Consulta read-only limitada a duas requisições simultâneas, cache para consulta offline. Sem conversão BRL histórica inventada. 66 testes unitários, teste browser de histórico/receipt/offline, typecheck/build verdes; lint sem erros (8 warnings existentes).

UX-09 publicado em 2026-10-13 (91a2dd9). Verificação na URL pública confirmou +20,00 USDC e −0,181819 USDC, taxa separada e reserva 3,00 USDC; sem overflow/erros JavaScript. Evidências: `docs/evidence/history-values-public.json` e `.png`. 6 E2E passaram; teste adversarial live opcional não executado neste ajuste visual. Consulta de detalhes ocorre progressivamente; valores não disponíveis não viram zero.

## UX-10 · Implementação
Perfil/carteira ativa, sessão validada quando configurada, rails USDC/Pix/cartão, revisão USDC, loading baseado no request, valores/contraparte no histórico e registros fiat locais implementados. Testes de interface usam fixtures explícitas; não alegam nova aprovação Mercado Pago real. PIN transacional continua bloqueado: não há ownership individual nem serviço de verificação/limite de tentativas. Mantida senha forte de sessão offline. Ver SPEC UX-10.

UX-10 checks: 66 unitários e 7 E2E passaram, 1 adversarial Devnet opcional não executado neste ajuste. Lint sem erros/8 avisos existentes, typecheck, build e spec:check verdes. Screenshot `evidence/payment-experience-history.png` usa fixtures de teste; seleção Pix/cartão e loading foram verificados sem novas transferências reais. Publicação em andamento.

UX-10 publicado em https://shimopay-mobile.vercel.app (38305aa). Verificação pública read-only confirmou perfis cliente/lojista com carteiras distintas, visitante sem identidade inventada e seleção USDC/Pix/cartão. Sem erros JS ou overflow em 390px. Evidência: `evidence/payment-experience-public.json` e `.png`. Nenhum pagamento novo foi iniciado na verificação pública; aprovação real dos rails não foi revalidada neste ajuste.

## UX-11 · Copy, miniapps e recebimento
Contato atualizado para shimopay@pm.me, marcadores internos removidos do produto, footer Ambiente Sandbox, termos/privacidade corrigidos para arquitetura atual. Miniapps cliente/lojista no mesmo shell; catálogo legado preservado no código sem rota pública. Sessões inválidas não chamam RPC, erros de schema não aparecem como JSON; aceitação online prepara sessão do intent e mantém validação criptográfica. Offline exige cache anterior.
68 unitários, 9 E2E distintos passaram (8 suite + novo caso de sessão automática); lint 0 erros/8 avisos existentes, typecheck/build verdes. Testes browser financeiros usam fixtures; não houve novas transferências Devnet. Publicação em andamento.

UX-11 publicado (d4d0912): cinco rotas públicas verificadas — início, privacidade, termos e miniapps cliente/lojista — sem overflow nem erros JS. Email, badge Ambiente Sandbox e ausência de marcadores editoriais confirmados. Entrada inválida de sessão exibiu mensagem amigável na publicação, sem execução financeira. Evidências `evidence/product-consistency-public.json` e `evidence/miniapps-merchant-public.png`.

## UX-12 · Revisão completa
Revisadas 19 rotas públicas e aliases. Corrigidos onboarding, 404, pitch, copy de pagamento/erros/valores, contraste de texto secundário, foco e alvos de toque. Rotas antigas de notificações/rede/perfil/admin não exibem mais dados inventados: passam aos fluxos reais correspondentes. Carteira PT-BR; pitch PT/EN. Fontes legadas preservadas. 68 unitários e 10 E2E distintos verdes; cobertura responsiva 19×3 larguras, sem overflow. Login individual/PIN ainda não implementados. Publicação e captura final em andamento; relatório PRODUCT_REVIEW.md.

Na inspeção pública UX-12, corrigidos também o estado vazio indevido junto de atividade on-chain e a cor dos links de ação no pitch/404. Verificação visual final será recapturada na publicação.

UX-12 publicado em https://shimopay-mobile.vercel.app (0a33302). Revisão visual e inventário de 19 rotas públicos em docs/PRODUCT_REVIEW.md; 68 unitários, 10 E2E distintos, lint/typecheck/build aprovados. Ajustes finais de contraste e estado vazio também passaram no teste responsivo completo. Login individual/PIN permanecem fora do resultado entregue.
