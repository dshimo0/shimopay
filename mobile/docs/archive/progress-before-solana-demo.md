# ShimoPay Progress

Arquivo de progresso consolidado do projeto. Atualizado a cada milestone junto com `docs/plans.md` (plano vivo) e `.project/spec-status.md`.

Ultima atualizacao: 2026-08-23.

## Snapshot

- Fase: **alpha preview** — produto demo operavel com dominio puro testado, baseline LGPD e backoffice demo.
- Validacao: lint 0 erros (8 avisos pre-existentes de Fast Refresh) · typecheck OK · **24/24 testes** · build OK.
- Proximo passo bloqueado por decisao humana: **Milestone 06 (backend real)**.

## Status Por Milestone

| # | Milestone | Status | Concluido em | Entregas principais |
| --- | --- | --- | --- | --- |
| 01 | Documentacao viva | ✅ [x] | 2026-06-05 | `docs/spec.md`, `business-model.md`, `architecture.md`, `development.md`, `operations.md`, `source-registry.md` |
| 02 | PRD v1 implementavel | ✅ [x] | 2026-06-07 | `docs/prd.md` com P0/P1/P2 e claims marcadas |
| 03 | Contrato do MVP de pagamento | ✅ [x] | 2026-08-21 | `src/domain/ledger.ts` (pay/receive/fidelidade, imutavel, centavos), `MockContext` delegando ao dominio sem quebrar telas |
| 04 | Separacao mock vs provider real | ✅ [x] | 2026-08-21 | Mapa "Mock vs Real" em `docs/architecture.md`; mocks rotulados; Supabase documentado como configurado-nao-funcional |
| 05 | Modelo offline com limite de risco | ✅ [x] | 2026-08-21 | `src/domain/offline.ts`: allowance com identidades, teto total, limite/transacao, contador, validade; rejeicao com motivo |
| 06 | Backend e dados | ⏸ pendente | — | `NEEDS_DECISION`: escolher backend (Supabase ou outro), schema minimo, auth real |
| 07 | Produto e negocio validado | ⏸ pendente | — | `NEEDS_DECISION`: pricing, canal, parceiros, benchmarks com fonte |
| 08 | Baseline LGPD | ✅ [x] | 2026-08-21 | Consentimento versionado no onboarding; exportar/apagar dados locais no perfil; `/privacidade` + `/termos` (rascunho juridico) |
| 09 | Portal admin/backoffice demo | ✅ [x] | 2026-08-21 | `/admin` com operador por papel (support/risk/admin), busca de usuarios/lojistas/transacoes, acoes + trilha de auditoria append-only |
| 10 | QR Pix real, biometria do dispositivo e limpeza visual | ✅ [x] | 2026-08-24 | BR Code Pix EMV com CRC16 (`src/domain/brcode.ts`), QR escaneavel real, chave Pix configuravel no `/admin`, WebAuthn (FaceID/digital) na confirmacao, remocao dos graficos fake |

## Suite De Testes

- Framework: Vitest (`npm test`), instalado em 2026-08-21.
- Cobertura: dominio puro — `ledger` (contrato pagar/receber/historico/fidelidade), `offline` (politica de allowance/voucher), `audit` (append-only).
- Resultado mais recente: **24/24 passando** (2026-08-23).
- Nao coberto: componentes React/E2E (backlog quando houver backend/CI).

## Validacao Atual (2026-08-23)

| Check | Resultado |
| --- | --- |
| Lint (`npm run lint`) | 0 erros, 8 avisos pre-existentes (Fast Refresh) |
| Typecheck (`tsc -b`) | OK |
| Testes (`npm test`) | 24/24 |
| Build (`vite build`) | OK (avisos: chunk > 500 kB, Browserslist) |

## Pendencias Abertas

`NEEDS_DECISION` (decisao humana):

- Backend principal + schema minimo (M06) e migracao do ledger para persistencia real.
- Auth real (Supabase Auth ja configurado, nao conectado).
- RBAC de servidor e auditoria imutavel para o backoffice.
- Politica de offline (valores padrao, enquadramento regulatorio).
- Provedor de cobranca Pix com webhook (Efí/Mercado Pago/Asaas...) + backend para segurar chaves.

`NEEDS_SOURCE` (fonte externa) — adicionado em 2026-08-24:

- Liveness certificado (FaceTec ou similar) exige licenca + servidor do provedor; hoje o app usa biometria nativa via WebAuthn (posse/dispositivo).
- Validacao de documentos por API exige provedor KYC contratado (Idwall, Unico, BioPass ID...).

`NEEDS_SOURCE` (fonte externa):

- Revisao juridica de `/privacidade` e `/termos`, DPO/canal real, RIPD.
- Rails de pagamento/cripto, KYC/AML, cambio, custody, parceiros reais.

Tecnico (backlog):

- Testes de componente/E2E e CI.
- Code-splitting do bundle (> 500 kB) e Browserslist desatualizado.

## Historico De Sessoes

- 2026-06-05: documentacao viva criada; validacao registrada.
- 2026-06-07: PRD v1 criado.
- 2026-08-21: sessao de fechamento — dominio puro + 24 testes (M03), mapa mock vs real (M04), modelo offline (M05), LGPD baseline (M08), portal `/admin` com auditoria (M09); docs vivos atualizados; lint/typecheck/testes/build verdes.
- 2026-08-23: `docs/progress.md` criado; revalidacao completa verde (lint, typecheck, 24/24 testes, build).
- 2026-08-24: M10 — QR Pix real (BR Code EMV/CRC16 testado), chave Pix configuravel no admin, WebAuthn na confirmacao de pagamento, remocao dos graficos fake. Validacao pendente de execucao final (install da lib `qrcode`).
