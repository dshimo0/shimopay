# ShimoPay Mobile — especificação da demo funcional

Versão 2.6 · 2026-10-12 · **IMPLEMENTED: demo Mobile online/offline publicada e verificada em Devnet/sandbox**.

## Revisão visual 3-1-0

Revisão em execução conforme [DESIGN_310.md](docs/DESIGN_310.md), UX-01–UX-07. Onboarding progressivo, home essencial, offline como estado, navegação inferior e comprovante com eventos reais. Critérios técnicos/financeiros existentes permanecem obrigatórios.

## Matriz de capacidades e próximo gate APP

CORE/RAILS verificados significam os fluxos Devnet/sandbox existentes, não todos os meios de pagamento. APP permanece OPEN até login real, câmera, localização e meios adicionais passarem seus critérios próprios. Auditoria detalhada em [APP_CAPABILITIES.md](docs/APP_CAPABILITIES.md).

| ID | Capacidade | Estado atual | Aceite obrigatório para fechamento |
| --- | --- | --- | --- |
| APP-01 | Login/autenticação | IMPLEMENTED/BLOCKED: login Supabase, validação server-side e allowlist preparados; ativação e ownership individual aguardam projeto/keys | Login válido/inválido, signup, logout/recovery; JWT verificado no servidor e ownership de conta/session; nenhum sucesso por senha arbitrária |
| APP-02 | Marca/logo | SVG existente e header compartilhado | Asset carrega sem erro; legibilidade mobile; mesma identidade em todas as novas telas |
| APP-03 | Pix | VERIFIED sandbox | QR real do provedor e mesma ordem consultada como approved; crédito fiat separado de USDC |
| APP-04 | Geração QR | Implementada para invoice/intent | Payload decodificável, valor/merchant/expiry preservados e assinatura do intent verificável |
| APP-05 | Câmera/leitor QR | IMPLEMENTED/BROWSER TESTED; hardware celular pendente | getUserMedia por ação do usuário, câmera traseira, permissão negada tratada, stop tracks; decoder com fallback/cached assets; leitura importa para revisão, nunca paga automaticamente; teste em celular real |
| APP-06 | Geolocalização | IMPLEMENTED/BROWSER TESTED; GPS real pendente | Solicitação explícita, latitude/longitude reais com precisão/time; denied/timeout/indisponível tratados; sem GPS fictício ou rastreamento em background |
| APP-07 | Online/offline USDC | VERIFIED Devnet | E2E de contextos separados, zero RPC na autorização/aceitação e reconexão só do merchant; replay/expiry/overspend rejeitados |
| APP-08 | Dinheiro em espécie | IMPLEMENTED LOCAL; identidade/cloud pendentes | Cobrança e confirmação manual pelo lojista identificado, comprovante e trilha próprios; não creditar USDC/escrow ou afirmar confirmação por banco/blockchain |
| APP-09 | Cartão Mercado Pago | CHECKOUT IMPLEMENTED; aprovação real pendente | Checkout/tokenização do provedor; cartão e buyer/seller de teste; status consultado/autenticado no backend; idempotência, recusas e reconciliação; sem PAN/CVV no storage/logs |

## Revisão de produto: carteira e comprovantes

Landing, carteira, lojista e pitch compartilham identidade e navegação com ícones. A carteira destaca saldo USDC e equivalente em BRL pela última cotação assinada, sem representar conversão como saldo bancário. Reserva/livre e atividade semanal usam snapshots e pagamentos confirmados registrados no aparelho; ausência de dados não vira série inventada. Saldo deve aparecer assim que a consulta retorna, sem aguardar histórico. Carteira e transações têm links diretos ao Explorer Devnet. Intents locais têm comprovante acessível com status, valores, participantes e datas, inclusive pendente; confirmado exige receipt/assinatura do fluxo existente. Landing descreve o settlement e offline implementados. Identificação Devnet/sandbox e limites ficam concentrados no rodapé e nos controles fiat pertinentes.

