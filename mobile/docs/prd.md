# ShimoPay PRD v1

Data original: 2026-06-07

> PRD de evolução para produção. Para a entrega atual, prevalece [SPEC.md](../SPEC.md) v2 e o [plano D01–D09](plans.md). Offline e Solana são P0 da demo; auth/KYC/ledger BRL de produção e expansão de miniapps não bloqueiam esse marco. Descrições antigas de estado devem ser conferidas em [progress](progress.md).

Documento alvo para sair do MVP demonstravel e orientar a construcao de um produto implementavel. O `SPEC.md` na raiz é a especificação canônica da entrega atual; este PRD descreve o produto alvo e marca tudo que ainda depende de fonte, decisao ou implementacao.

## 1. Contexto E Objetivo

`CONFIRMED` O MVP atual demonstra ShimoPay como app mobile-web de pagamentos no Brasil, com cliente, lojista, QR, reserva offline, wallet, servicos/miniapps e dashboard. Fontes: `docs/spec.md`, `src/App.tsx`, `src/pages/customer/*`, `src/pages/merchant/Dashboard.tsx`.

`PARTIAL/MOCK` Pagamento, auth, KYC, DID/offline, blockchain, conversao USDC/USDT, relatorios e parceiros sao simulados/localizados no frontend. Fontes: `docs/source-registry.md`, `src/contexts/MockContext.tsx`, `src/pages/Network.tsx`, `src/pages/customer/Wallet.tsx`.

Objetivo do PRD:

- Definir o produto alvo para sair de demo/MVP e chegar a um produto construivel.
- Combinar dois focos escolhidos: QR/offline para lojista como core operacional e turista/cripto como diferencial.
- Especificar app mobile, web/mobile lojista e admin/backoffice.
- Priorizar melhorias tecnicas, produto, negocio, seguranca e operacao sem inventar capacidade real.

## 2. Produto Alvo

Tese:

`INFERRED` ShimoPay deve ser uma rede de pagamento local para Brasil onde cliente paga rapido, lojista recebe com baixo atrito e visitante estrangeiro consegue usar saldo digital/cripto convertido para pagamento em BRL quando permitido e validado.

Proposta de valor alvo:

- Cliente local: pagar e receber em segundos por QR, saldo BRL e historico claro.
- Lojista: cobrar por QR, acompanhar vendas, operar fallback offline limitado e reconciliar recebimentos.
- Visitante/turista: carregar saldo digital, ver conversao para BRL e pagar em comercio local. `NEEDS_SOURCE` para rails, compliance, custody e cambio.
- Operacao/admin: acompanhar usuarios, lojistas, transacoes, risco, suporte, conciliacao e incidentes. `PLANNED` porque nao ha admin no repo.

Nao prometer:

- Pagamento real, Pix real, adquirencia, KYC real, biometria real, liquidacao real, cripto real, DID real, mainnet ou parcerias reais sem fonte.

## 3. Plataformas

| Plataforma | Status atual | Alvo PRD | Prioridade |
| --- | --- | --- | --- |
| App cliente mobile/PWA | `CONFIRMED` mobile-web React | Produto principal para cliente local e visitante | P0 |
| App cliente nativo iOS/Android | `UNKNOWN` | `NEEDS_DECISION` avaliar depois de validar PWA/core loop | P2 |
| Painel lojista web/mobile | `PARTIAL/MOCK` dashboard frontend | Portal operacional para cobrar, vender, relatar e reconciliar | P0 |
| Admin/backoffice | `UNKNOWN/NOT_IMPLEMENTED` | Ferramenta interna para suporte, risco, usuarios, merchants e incidentes | P0/P1 |
| Landing/site publico | `CONFIRMED` landing simples | Marketing e onboarding comercial com claims revisadas | P1 |
| API/backend | `CONFIGURABLE/PARTIAL` Supabase client sem uso funcional | Fonte real de auth, dados, transacoes, merchants e auditoria | P0 |

## 4. Personas

| Persona | Status | Necessidade | Sucesso |
| --- | --- | --- | --- |
| Cliente local | `CONFIRMED` | Pagar/receber rapido, consultar saldo/historico, usar reserva offline limitada | Paga e recebe sem entender detalhes tecnicos |
| Lojista pequeno | `CONFIRMED/INFERRED` | Cobrar, confirmar pagamento, operar em queda de sinal, ver vendas | Recebe com confianca e reduz friccao no caixa |
| Visitante estrangeiro | `PARTIAL/MOCK` | Converter saldo digital para pagar em BRL no comercio | `NEEDS_SOURCE` rails/compliance antes de oferta real |
| Operador/admin | `PLANNED` | Resolver suporte, risco, conciliacao, usuarios, merchants e incidentes | Diminui falhas operacionais e tempo de resposta |
| Parceiro/miniapp | `PARTIAL/MOCK` | Distribuir servicos dentro do ShimoPay | `NEEDS_SOURCE` para relacoes comerciais reais |

