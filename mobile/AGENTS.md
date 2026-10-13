# ShimoPay Mobile — execução spec-driven

Leia `SPEC.md` (contrato canônico), `docs/plans.md`, `docs/progress.md` e `.project/spec-status.md` antes de alterações. O marco atual é a demo funcional Mobile integrada ao protocolo Solana; decisões técnicas e escopo estão fechados nesses MDs.

Execute D01–D09 em dependência, com rastreabilidade AC-01–AC-15. Separe mocks da camada financeira e preserve os miniapps existentes. Não invente saldos, assinatura, settlement, hash ou confirmação Pix. Reutilize SDK/bytes canônicos/contratos do repo Solana; secrets/master keys não entram no browser. Chave de sessão offline criptografada localmente.

Não marque entrega concluída sem evidência no Mobile. Registre erro/bloqueio concreto e continue trabalho independente; não repita perguntas de arquitetura já resolvidas. Production KYC/banking/mainnet não bloqueiam a demo de desenvolvimento.

Alteração runtime: executar testes, lint, typecheck, build e verificações de integração aplicáveis; atualizar docs/status/evidência. Alteração somente documental: verificar links, IDs, dependências e consistência de status; não alegar que isso implementa runtime.
