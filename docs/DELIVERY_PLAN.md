> **Solana migration supersedes EVM-specific criteria in this historical baseline.** Current deliverables and status: [SOLANA_MIGRATION_SPEC](SOLANA_MIGRATION_SPEC.md). The primary demo uses Solana v2 / Ed25519 / Anchor / SPL; no Sepolia/EVM path satisfies the new submission gate.

# Plano de entregas técnico e de negócio

Este documento controla entregáveis; [PRODUCT_SPEC.md](PRODUCT_SPEC.md) controla resultados de negócio; [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) controla implementação; [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) controla aceite.

| Fase | Entregável técnico | Resultado de negócio | Requisitos | Estado |
| --- | --- | --- | --- | --- |
| 1 | Monorepo, Hardhat 3, MockUSDC, vault | Reserva limitada comprovável | BUS-02, TECH-01/02 | Implementado e validado |
| 2 | Testes de contratos | Limites de risco demonstráveis | BUS-06, TECH-03/04/05/06 | 20 testes aprovados |
| 3 | SDK EIP-712 e DID | Autorização e identidade portáveis no domínio | BUS-01, TECH-03/07 | Implementado e validado |
| 4 | Consumer/Merchant | UX compreensível de pagamento | BUS-08 | Implementado e validado local |
| 5 | WebCrypto e IndexedDB | Chave limitada protegida e apagável | BUS-10, TECH-08 | Implementado e validado local |
| 6 | PWA e cache | Pagamento sem conectividade real | BUS-07, TECH-09 | Implementado e validado local |
| 7 | FX e rails | Valor BRL com settlement mock crypto | BUS-03/09, TECH-10 | FX/rails SDK implementados e testados |
| 8 | Adapter e settlement | Recebimento verificável após rede voltar | BUS-05, TECH-11/12 | Implementado e validado local |
| 9 | /demo split view | Apresentação A completa | BUS-02/03/04/05/08 | Implementado e validado local |
| 10 | Adversariais e integração | Rejeições B–E comprovadas | BUS-06, TECH-04/05 | Adversariais unit/integration/E2E aprovados |
| 11 | Arquitetura, segurança e roteiro | Claims tecnicamente defensáveis | Todos | MDs técnicos e de negócio criados; hipóteses comerciais pendentes |
| 12 | Build, lint, testes, deploy, E2E | MVP funcional e reproduzível | Todos | Implementado e validado local |

## Fluxo spec driven / business driven

1. Vincular cada mudança a um BUS-ID e TECH-ID aplicável.
2. Implementar o menor comportamento que cumpre a especificação.
3. Executar a evidência definida no aceite.
4. Registrar resultado e atualizar este quadro; não inferir aprovação pela existência do código.
5. Se uma decisão mudar, atualizar a especificação e limitações antes de declarar entrega.

## Política de escopo

Ambiguidades rotineiras são resolvidas pela opção mais simples, segura e demonstrável. Não incluir novos produtos/rails reais. Novas ideias de produção entram apenas no backlog final, com até dez prioridades.

## Resultado de execução

42 unit tests +2 Playwright E2Es aprovados; lint, typecheck, build, chain/deploy e integração local concluídos. [VALIDATION](VALIDATION.md) registra comandos/receipt. Sepolia não executada; gates comerciais, pesquisa Copilot, assets e submissão continuam pendentes em /biz.
