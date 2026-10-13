# ShimoPay — status para próximos agentes

2026-10-12 · [SPEC.md](../SPEC.md) é canônico.

## Estado

- SPEC 2.5: APP OPEN. Auth preparado/bloqueado por projeto; câmera/GPS implementados/browser tested; dinheiro local; checkout cartão criado em sandbox, aprovação pendente. Auditoria em docs/APP_CAPABILITIES.md; CORE/RAILS verificados não equivalem a app completo.

- Atalhos Circle USDC/SOL Devnet publicados e verificados; endereço da configuração atual, copy e bloqueio offline. Prova em `docs/evidence/mobile-funding-shortcuts.json`. Solicitar no faucet não gera crédito fictício na carteira.

- SPEC 2.2 incorpora revisão de produto: saldos BRL equivalentes, gráficos baseados em dados, navegação uniforme e comprovantes/Explorer. Cartão e checkout de miniapps não fazem parte dos fluxos implementados; exigem integração/tokenização própria do provedor.

- PR #1 merged em main; versão final publicada em https://shimopay-mobile.vercel.app. Evidências `mobile-final-deployment.json` e `mobile-demo-ready.json`: páginas públicas/PWA verificadas e funding compacto pronto, sem gerar chave/senha pelo usuário.

- D00–D09 VERIFIED demo; execução em Devnet e Mercado Pago sandbox, limites de produção em progress.
- Mobile Vite/React: provider financeiro real Devnet, legado mock separado; 50 testes, lint 0 erros/8 warnings, typecheck/build verdes.
- Reusar SDK/backend dshimo0/shimopay_solana; pagamentos Devnet provados dentro do Mobile em mobile-live-full.json.
- Pix verificado: mesma ordem com QR→approved/accredited por API de teste; conversion/payout simulados.
- CORE e RAILS verificados para demo/testnet/sandbox. Status detalhado em [progress](../docs/progress.md); execução em [plans](../docs/plans.md).

## Decisões e próxima ação

Manter integração entregue: SDK browser versionado, PaymentProvider separado de MockContext e API gateway same-origin. Manter Mobile UX; Solana Devnet/Circle USDC default; session key Ed25519 offline; backend existente. Não exigir decisão de Supabase/KYC/produção para esta demo.

## Regras de execução

- Ler SPEC, plans e progress antes de código; rastrear AC-01…AC-15.
- Não fabricar assinatura, tx, confirmação, saldo ou Pix approval por timer/mock.
- Secrets/master keys só servidor; session key criptografada no browser; sem CORS wildcard.
- Preservar programa, keys e deployment; não trocar mint Circle por mock para fechar demo.
- Usar app normal e demo guiada com o mesmo provider; não usar iframe/link externo como integração.
- Checks de runtime: npm test, npm run lint, npx tsc --noEmit -p tsconfig.app.json, npm run build; testes browser/provider/chain necessários para os AC correspondentes.
- VERIFIED exige evidência Mobile; documentação, fixture e referência externa não fecham aceite financeiro.
- Atualizar SPEC/plans/progress/README e este status a cada marco. Não pedir novamente escolhas arquiteturais já fechadas; bloqueios reais são registrados, trabalho independente continua.

## UX 3-1-0

Landing/carteira/demo redesenhadas; [DESIGN_310.md](../docs/DESIGN_310.md) contém aceite, auditoria e evidências. 55 unitários e 5 E2E verdes; APP continua OPEN. Navegação: Carteira/Pagar/Histórico/Mais; Configuração offline, Pix, cartão, caixa, localização e faucets acessíveis em Mais. Reiniciar roteiro preserva pagamentos/chaves/saldo.

UX-08: histórico on-chain abre receipt nativo; parser Devnet read-only, fee/owners/assets, tracker, PDF/share e cache offline. Ver docs/ONCHAIN_RECEIPTS.md. Não cria tx, não inventa timestamps nem converte BRL histórico.

UX-08 VERIFIED: deploy GxPvZXxS7ko72C7sKvYk3hHYgrPF; receipt Devnet 20 USDC real na UI pública. 62 unitários/6 E2E; detalhes em docs/ONCHAIN_RECEIPTS.md.


### UX-09 — Valores no histórico
Entradas (+) e saídas (−) on-chain relativas à carteira, com valores exatos por ativo. Reservas são movimentos internos; falhas não contabilizam transferências. Taxas SOL separadas. Consulta read-only limitada a duas requisições simultâneas, cache para consulta offline. Sem conversão BRL histórica inventada. 66 testes unitários, teste browser de histórico/receipt/offline, typecheck/build verdes; lint sem erros (8 warnings existentes).

UX-10 implementado: perfil/conta ativa, seletor USDC/Pix/cartão, revisão, loading e origem no histórico. PIN de seis dígitos BLOCKED por infraestrutura de autenticação transacional/ownership; não implementado como validação falsa no frontend.

UX-11 implementado/testado: copy sem marcadores, contato real, shell de miniapps por perfil e validação/auto-preparo de sessão do lojista. 68 unitários/9 E2E; publicado após verificação da URL pública. Catálogo legado fora das rotas públicas.

UX-12: revisão de 19 rotas/3 larguras implementada e testada; copy PT-BR e pitch PT/EN, onboarding/404 consistentes, dados fictícios fora das rotas públicas. Evidência visual e limites no relatório PRODUCT_REVIEW.md. Nenhuma certificação de acessibilidade declarada.

UX-12 publicado em https://shimopay-mobile.vercel.app (0a33302). Revisão visual e inventário de 19 rotas públicos em docs/PRODUCT_REVIEW.md; 68 unitários, 10 E2E distintos, lint/typecheck/build aprovados. Ajustes finais de contraste e estado vazio também passaram no teste responsivo completo. Login individual/PIN permanecem fora do resultado entregue.
