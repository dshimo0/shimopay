# Hackathon prioritization

Score = (User + Demo + Judge + Validation) / (Cost + Failure risk + 1). Escalas 0–5; estimativas ASSUMPTION. Ordem decrescente **entre tarefas cujas dependências já estão satisfeitas**; fundação técnica segue fases do briefing.

| Task / requirement | User | Demo | Judge | Validation | Cost | Risk | Score | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Roteiro e claims honestos | 3 | 5 | 5 | 4 | 1 | 1 | 5.67 | Docs em execução |
| Replay/tamper/overspend/expiry | 5 | 4 | 5 | 4 | 2 | 1 | 4.50 | 20 contract tests aprovados |
| FX demo inteiro/cache | 4 | 4 | 3 | 3 | 1 | 1 | 4.67 | SDK implementado |
| Entrevistas e risk consent | 5 | 2 | 5 | 5 | 2 | 1 | 4.25 | Sem entrevistas; material pronto |
| Consumer/merchant split UI | 5 | 5 | 4 | 3 | 3 | 2 | 2.83 | Implementado, E2E aprovado |
| Key encryption / lock | 5 | 3 | 5 | 3 | 3 | 2 | 2.67 | Implementado/testes |
| Solana reserve/allowance + tests | 5 | 5 | 5 | 3 | 4 | 3 | 2.25 | Contracts aprovados |
| Offline PWA + real reload | 5 | 5 | 5 | 4 | 4 | 4 | 2.11 | Implementado, execução pendente |
| Chain/deploy/receipt E2E | 5 | 5 | 5 | 5 | 4 | 5 | 2.00 | Pendente |
| Scanner camera | 3 | 3 | 2 | 2 | 3 | 3 | 1.43 | DEFER |
| Solana adicional | 2 | 2 | 3 | 1 | 5 | 5 | 0.73 | DEFER |

## Current loop

BUILD: programa Solana/SDK/UX → DEMO: gates de execução → VALIDATE: receipt e offline + entrevistas → RESEARCH: Copilot e alternativas → UPDATE BUSINESS CASE → RE-SCORE → KILL trabalho sem hipótese → BUILD.

Prioridade comercial mais fraca: tração e founder fit sem evidência. Não compensar com arquitetura adicional. Prioridade técnica: build reproduzível e E2E real.
