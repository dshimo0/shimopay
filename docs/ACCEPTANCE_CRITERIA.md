> **Solana migration supersedes EVM-specific criteria in this historical baseline.** Current deliverables and status: [SOLANA_MIGRATION_SPEC](SOLANA_MIGRATION_SPEC.md). The primary demo uses Solana v2 / Ed25519 / Anchor / SPL; no Sepolia/EVM path satisfies the new submission gate.

# Critérios de aceite e evidências

Status geral: **validado tecnicamente em local; gates comerciais/submissão separados**. Um teste escrito não equivale a teste aprovado.

| Cenário | Procedimento | Resultado exigido | Estado | Evidência |
| --- | --- | --- | --- | --- |
| A — normal | 100 mUSDC, reservar 50, R$25 offline, aceitar, online, liquidar | Merchant recebe 4.545455 mUSDC; tx hash; allowance diminui | Validado local | 2 Playwright E2Es + docs/evidence/local-integration.json |
| B — replay | Enviar novamente o mesmo intent | NonceAlreadyUsed; nenhuma transferência adicional | Validado | packages/contracts/test/vault.ts;20 testes aprovados |
| C — overspending | Assinar A=8 e B=8 em sessão de 10 antes de liquidar | A sucesso; B InsufficientSessionBalance | Validado | packages/contracts/test/vault.ts;20 testes aprovados |
| D — expired | Liquidar intent expirado | IntentExpired; sem transferência | Validado | packages/contracts/test/vault.ts;20 testes aprovados |
| E — tamper | Alterar R$25 para R$250 após assinatura | InvalidSignature localmente e on-chain | Validado | Tests protocol/contract + Playwright tamper |
| F — offline real | Visitar PWA, desligar browser network, reabrir, desbloquear, pagar e verificar | Assets e estado disponíveis; nenhuma dependência de RPC para assinar/verificar | Validado | Playwright browser offline + reload |
| G — key safety | Inspecionar IndexedDB e testar lock/senha incorreta/remoção | Somente ciphertext persistido; lock impede assinatura | Validado | WebCrypto6 tests + IndexedDB browser check |

## Definition of Done

- [x] Instalação de dependências concluída com lockfile
- [x] Contratos compilados
- [x] Testes de contratos executados e aprovados
- [x] Testes de protocolo e SDK executados e aprovados
- [x] Lint aprovado
- [x] Typecheck aprovado
- [x] Build frontend aprovado
- [x] Blockchain local iniciada
- [x] Deploy local realizado e endereços registrados
- [x] Transação completa validada por receipt e saldo do merchant
- [x] E2E executado ou impedimento exato com integração equivalente
- [x] Offline simulado e offline real verificados
- [x] Docs e comandos conferidos contra execução real
- [x] Limitações residuais documentadas

## Regra de conclusão

Cada requisito só muda para **validado** com comando, resultado e artefato reproduzível em [VALIDATION.md](VALIDATION.md). Se um gate falhar, o MVP não está concluído. Sepolia sem RPC/key não bloqueia aceite local; deve ficar explicitamente como não executada.