## 5. Jornadas Alvo

### 5.1 Cliente Local Paga Por QR

Estado atual: `PARTIAL/MOCK`.

Fluxo alvo P0:

1. Cliente abre app autenticado.
2. Escaneia QR do lojista.
3. App cria/recebe `payment_intent`.
4. Cliente revisa valor, recebedor, metodo e risco.
5. Cliente confirma com PIN/biometria real ou fator definido. `NEEDS_DECISION`
6. Backend autoriza, registra transacao, atualiza saldo e emite recibo.
7. Lojista recebe confirmacao.

Critérios de aceite:

- Pagamento com saldo suficiente altera saldo e historico de cliente e lojista.
- Pagamento recusado nao altera ledger.
- Recibo mostra ID, horario, valor, merchant e status.
- Se a validacao real nao existir, UI deve dizer demo/simulacao.

### 5.2 Lojista Recebe

Estado atual: `PARTIAL/MOCK`.

Fluxo alvo P0:

1. Lojista entra no painel.
2. Cria cobranca por valor fixo ou aberto.
3. Gera QR/link.
4. Acompanha status: criado, aguardando, pago, cancelado, expirado, estornado.
5. Ve vendas recentes e resumo do dia.
6. Exporta relatorio quando backend suportar. `PLANNED`

Critérios de aceite:

- Cobranca tem ID, valor, status, merchant e expiracao.
- Dashboard reflete transacoes reais ou dados claramente marcados como demo.
- Relatorios nao prometem PDF/CSV real sem implementacao.

### 5.3 Reserva Offline Limitada

Estado atual: `PARTIAL/MOCK`.

Fluxo alvo P1, com descoberta P0:

1. Usuario cria allowance offline enquanto online.
2. Allowance tem limite, validade, device identity, contador e regras de risco.
3. No pagamento offline, app gera voucher assinado. `NEEDS_SOURCE` para assinatura real.
4. Lojista valida localmente dentro de limites.
5. Voucher sincroniza quando voltar conexao.
6. Backend liquida, rejeita ou envia para revisao.

Critérios de aceite:

- Offline so existe com limite baixo, expiracao e risco controlado.
- Produto nunca chama isso de liquidacao real enquanto for mock.
- Falhas de sync geram fila, status e caminho de suporte.

### 5.4 Visitante/Turista Com USDC/USDT

Estado atual: `PARTIAL/MOCK`.

Fluxo alvo P1:

1. Visitante escolhe modo visitante.
2. Realiza onboarding/KYC compativel com exigencias legais. `NEEDS_SOURCE`
3. Carrega saldo digital ou saldo parceiro. `NEEDS_SOURCE`
4. App mostra cotacao, taxas, limites e moeda de liquidacao. `NEEDS_DECISION`
5. Visitante paga em BRL no comercio.
6. Recibo mostra origem, conversao e status.

Critérios de aceite:

- Antes de producao, compliance/custody/cambio precisam de fonte.
- Taxas, spread e riscos devem ser transparentes.
- Se rail cripto nao existir, fluxo permanece como demo.

### 5.5 Admin/Backoffice

Estado atual: `UNKNOWN/NOT_IMPLEMENTED`.

Fluxo alvo P0/P1:

1. Operador busca usuario, merchant, transacao ou voucher offline.
2. Ve status, eventos, logs e risco.
3. Resolve suporte, bloqueios, limites e incidentes conforme permissoes.
4. Exporta evidencias para conciliacao/auditoria.

Critérios de aceite:

- Admin deve ter RBAC, auditoria e logs.
- Toda acao sensivel fica registrada.
- Sem admin, o produto nao deve ser considerado pronto para operacao real.

## 6. Requisitos Funcionais

### Auth, Identidade E Onboarding

- `P0` Auth real para cliente e lojista. `NEEDS_DECISION` provider.
- `P0` Tipos de conta: cliente local, visitante, lojista, admin.
- `P0` Estados de conta: demo, pending_verification, active, limited, suspended, closed.
- `P1` KYC/documento/selfie reais se exigidos por rails. `NEEDS_SOURCE`
- `P1` Recuperacao de acesso e gestao de dispositivos.

### Wallet E Saldo

- `P0` Saldo BRL real ou ledger interno definido. `NEEDS_DECISION`
- `P0` Historico persistente e reconciliavel.
- `P0` Recibos com status e rastreabilidade.
- `P1` Saldos visitante/USDC/USDT apenas com fonte de rails e compliance.
- `P1` Limites por conta, metodo, risco e modo offline.

### Pagamentos

- `P0` Payment intent para QR.
- `P0` Estados: created, pending, authorized, paid, failed, expired, refunded, disputed.
- `P0` Confirmacao do cliente e confirmacao do lojista.
- `P0` Falha atomica: erro nao altera saldo/ledger.
- `P1` Estorno, cancelamento e disputa.

