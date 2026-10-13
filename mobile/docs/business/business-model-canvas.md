# ShimoPay — Business Model Canvas

> Derivado de `docs/business-model.md` e `SPEC.md` (estado do repo shimo-pay-mobile). Produto hoje e **demo mobile-web**: pagamentos, KYC e liquidacao sao simulados. Claims sem fonte ficam como `NEEDS_SOURCE` / `NEEDS_DECISION` / `_TODO_`.

## Parceiros-chave

- Nenhum parceiro real confirmado. Adquirentes, bancos, redes Pix, provedores de KYC, stablecoins: `NEEDS_SOURCE` (`docs/business-model.md`).
- Supabase como infra configuravel — client existe; uso funcional/tabelas nao confirmadas (`CONFIGURABLE/PARTIAL`).
- Marcas/prefeituras/SPTrans exibidos no catalogo de miniapps — relacao comercial inexistente no repo (`NEEDS_SOURCE`).

## Atividades-chave

- Manutencao do dominio puro testado: ledger (pay/receive/fidelidade), modelo de reserva offline com limites de risco, trilha de auditoria append-only — `CONFIRMED`, 24 testes Vitest (`src/domain/*`, `npm test`).
- UX de pagamento: scanner, PIN/WebAuthn, QR escaneavel real, BR Code Pix EMV com CRC16 real — `CONFIRMED/SIMULATED` (settlement sem provedor).
- Operacao demo de backoffice (busca, bloqueios, ajuste de limite offline, auditoria persistida) — `CONFIRMED` como demo, sem RBAC de servidor.
- Baseline LGPD local: consentimento versionado, exportar/apagar dados do titular — `CONFIRMED` (`src/lib/privacy.ts`).

## Recursos-chave

- App React/Vite mobile-first com shell mobile (`ShimoShell`) — `CONFIRMED`.
- Dominio puro testavel desacoplado de UI/localStorage — `CONFIRMED` (decisao de arquitetura central).
- WebAuthn real para confirmacao biometrica nativa com fallback PIN demo — `PARTIAL/REAL` (`src/lib/webauthn.ts`).
- Configuracao de chave Pix via `/admin` (`pixConfig`) — `CONFIGURABLE`.

## Proposta de valor

- Posicionamento inferido mais forte: "pagar e receber rapido, inclusive quando o sinal falha, com aceitacao por pequeno lojista" — `INFERRED` (`docs/business-model.md`, auditoria de repaginacao).
- Cliente: carteira, QR, reserva offline visual, historico, servicos/miniapps — demonstravel em UI.
- Lojista: gerar QR, receber offline, vendas, relatorios e catalogo — demonstravel em UI, backend mock.
- Confiabilidade financeira/liquidacao/compliance reais: `NEEDS_SOURCE` — nao prometer.

## Relacionamento com clientes

- Self-service demo (onboarding simulado, contas demo cliente/lojista) — `CONFIRMED`.
- Suporte/backoffice operacional real: `NEEDS_DECISION`.

## Canais

- App web local / preview Vite / host DigitalOcean preview — `CONFIRMED` (`package.json`, `vite.config.ts`).
- Canal comercial (venda direta a lojista, adquirentes, turismo, app stores, white-label): `NEEDS_DECISION`.

## Segmentos de clientes

| Segmento | Status |
| --- | --- |
| Cliente local (pagar/receber/carteira) | `CONFIRMED` (usuario demo) |
| Lojista pequeno (operador de caixa) | `CONFIRMED` (usuario demo); comprador B2B `INFERRED` |
| Turista/visitante (USDC/USDT → BRL) | `PARTIAL/MOCK` |
| Parceiro/miniapp | `PARTIAL/MOCK` |
| Wedge comercial oficial | `NEEDS_DECISION` |

## Estrutura de custos

- Infra atual ~zero (app estatico + Supabase free) — `_TODO_` valores.
- Custos regulatorios/KYC/adquirência se virar produto real: `NEEDS_SOURCE`.

## Fontes de receita

- **Nenhuma implementada** — `CONFIRMED` por ausencia de billing.
- Hipoteses a decidir (nenhuma apresentada como fato): MDR/taxa por transacao lojista, assinatura de dashboard/relatorios, receita de miniapps/parceiros, spread cambial para turista, freemium B2C + cobranca B2B — todas `NEEDS_DECISION` (`docs/business-model.md`).