Checkout de cartão hospedado no Mercado Pago implementado para sandbox; criação de preferência verificada, aprovação ainda pendente. PAN/CVV ficam no provedor. Checkout de miniapp comercial ainda não implementado; catálogo não implica pedidos integrados.

Abastecimento Devnet: a carteira sempre oferece endereço selecionável/copiável e atalhos para os faucets oficiais Circle USDC e Solana SOL quando online. Solicitação externa não incrementa saldo local. Usuário seleciona Solana Devnet no faucet e consulta o saldo/Explorer após recebimento. Limites do provedor permanecem aplicáveis. Contas de taxas do backend são distintas; financiar a carteira não implica financiar o patrocinador.

Este é o contrato canônico da entrega. Prevalece sobre o PRD de produção e planos antigos para o escopo da demo. Baseline preservada em [arquivo histórico](docs/archive/SPEC-before-solana-demo.md). Critérios e evidências de execução estão em [progress](docs/progress.md); componentes de produção permanecem fora do escopo.

## 1. Resultado de negócio

**Payments that don’t stop when the network does.**

Provar na UX Mobile de consumidor e lojista: cobrança em BRL, pagamento online e autorização offline com sessão limitada, seguida de settlement em Circle USDC na Solana Devnet quando qualquer parte recuperar conexão. Demonstrar também o rail fiat sandbox, separadamente da conversão simulada.

O objeto central é `OfflineSession`: identidade + device/session key + escrow + política + FX cacheado + signed intent. Blockchain não funciona offline. Aceitação offline contém risco de contraparte até settlement; escrow limita gasto on-chain, não elimina double spending entre merchants isolados.

Nenhum fundo real, mainnet ou conversão fiat/USDC real nesta entrega. Miniapps existentes são preservados, sem novas features nem destaque no roteiro. Validar UX técnica não prova demanda comercial, piloto ou receita.

## 2. Baseline anterior e estados atuais

| Área | Comprovado em 2026-10-12 |
| --- | --- |
| Mobile `c66b08a8e44bcae2cec901a2ceec8abf14b5bff3` | React/Vite, consumidor/lojista, QR e domínio testado; login/saldo/assinatura/settlement simulados |
| Repo `dshimo0/shimopay_solana`, `2606c9e2406b1798f63ae345119cb23b785c7486` | Ed25519 v2, chave criptografada, escrow e transferências Devnet demonstradas; contas de desenvolvimento configuradas |
| Mercado Pago de referência | Orders API cria/consulta ordens teste; evidências existentes processing sem QR; rail completo bloqueado |
| PWA Mobile | Nenhum registro de service worker na revisão; cache offline por implementar |
| Qualidade Mobile | 32/32 testes de domínio; build/typecheck passaram; lint 0 erros/8 avisos existentes |

Fontes: [avaliação](docs/SOLANA_INTEGRATION_ASSESSMENT.md), [evidência browser](docs/evidence/mobile-reuse-review.json), [arquitetura](docs/architecture.md). A baseline acima é anterior à integração; as novas evidências `mobile-live-full.json`, `mobile-live-adversarial.json`, `mobile-session-expiry.json` e `mobile-pix-lifecycle.json` comprovam execução dentro deste Mobile.

Estados de entrega: `SPECIFIED`, `IN_PROGRESS`, `BLOCKED`, `VERIFIED`. Somente `VERIFIED` com teste, commit e evidência fecha checkbox. Mocks atuais continuam `PARTIAL/MOCK`.

## 3. Decisões fechadas