### Lojista

- `P0` Cadastro/ativacao de merchant.
- `P0` Gerar QR/cobranca.
- `P0` Lista de vendas e resumo do dia.
- `P1` Relatorios e exportacao.
- `P1` Configuracoes de loja, limites, operadores e notificacoes.

### Offline

- `P0` Especificacao de risco e dados do offline allowance.
- `P1` Implementacao de voucher offline se aprovada.
- `P1` Sync queue, conflitos e suporte.
- `NEEDS_SOURCE` Assinatura, DID/device identity e validade juridica/operacional.

### Visitante/Crypto

- `P1` Modo visitante com termos, limites e riscos.
- `P1` Conversao para BRL com cotacao e taxas visiveis.
- `P1` Comprovante com origem e conversao.
- `NEEDS_SOURCE` Stablecoin, custody, on/off ramp, FX, impostos e compliance.

### Admin/Backoffice

- `P0` Busca de usuario, merchant e transacao.
- `P0` Auditoria de eventos.
- `P0` Acoes de suporte: bloquear, desbloquear, ajustar limite, marcar incidente.
- `P1` Risco/fraude, conciliacao, dispute handling e relatorios internos.

### Miniapps

- `P2` Miniapps curados que reforcem frequencia de pagamento.
- `P2` Contrato de integracao para parceiros.
- `NEEDS_SOURCE` Parcerias reais e regras comerciais.

## 7. Requisitos Nao Funcionais

- Seguranca: auth real, RBAC, secrets seguros, logs de auditoria, protecao contra abuso.
- Privacidade/LGPD: minimizacao, consentimento, retencao, exclusao e acesso a dados. `NEEDS_SOURCE`
- Compliance: pagamentos, KYC, AML, custody, crypto e cambio. `NEEDS_SOURCE`
- Performance: app mobile deve abrir rapido e manter fluxo de pagamento sem friccao.
- Observabilidade: logs, eventos, metricas, alertas e rastreio de incidentes.
- Acessibilidade: fluxos principais utilizaveis com contraste, labels e teclado/leitor quando aplicavel.
- Resiliencia: falhas de rede devem preservar estado e mostrar status claro.
- Operacao: backups, incidentes, rollback, suporte e conciliacao antes de producao.

## 8. Melhorias Do MVP

P0:

- Separar mock de provider real.
- Definir modelo de dominio minimo.
- Criar suite de testes para pagar/receber/historico.
- Definir backend e schema inicial.
- Remover ou rebaixar claims sensiveis sem fonte.
- Criar admin minimo para operacao.

P1:

- Offline allowance/voucher com limite de risco.
- Modo visitante com requisitos legais/comerciais validados.
- Relatorios reais para lojista.
- Observabilidade e incident response.
- UX de onboarding e KYC real.

P2:

- Apps nativos iOS/Android se PWA nao bastar.
- Miniapps/parceiros reais.
- Marketplace de devs.
- Recursos financeiros avancados, credito, seguro ou fidelidade expandida.

## 9. Roadmap

### P0 - Produto Operavel Minimo

Objetivo: cliente paga, lojista recebe, admin suporta.

Inclui:

- Auth real ou provider definido.
- BRL wallet/ledger.
- QR payment intent.
- Merchant dashboard conectado a dados reais.
- Admin minimo.
- Testes core.
- Claims sensiveis revisadas.

### P1 - Diferenciais De Risco Controlado

Objetivo: adicionar offline limitado e visitante/cripto apenas com fonte.

Inclui:

- Offline allowance e sync.
- Visitor mode com compliance/cambio/custody definidos.
- Relatorios e conciliacao.
- Monitoramento e incidentes.

### P2 - Ecossistema

Objetivo: expandir frequencia e distribuicao.

Inclui:

- Miniapps reais.
- Parceiros comerciais.
- App nativo se necessario.
- Marketplace e recursos financeiros adicionais.

## 10. Criterios De Aceite Do PRD

- Toda claim sensivel tem status e fonte/pendencia.
- PRD separa mobile cliente, web/mobile lojista e admin.
- PRD descreve requisitos P0/P1/P2 sem vender mock como real.
- PRD define melhorias tecnicas necessarias para sair do MVP.
- PRD aponta decisoes pendentes antes de implementacao.

## 11. Pendencias

`NEEDS_DECISION`:

- Backend principal e fonte de verdade.
- Modelo de ledger/saldo.
- Provider de auth/KYC.
- Wedge comercial final e pricing.
- Nivel de investimento em app nativo.
- Politica de offline e limites de risco.

`NEEDS_SOURCE`:

- Enquadramento regulatorio.
- Pix, adquirencia, cartoes e liquidacao.
- Stablecoin, custody, cambio e impostos.
- KYC/AML/LGPD.
- Parceiros e marcas.
- SLA, monitoramento e suporte.
- Benchmark de concorrentes e mercado.
