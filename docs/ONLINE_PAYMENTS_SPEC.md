# Online on-chain payments — business and engineering delivery

## Business outcome

A merchant charges R$25 online. The consumer transfers the configured test USDC directly from its wallet ATA to the merchant ATA, with confirmed signature, updated balances and readable history. Unlike the offline path, this does not use a session key or consume offline allowance. Display currency is BRL; transfer asset remains test USDC. Fiat conversion is not implied.

## Acceptance gates

- Fixed consumer → merchant test accounts, same configured mint, six-decimal checked SPL transfer. Devnet requires Circle official mint and exact Devnet genesis; mainnet refused.
- Signed demo FX quote verified on server; BRL/USDC amount mismatch rejected. Demo amount is positive and bounded at R$100.
- Signed transaction is persisted before broadcast, under ignored server-only `.solana/online-payments`. Same UUID plus same bound payment returns original confirmed signature. A changed amount/quote/context conflicts. Unknown confirmation keeps original request pending, without automatically signing a second transfer.
- Direct transfers debit unreserved consumer ATA. Vault balance and active allowance stay unchanged.
- UI pt-BR/en-US online action, explicit awaiting/confirmed status, signature and local history; wallet token-account RPC history recovers signatures in a new browser.
- Real/simulated consumer offline blocks online action and adapter request. Offline authorization path remains available separately.

## Architecture / limits

Development master accounts remain server-managed demo keys. Only online requests invoke that development master signer. Offline requests still use the encrypted limited device key. This is not production custody or a wallet adapter integration. Native fee sponsorship, Solana Pay URL compatibility and mainnet are not implemented. The direct-payment API remains a bounded shared demo and has no arbitrary recipient/mint/signing payload.

Request serialization uses the existing single-process API mutation lock. A multi-instance production service needs a transactional idempotency database and authenticated authorization. A persisted ambiguous/expired transaction must be investigated before a new payment is created; there is no automatic second charge. Signed bytes are server-only and contain no private key. Backend restart recovery is verified by a real transfer test.

## Demo sequence

Fund consumer test wallet. In the merchant amount field choose R$25. Click **Pay online on-chain / Pagar online on-chain**. Observe pending then confirmed, merchant +4.545455 USDC, consumer free balance −4.545455 USDC, escrow unchanged. Open Transactions to see online record and wallet token-account signature. Then show the separate offline reserve → authorization → merchant reconnection → escrow settlement path.

## Evidence gate

Local SPL transactions prove engineering behavior only. Public Devnet proof is still conditional on funding, deployment and Circle faucet USDC. Explorer links are public only for actual configured Devnet signatures. No Pix confirmation or fiat payout is asserted by this change.

## Executed validation — 11/10/2026

43 Solana tests passed (21 protocol/FX/guards, 18 program/RPC, 4 direct online transfer/idempotency tests). All 8 Playwright tests passed, including direct transfer balances/history and offline refusal. Lint, typecheck and production build passed. Hosted HTTPS direct transfer confirmed merchant +4,545,455 micro-units, matching wallet debit, unchanged escrow, same-signature/no-second-debit on retry, and offline disabled action. Evidence: `docs/evidence/online-cloud-payment.json`. This is Localnet, not public Circle Devnet proof.