1. Mobile é a interface principal; reutilizar SDK browser e backend do Solana. Manter Vite/React; não copiar `Demo.tsx`, usar iframe ou apresentar link externo como integração.
2. Settlement padrão: Solana Devnet, Circle USDC mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`, 6 decimais. EVM permanece como adapter secundário no repo de referência.
3. Blockchain é fonte de verdade financeira. `PaymentProvider` separado de `MockContext`; saldo fictício nunca vira token e nunca serve de fallback em erro RPC.
4. Backend de referência, gateway de mesma origem `/api`, validação de origem e allowlist de ações. Supabase/KYC/auth de produção não bloqueiam esta demo de contas de desenvolvimento.
5. Snapshot browser compartilhado/versionado via file dependency e provenance; browser não importa módulos server, secrets ou keypairs. Resolver Zod 3/4 no limite do pacote e preservar bytes canônicos/criptografia existentes.
6. Master wallet autoriza sessão online; somente session key Ed25519 assina offline. Master keys jamais no bundle/browser. Login/PIN demo e WebAuthn sem verificação server-side não autorizam fundos reais.
7. Session key local criptografada WebCrypto/IndexedDB, senha, lock/unlock/delete. Limite, token, sessão e expiração respaldados pelo programa.
8. PT-BR e EN-US nos fluxos centrais e pitch. BRL predominante, USDC/rede no recibo, Developer Details colapsável.
9. Começar implementação D01 sem nova discussão de arquitetura. Credenciais/saldo/provider indisponíveis são bloqueios operacionais explícitos, nunca justificativa para fabricar sucesso.

## 4. Rotas e UX

Preservar `/` e `/landing` públicos. Evoluir `/customer/home`, `/customer/wallet`, `/customer/scanner`, `/customer/qr`, `/customer/offline`, `/customer/history`, `/merchant/dashboard`. Implementar `/pitch` bilíngue e `/demo` guiada no Mobile. App normal e demo usam o mesmo provider/SDK; simulação visual é complementar.

- Header com ShimoPay, papel, idioma e conectividade; navegação consumidor/lojista sem exigir split screen.
- Carteira: saldo ATA livre, escrow reservado, disponível da sessão e compromissos locais pendentes separados. Snapshot com timestamp; offline mostra “Último saldo confirmado às…”. Equivalente BRL só com quote/idade.
- Lojista: cobrança BRL, QR/payload, pendentes e confirmados separados. Intent aceito não aumenta receita confirmada.
- Histórico persistente: online/offline, merchant, BRL/USDC assinados, sessão, authorization time, submitted/confirmed time quando existentes, motivo de rejeição e assinatura real. Explorer `?cluster=devnet`, sem hashes fictícios.
- Identidade nos ajustes/recibo: payer/merchant/device DID associado ao endereço da rede e sessão; não alegar KYC.
- “Devnet · USDC de teste” sempre visível. Remover temporizadores que afirmam assinar/sincronizar e labels Pix/cartão conectado sem rail funcional. Manter mocks em área rotulada.

## 5. Contratos técnicos

### Sessão, chave e persistência

Consumir `SolanaOfflineSession`/`SolanaPaymentIntent` v2. Distinguir `sessionId` aleatório do `id` PDA. Vincular owner, signer, reserve, mint, maxAmount, spentAmount, expiresAt, active, genesis/network, program, payerDid/deviceDid e cachedAt. Reserva total não equivale a saldo da sessão. Compromissos locais diminuem disponibilidade local, sem alegar sincronização entre devices.

Montantes: strings/bigint em microUSDC e inteiros em centavos; não usar float em contabilidade. IndexedDB persiste encrypted key, metadata, quote assinada, outgoing/incoming intents, nonces/sequences e receipts/status. Separar namespaces mock/real por rede/conta/sessão. Persistir antes de mostrar sucesso de autorização. Exportação LGPD/diagnóstico exclui private key, seed e envelope criptografado da chave.

Lock limpa segredo em memória em melhor esforço. Delete local não equivale a cancelamento on-chain: offline, remover segredo e enfileirar revogação, mostrando pendência. Online, cancelar/reconciliar/liberar conforme programa. Alertar que revogar pode invalidar intents já aceitos. Não renovar validade automaticamente nem sobrescrever chave de sessão ativa ao iniciar demo. Produção exige keystore/hardware seguro, além deste MVP.

### Intent e verificação offline

Reutilizar envelope v2, bytes canônicos e Ed25519 do SDK, não transaction Solana com blockhash antigo. Vincular genesis, program, reserve, allowance PDA, payer, signer, merchant, mint, amount, nonce, issuedAt/expiresAt, sequence, displayAmountMinor BRL, fxQuoteId e device hash.

Merchant valida schema/tamanho, assinatura, domínio, signer/payer/mint, merchant binding, valor, expiração, snapshot e replay local. Metadata/FX confiáveis devem ser cacheadas online e pinadas à configuração; QR arbitrário não pode trocar chave pública/issuer confiável. Segundo aparelho do merchant precisa preparar seu cache online; ausência exige preflight, não autoaceitação.

Assinatura/verificação offline: zero RPC, fetch, WebSocket ou backend. QR e payload copiado são obrigatórios e usam o mesmo envelope. Câmera é opcional, com import manual; nunca simular leitura por timer.

### Providers e API

`PaymentProvider` expõe config pública, balance snapshot, session, histórico e fila. SDK fornece wallet, schema/serialização, verification e FX. `SettlementAdapter` fornece createEscrowSession/getSession/settlePayment/cancelSession/getTransactionStatus, mais online payment e history de referência.

Backend existente `POST /api/solana-demo`: state, fxQuote, fund, allowance, session, settle, cancel, status, history, payOnline; extensões receipt (consulta/verificação de recibo) e recycle (transferência restrita de tokens Devnet entre contas de desenvolvimento). Preflight lê deployment público e rejeita mismatch de genesis/cluster/program/mint/FX signer. Gateway preserva/valida origem; sem CORS wildcard para contornar segurança. Polling e retry usam IDs persistidos, não recriam pagamentos. Contas dev hospedadas não são custódia multiusuário de produção.

### FX

Quote assinada por issuer pinado; BRL/USDC 5,50 é taxa fixa de demo, não oracle. R$25 com quote nova → **4.545455 USDC**, arredondamento para cima em microUSDC conforme SDK. Idade até 15 min aceita; 15–30 min aplica buffer 3% explicitamente revisado; a partir de 30 min exige online. Não mudar o valor depois da confirmação.

Merchant valida quote/política ao aceitar. Settlement usa USDC assinado e não recalcula FX. Expiração do intent independente da validade para emissão da quote, limitada à sessão; reutilizar cálculo do SDK. Quote expirada após aceitação não gera repricing no settlement.

### Estados, confirmação e recovery

Offline: draft → authorized_offline → pending_settlement → submitted → confirmed. Online: draft → submitted → confirmed. Rejeições tipadas: rejected/expired. Falha de rede mantém pendência, sem crédito confirmado.

Authorized = assinatura persistida; pending = merchant aceitou localmente; submitted = assinatura de transação, ainda não confirmação. Confirmed exige resultado confirmado/finalizado sem erro na cadeia e reconciliação dos saldos. Mostrar “Autorizado offline · Pendente de liquidação” antes disso. Intent vencido após submissão exige consulta de receipt, não falha inventada.

Replay técnico falho é tentativa separada: não substituir confirmed do original. Deduplicar entries por intent/receipt. Retry após timeout procura status existente antes de reenviar. Wrong signer, insufficient allowance, session revoked/expired e falhas de assinatura preservam saldo/receita confirmados.

### Fiat rail

`PaymentRail`/`FiatRailAdapter`: quote/initiate/getStatus/reconcile. Reutilizar Mercado Pago Orders API do backend, seller access token só servidor, buyer email de teste; idempotency persistente e rejeição live.

Fiat IN: criar ordem teste, QR apenas se retornado, consultar e confirmar somente approval verificado. Fiat OUT: após USDC settlement, payout Pix simulado rotulado. Conversão R$100→USDC é simulação explícita, não aumenta ATA sem transferência de teste verificável.

Processing sem QR fica processing; não gerar BR Code próprio como substituto da ordem e não permitir botão aprovar falsificar provider approval. Polling server-side autenticado atende demo mínima; webhook futuro valida assinatura e consulta provedor. QR de Pix bancário não vira pagamento Pix offline.

## 6. Aceite rastreável

| ID | Cenário obrigatório | Evidência exigida |
| --- | --- | --- |
| AC-01 | App normal consumidor/lojista | Rotas Mobile, header/nav, idiomas, 390px sem overflow; integração nativa |
| AC-02 | Preflight/saldos Devnet | Config/contas/ATA/escrow reais, timestamp; RPC failure não retorna mocks |
| AC-03 | Online R$25 | Merchant recebe 4.545455 USDC com quote nova; tx confirmada, Explorer e saldos antes/depois |
| AC-04 | Sessão online | Chave local criptografada; reserve/allowance PDA, limite, DID, expiração e tx verificáveis |
| AC-05 | PWA offline real | Após preparação, reabrir app/rotas lazy sem rede; unlock/cache/QR/crypto funcionam |
| AC-06 | R$25 offline | Dois browsers com rede bloqueada; zero requests de pagamento; merchant verifica e aceita pendente sem crédito |
| AC-07 | Merchant reconecta sozinho | Liquida com payer ainda offline; ATA creditada/tx confirmada; payer reconcilia depois |
| AC-08 | Histórico | Online/offline/pendentes persistem reload; datas, estados, rejeições, tx e Explorer corretos |
| AC-09 | Replay/tamper/wrong merchant | Replay on-chain falha; alteração BRL/USDC/mint/merchant/signature rejeitada; original permanece confirmado |
| AC-10 | Adversarial 8+8/10 | Sessão financiada 10; A confirma, B excede e rejeita; fixture atacante explícita, UI normal mantém limite |
| AC-11 | Expiração/revogação | Intent/session/quote expirados, wrong signer e cancel/release testados; revogação offline mostra pendência |
| AC-12 | Recovery/idempotência | Refresh, senha incorreta, chave bloqueada, timeout, RPC failure e dupla submissão não duplicam transferência |
| AC-13 | Pix sandbox verdadeiro | Ordem teste, QR retornado e aprovação/consulta verificada; processing sem QR não passa |
| AC-14 | Rails transparentes | Preferência BRL/USDC; settlement real Devnet e conversion/payout simulados identificados, sem crédito fictício |
| AC-15 | Pitch/URL/roteiro | `/pitch` PT-BR/EN-US coerente com provas; URL pública HTTPS persistente; preflight/recovery e roteiro 90s |

AC-10 pode ter evidência automatizada de programa em validator local, mais UI de ataque; demonstração adicional Devnet exige saldo real de teste. Regressões do programa/SDK do repo de referência acompanham versão consumida. Não alterar programa para encenar ataque.

## 7. Preflight e operação

- Não presumir 100/50 USDC: demo compacta requer ≥10 USDC de teste confirmados e composição adequada de saldos. Reservar 5 USDC na sessão e manter saldo livre de ≥4.545455 para online; offline consome 4.545455 da sessão. Narrativa 100/50 exige funding real prévio desses valores de teste.
- Fee payer servidor precisa SOL Devnet; consumer pode ter 0 SOL quando backend patrocina fee. Isso é sponsorship de demo, não integração Kora.
- Preflight verifica programa executável, cluster/genesis/mint, ATAs, funding real, signer FX, cache, sessão, saldo livre/reservado, idioma e backend pronto. Sem saldo, instruir faucet test ou reduzir valor explicitamente antes da assinatura; nunca mintar Circle USDC falso.
- Reexecução verifica sessões/pendências; reset de apresentação não desfaz cadeia, apaga recibos ou credita saldo. Developer Details permite reciclar tokens reais de teste do merchant configurado para o consumer por nova transferência on-chain, sem mint/undo de receipts. Preparar segundo browser merchant online antes de cortar rede.
- Backend: SOLANA_CLUSTER=devnet, SOLANA_RPC_URL, USDC_MINT, keypairs/deployment existentes; secrets permanecem servidor. Mercado Pago: MERCADOPAGO_ACCESS_TOKEN e MERCADOPAGO_TEST_PAYER_EMAIL de teste.
- Vite recebe somente config pública ou URL do gateway. `VITE_SHIMOPAY_API_BASE_URL` é variável planejada, default `/api` em mesma origem; nunca prefixar secrets com VITE_. Env Vercel backend não aparece automaticamente no build Mobile.
- URL entregue deve ser estável. Gateway trata backend sandbox start/resume/readiness; testar após restart e não entregar URL de sandbox expirável como produto.

## 8. Definition of Done

**GATE-CORE:** AC-01 até AC-12 e AC-15 verificados no Mobile integrado, incluindo pagamentos Devnet online/offline, PWA real, adversarial e URL pública. Permite afirmar “Solana online/offline demonstrado”.

**GATE-RAILS:** GATE-CORE + AC-13 e AC-14 verificados. Mercado Pago sem QR/aprovação mantém BLOCKED; a demo completa de rails não está concluída. Continuar trabalho Solana independente.

Cada D01–D09 no [plano](docs/plans.md) exige requisito → código → teste → evidência com commit/data/ambiente. Rodar npm test, npm run lint, npx tsc --noEmit -p tsconfig.app.json e npm run build. Registrar warnings existentes. Scripts test:e2e/demo:preflight/demo:verify e verificações Pix/expiração estão implementados; comandos reais no README.

E2E Playwright em dois contexts independentes, rede bloqueada de verdade, contagem de requests de pagamento e restauração somente merchant. Cachear assets necessários, incluindo rotas lazy, QR, fontes e crypto; não respostas financeiras/RPC/secrets. Guardar JSON/screenshots/tx/blocktime/saldos sem keys/tokens. Fixtures verificam regressão, mas não fecham aceite de provider/Devnet real.

Antes de encerrar implementação: instalar por lockfile; executar checks; iniciar backend/app; verificar deployment existente sem sobrescrever keys; executar online/offline, PWA/adversarial e Pix ou registrar bloqueio; atualizar README, plano, progresso, status, evidências e limitações. Build verde e ledger mock testado não provam integração.

Fora de escopo: fundos reais, mainnet, KYC/PIX/Cora live, banking/card, DEX/oracle, DAO/token, Kora/Solana Pay completos, novos miniapps, app nativo. Interfaces podem evoluir depois dos gates.


## 9. Implementação entregue

- Aplicação: https://shimopay-mobile.vercel.app; consumidor `/customer/home`, merchant `/merchant/dashboard`, guia `/demo`, pitch `/pitch`.
- SDK browser versionado em `vendor/solana-browser`; provider, gateway same-origin, PWA, IndexedDB/WebCrypto, intents e histórico implementados. Legado preservado em rotas preview.
- Provas: R$25 online e offline (4.545455 USDC cada); dois merchants isolados aceitam 8+8/10, segundo rejeitado; expired intent/session, wrong merchant/signer, tamper e replay rejeitados. Cancelamento libera allowance não utilizada.
- Pix: nova ordem ORDTS com QR retornado, depois approved/accredited autenticado; saldo USDC permanece igual. Payout BRL é simulado e rotulado.
- Backend continua em sandbox gerenciado com resume/readiness via Vercel. Consulta de receipt recupera offline e memo/balance binding recupera online sem journal local; janela de recuperação é limitada a 500 registros e falha fechada se não puder concluir a busca.
- Supabase configurado no legado não é dependência financeira; integração atual sem permissão para projeto eqliiqvebzekmencdhqc. Não há auth/custódia multiusuário de produção, Kora, app nativo ou banking live. Fees usam contas de desenvolvimento com SOL.

## UX-08 · Comprovante on-chain

Transações do histórico abrem receipt nativo com tracker enviada/confirmada/finalizada/falhou. Consulta read-only Devnet validada por genesis; valor/decimais/mint, origem/destino e taxa vêm de instruções RPC externas e internas e metadata. Não usar câmbio atual para inventar valor fiat histórico. Falha não representa transferência concluída. Sem dados, mostrar indisponível/retry; cache IndexedDB indica última consulta offline. Explorer é secundário. Download JSON e compartilhamento de link público sem secrets.


### UX-09 — Valores no histórico
Entradas (+) e saídas (−) on-chain relativas à carteira, com valores exatos por ativo. Reservas são movimentos internos; falhas não contabilizam transferências. Taxas SOL separadas. Consulta read-only limitada a duas requisições simultâneas, cache para consulta offline. Sem conversão BRL histórica inventada. 66 testes unitários, teste browser de histórico/receipt/offline, typecheck/build verdes; lint sem erros (8 warnings existentes).

## UX-10 · Conta, meios e acompanhamento

- Perfil cliente/lojista e carteira ativa visíveis; email só de sessão validada; carteira Devnet compartilhada não é apresentada como propriedade do usuário.
- Seleção USDC / BRL Pix / cartão na tela Pagar. USDC mostra revisão antes do envio; Pix e cartão usam API Mercado Pago sandbox, sem converter saldo USDC.
- Loading acompanha a operação aguardada, desativa reenvio e só confirma com retorno real. Cotação alterada exige nova revisão; pedido pendente de outro valor não é enviado silenciosamente.
- Histórico registra valores, meio, origem/destino conhecido e status; separa fiat do saldo on-chain e não duplica assinatura já registrada localmente.
- PIN de seis dígitos: **BLOCKED**, dependente de identidade autenticada com ownership da carteira, verificação de transação no servidor/dispositivo confiável, limitação de tentativas e recuperação. Não substituir a criptografia offline atual por PIN de baixa entropia nem simular autenticação em localStorage. O fluxo publicado continua com revisão/confirmar e a senha criptográfica offline existente.

## UX-11 · Consistência e recebimento

- Páginas públicas sem marcadores editoriais NEEDS_* ou emails fictícios; contato `shimopay@pm.me`. Privacidade/termos descrevem backend, provedores, blockchain pública e armazenamento local atuais.
- Footer usa “Ambiente Sandbox”; detalhes financeiros permanecem nos comprovantes/termos pertinentes.
- Miniapps usam o shell financeiro e perfil ativo: cliente (calculadora de divisão, QR, reserva, comprovantes), lojista (cobrança, recebimento offline, caixa, histórico). Catálogo legado preservado no código, sem rota pública nem alegações de parceiros.
- Sessão inválida é rejeitada antes do RPC com mensagem acionável. Pagamento recebido online pode carregar sessão on-chain automaticamente; validações owner/program/mint/network/assinatura/quote/replay continuam obrigatórias. Offline exige sessão previamente cacheada; nunca inventar confiança.

## UX-12 · Revisão integral da experiência pública

- Varrer as 19 rotas públicas e aliases em 320, 390 e 1440 px. Aplicar a mesma marca, tipografia, foco visível e navegação aos fluxos ativos, onboarding, pitch e erro 404.
- Português consistente na carteira, estados, erros e valores. Pitch com PT/EN completo; remover seletor parcial de idioma dos fluxos que ainda não são bilíngues.
- Remover acesso público a notificações, rede, perfil e administração legados baseados em dados fictícios. Preservar fontes legadas, encaminhando perfil/admin para autenticação, rede para histórico e notificações para pendências reais do aparelho.
- Onboarding não coleta KYC/biometria simulados. Cliente ou lojista escolhe seu fluxo diretamente.
- Cenários sem dados/conexão não inventam saldo, reserva, alertas ou sucesso. Custódia individual e PIN permanecem pendentes.
- Auditoria visual e de interação não equivale a certificação WCAG nem valida aprovação nova de serviços financeiros.
