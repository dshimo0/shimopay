> **Solana migration supersedes EVM-specific criteria in this historical baseline.** Current deliverables and status: [SOLANA_MIGRATION_SPEC](SOLANA_MIGRATION_SPEC.md). The primary demo uses Solana v2 / Ed25519 / Anchor / SPL; no Sepolia/EVM path satisfies the new submission gate.

# ShimoPay — especificação técnica

Status: baseline v0.1. Fonte de verdade para decisões técnicas e interfaces do MVP.

## Objeto central: OfflineSession

A sessão conecta `id`, `payerDid`, `deviceDid`, `owner`, `sessionSigner`, `token`, `maxAmount`, `spentAmount`, `expiresAt`, `active`, restrição opcional de merchant, chain/domain, snapshot cacheado, quote cacheado e intents assinados. A blockchain é fonte de verdade para reserva e settlement; o cache permite decisões offline sob risco residual.

## Requisitos e invariantes

| ID | Especificação | Evidência exigida |
| --- | --- | --- |
| TECH-01 | Depósito ERC-20 com SafeERC20; fundos disponíveis separados dos reservados | Testes de conservação, reserva acima do saldo e liberação |
| TECH-02 | Session signer diferente de owner, validade e limite registrados on-chain | Testes de criação e rejeição da chave principal como signer |
| TECH-03 | EIP-712 liga sessão, payer, merchant, token, valor, fiat, quote, sequência, nonce e tempo | Vetor SDK/contrato e testes de adulteração/domain |
| TECH-04 | Settlement exige merchant caller e session signer; limites e expiry prevalecem | Testes de caller, assinatura, token, owner e expiração |
| TECH-05 | Replay protegido por sessão + nonce e sessão + sequência | Repetição falha; novo nonce com sequência usada falha |
| TECH-06 | Estado atualizado antes de transferência; nonReentrant nas mutações | Teste de callback malicioso e conservação de fundos |
| TECH-07 | DID did:pkh com namespace eip155 e endereço validado | Testes generate/parse/validate/address |
| TECH-08 | IndexedDB guarda chave cifrada e metadados; chave descriptografada só em memória | Testes WebCrypto, senha errada, lock/unlock e inspeção do storage |
| TECH-09 | PWA cacheia assets necessários; operações de rede passam por connectivity gate | E2E simulado e browser offline real após primeira visita |
| TECH-10 | Quote fixo demo com hash e validade; conversão inteira arredonda para cima | Testes validade, adulteração e R$25 → 4.545455 |
| TECH-11 | SettlementAdapter contém operações dependentes do chain | Revisão das chamadas; EvmSettlementAdapter e mock rail |
| TECH-12 | Deploy usa JSON-RPC configurável e sem secrets versionados | Deploy local executado; Sepolia somente se configurada |

## Estados

Sessão: indisponível → criando online → ready/locked → unlocked → cancellation pending ou expired → closed.

Pagamento: invoice → signed offline → accepted/pending settlement → submitting online → settled ou rejected.

`accepted` nunca significa `settled`. Saldo offline local desconta intents emitidos; esse desconto não impede rollback/cópias maliciosas em outros dispositivos.

## Decisões de implementação

- D-01: reserva consome saldo disponível no vault; cancelamento/expiração devolve saldo disponível, sacável por `withdraw`.
- D-02: settlement chamado pelo merchant. Relayer genérico fica fora do MVP para impedir caller não autorizado.
- D-03: sessão revogada invalida intents ainda pendentes; comunicar este risco ao merchant.
- D-04: rate demo 550 centavos BRL por USDC; operações usam inteiros, 6 decimais, arredondamento para cima.
- D-05: hash de quote prova integridade relativa ao cache confiável, não autenticidade nem preço de mercado. Assinatura/oracle confiável é passo de produção.
- D-06: EIP-712 é implementação EVM v1. Adapter permite preservar o modelo de domínio; Solana exigirá novo formato de assinatura/verificador, sem promessa de compatibilidade binária com EIP-712.
- D-07: tokens fee-on-transfer são rejeitados no depósito. Rebasing e tokens arbitrários não são suportados pelo produto.

## Restrições de segurança

Somente contas de desenvolvimento. Não persistir master private key. Não persistir session key plaintext. Não confiar em metadata recebida de QR como snapshot de chain: merchant precisa de cache obtido online. Verificação offline não observa revogação ou gasto concorrente posterior ao snapshot.
