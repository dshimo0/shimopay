# Deployment da demo Mobile

Frontend Vercel: `dscbest-1597s-projects/shimopay-mobile`, https://shimopay-mobile.vercel.app. Framework Vite, build `npm run build`, output dist; api/bridge.mjs proxy same-origin para backend existente.

Nenhuma env secreta é necessária no Mobile. Nunca copiar MERCADOPAGO_ACCESS_TOKEN ou keypairs para variáveis VITE_. Backend `shimopay-demo` já possui Mercado Pago seller token/test buyer email, RPC Solana e keypairs privados no sandbox. Config pública chega por deployment.json. NODE_USE_ENV_PROXY só para execução Cloud; não é secret.

Supabase do legado eqliiqvebzekmencdhqc está inacessível pela conexão atual (permission denied/list projects vazio). A demo financeira funciona sem banco Supabase: cadeia é fonte de verdade, IndexedDB guarda chave criptografada/cache/queue e backend guarda journal. Auth/RLS multiusuário só entram no marco de produção com projeto acessível; nenhuma tabela/schema foi criada sem acesso.

Backend auto start/resume tem startup variável. Cache de endpoint 30s não cacheia saldos/quotes; invalidado em 410/5xx. Readiness usa runtime fingerprint/deployment; domínio/mint/genesis são validados pelo engine em cada ação financeira. Não há novos snapshots nem remoção de snapshots. Runtime release contém apenas allowlist de fontes, nunca keys/env; mantém deployment/keys na restauração.

Online recovery por journal ou memo+SPL balance binding evita nova assinatura ao recuperar pagamentos; offline usa receipt PDA/hash. Recovery de history é limitada. Antes de produção: backend/journal duráveis, wallet auth, storage seguro, controle de acesso, abuse controls, monitoring e fiat parceiro real.

## Ativar identidade Supabase

Na Vercel **shimopay-mobile**, configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (somente publishable ou anon; secret/service_role recusadas). Rebuild/redeploy obrigatório para VITE_. No Supabase, habilitar email, configurar Site URL https://shimopay-mobile.vercel.app e redirect permitido https://shimopay-mobile.vercel.app/auth. Signup/recovery dependem do email/SMTP do projeto.

`SHIMOPAY_ALLOWED_USER_IDS` é server-only, lista de UUIDs de operadores autorizados separados por vírgula. Quando Supabase está configurado, mutações no gateway Mobile exigem sessão verificada em /auth/v1/user e essa allowlist; signup ou user_metadata não concedem acesso às contas compartilhadas. Sem allowlist, mutações são recusadas. A API do backend/sandbox existente continua para desenvolvimento; este guard não substitui ownership individual nem protege todas as URLs de origem. Não apresentar como custódia multiusuário.

Câmera/GPS exigem HTTPS e permissão no celular. QR decoder é jsQR 1.4.0 incluído no cache PWA; câmera não faz RPC e não dispara pagamento. QR por imagem/colar payload são fallbacks. Dinheiro é registro IndexedDB local, não autorização bancária/autenticada.

Cartão usa MERCADOPAGO_ACCESS_TOKEN e MERCADOPAGO_TEST_PAYER_EMAIL do backend já configurado; não exige Public Key no frontend, pois usa checkout hospedado sandbox. Abrir com buyer de teste, usar cartão de teste oficial, depois **Consultar cartão**. Retornar do checkout não aprova; servidor verifica live_mode=false, collector, referência, BRL, valor e credit_card. Criar preferência não cobra. Preferências/estado do cliente têm UUID persistido; não alegar exactly-once de cobrança pelo Checkout Pro (restrição a múltiplas aprovações exige reconciliação manual). Nenhuma conversão fiat/USDC foi adicionada.
