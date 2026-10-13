> **Solana migration supersedes EVM-specific criteria in this historical baseline.** Current deliverables and status: [SOLANA_MIGRATION_SPEC](docs/SOLANA_MIGRATION_SPEC.md). The primary demo uses Solana v2 / Ed25519 / Anchor / SPL; no Sepolia/EVM path satisfies the new submission gate.

# ShimoPay — fonte de verdade da entrega

## Objetivo

Provar que uma OfflineSession vinculada a DID e respaldada por escrow pode autorizar pagamentos limitados sem internet e liquidá-los on-chain quando a conexão retorna. Somente contas de desenvolvimento e mock USDC.

## Fontes normativas

1. Briefings do usuário: instruções técnicas e BUSINESS-DRIVEN DELIVERY.
2. [Negócio](biz/BIZ.md): customer, wedge, hipóteses e critérios de viabilidade.
3. [Produto](docs/PRODUCT_SPEC.md): BUS-01 a BUS-10.
4. [Técnica](docs/TECHNICAL_SPEC.md): TECH-01 a TECH-12 e decisões.
5. [Aceite](docs/ACCEPTANCE_CRITERIA.md): cenários A–G e Definition of Done.
6. [Entregas](docs/DELIVERY_PLAN.md) e [priorização](biz/PRIORITIZATION.md).
7. [Evidência técnica](docs/VALIDATION.md) e [evidência de negócio](biz/EVIDENCE.md).

## Gates independentes

**Gate técnico:** compile, unit tests, protocol/crypto tests, lint, typecheck, frontend build, chain/deploy, transferência validada por receipt/saldo, E2E e offline real.

**Gate comercial:** dor específica, alternativa comparada, consentimento ao risco e disposição de pagar observados. Não inferir a partir de testes de código.

**Gate submissão:** [SUBMISSION_CHECKLIST](biz/SUBMISSION_CHECKLIST.md), regras atuais do evento e [CHAMPION_GATE](biz/CHAMPION_GATE.md). MVP técnico aprovado não autoriza declarar traction ou submission-ready.

## Regra de mudança

Toda feature recebe hipótese, persona, contribuição de demo/pitch/judge, métrica, custo, risco e BUILD/DEFER/KILL em [FEATURE_DECISIONS](biz/FEATURE_DECISIONS.md). Ordem por prioridade dentro das dependências; nunca reabrir escopo só por interesse técnico.

O MVP permanece EVM. Solana não será implementada nesta entrega. Multi-rail fiat é simulação/expansão, sem payout real. Nenhuma publicação, contato externo ou submissão é feita por esta especificação.
