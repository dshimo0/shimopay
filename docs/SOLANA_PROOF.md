# ShimoPay — Solana proof

## Read this first: public Devnet gate is NOT complete

The implementation executes a real Anchor program and real SPL transfers on a Solana local validator. The public Devnet program has **not** been deployed. At 2026-10-11T17:59:17.063Z, the deployer held **0 lamports** and Devnet `getAccountInfo` reported no executable program at the intended ID. The faucet returned 429. There is no Devnet reserve, allowance, settlement signature or public Explorer proof to claim yet. Local transaction signatures below are not publicly inspectable Devnet signatures.

To unblock, fund development-only deployer `9mhC1YCwDzPqK72kkafKJRmnG6dEffFsazCtMzcB2t4q` with approximately 5 **Devnet test SOL** from https://faucet.solana.com, then run `SOLANA_RPC_URL=https://api.devnet.solana.com pnpm deploy:solana:devnet`. No mainnet assets or private keys are needed from the founder. After successful deployment, run the browser demo and record confirmed receipts and Devnet Explorer URLs here. No submission-ready claim is justified until that is done.

## Inspect the working implementation

- Stable hosted entry: https://shimopay-demo.vercel.app → Iniciar ou retomar demo.
- Current hosted cluster: **SOLANA LOCALNET**, with private RPC and an actual Agave validator. Its badge is deliberately not Devnet.
- Program ID: `9iWAPSp9p9mbQ7LouMZEdt3qhtpnZGiaSyoCBSXDPYKg`.
- Program: `programs/shimopay/src/lib.rs` (Anchor 0.32).
- Canonical protocol/verifier: `packages/solana/src/protocol.ts`.
- Transaction builder and authoritative state: `packages/solana/src/server.ts`.
- Default browser adapter: `packages/solana/src/index.ts`.
- User-visible proof: split demo, Solana Proof panel, confirmed settlement signature and Explorer links.
- Compiled SBF artifact SHA-256: `f82533ea4cb7bfb1dfc1c79829dee2c98a1e94033ad9d4e56a33a60be1c59c3c`. Build reproducibility may vary with compiler/version; this is the tested artifact, not a reproducibility claim.

## Confirmed local program integration example

Recorded 2026-10-11T18:13:46.860Z in [machine-readable evidence](evidence/solana-localnet-payment.json).

| Item | Actual value |
|---|---|
| Cluster | localnet |
| Genesis | `JBEjsrR82bFRkR5EDyYLuc9arBamYDkjCPCK7B5vZZEq` |
| Demo SPL mint | `HumsZKeRVro2KmPmJQ5osm9B6EETGfiqrMysghgqJTPJ` |
| Consumer | `BXZsykJqowbQGSsWv8o4u7g5qjZLKgGwAm5ibgbT5io4` |
| Merchant | `AKHqepJYQZf8eb5ViSZhzEpY2DigGmGSkvA3M1qDDZ8N` |
| UserReserve PDA | `7NT1EguvsvX1Vyw6HQAjwAzThH2u3Rzjre1xWf8iPF3E` |
| Vault token account | `7vFDai45tnemPpqkdjkxpXgCaseUX7aVYwgLK7V5RBDi` |
| OfflineAllowance PDA | `AbTNx4ycs7kbJsTU4Rz2P1ykpmcA2L7WEKkZQx3EjYbp` |
| Receipt PDA | `8bexDcf3uRzSCrRkDqMC41Ci6WTvZGWiDf7hHUhkNL6h` |
| Reserve transaction | `3otmpv6SNqDQkm1M9EwktiJmHp7Je89z5P1MQvLxmFzLrDLdiQMkzrMCeW17zGWydSyEsCvJsiWUo9YsNd94aWa` |
| Allowance transaction | `2oUi89HHY3jArhn2idojyYYWR24inY4kphvKNGcmeRjrFm2UAh9zv9KkUvZ21e6QJBQjS7LmyN9GZTXkHwn6ecsP` |
| Settlement transaction | `3euPfavTnqWYLKDQBorQ6AEVjnq1h1meyaUs8Pr4MFZ9AUEiZawa8PF18L8eRCHgzYKn5ixmhjFHiywBBhzWeHRU` |
| Merchant token increase | 4,545,455 micro-units = 4.545455 Demo USDC |
| Replay | actual receipt-PDA initialization rejected; second transfer did not occur |

Solana Explorer can be configured to a local/custom RPC at `http://127.0.0.1:8899` on the machine running that validator. The standard public Devnet Explorer cannot see these local transactions. The hosted local RPC is intentionally private.

## Hosted browser evidence

[evidence/solana-cloud-demo.json](evidence/solana-cloud-demo.json), recorded 2026-10-11T18:16:12.373Z:

- URL: https://sb-3ep2qj5yh459.vercel.run/demo (temporary; use the stable entry after expiry).
- Cluster: localnet.
- Program deployment signature: `5Y8DgmcC7USNaqsZ9zymRveERikPpCfwoMu7bqC1Ax9zf9a2See63LrwYaJNTjotcXYX8f3CXNncdTrGnqeG2DtJ`.
- Mint: `FGx7xUwoToVPiQM6YL2bfaaRYQ6fMbHXU4wsnJdj7Zp1`.
- Reserve: `B1XocbvWKr45JdQZMhCrtgYApfoXjjFVCpN2ruCvw3HG`; vault: `68kWfbf3S3A69U1TLUe1UqSn2zduBmpn1jyYsrdYHhqk`.
- Confirmed settlement: `2TK4ynkS9h84hWGfeKkcMZdfsGwsHo9oNgM4RxwRnVLnP5ftUXp2anvhEZAqqKSVDTPYYFNCwFBKef7amWz1NxhE`.
- Application API requests during offline authorization/acceptance: **0**.
- Replay and tampered BRL amount: rejected.
- Screenshot: [Solana cloud demo](evidence/solana-cloud-demo.png).

The proof script checks the real transaction status through the server's Solana connection. It does not substitute IndexedDB state for settlement. This is engineering evidence, not independent public Devnet verification.

## Program instructions and PDA definitions

| Account | Seeds under ShimoPay Program ID | Authority/policy |
|---|---|---|
| UserReserve | UTF-8 `reserve`, owner pubkey (32), mint pubkey (32) | owner deposits/withdraws available reserve; stored vault is ATA owned by reserve PDA |
| OfflineAllowance | UTF-8 `allowance`, reserve pubkey (32), sessionId (32) | distinct session Ed25519 key, allocated maximum, spent amount, expiry, active status |
| SettlementReceipt | UTF-8 `receipt`, allowance pubkey (32), nonce (32) | init-only permanent replay record with SHA-256 intent hash, merchant, amount and settlement time |
| Vault ATA | standard SPL Associated Token Account derivation for reserve PDA + mint + Token Program | program signs CPI with UserReserve seeds/bump |

Instructions: `initialize_reserve(network)`, `deposit(amount)`, `create_allowance(session_key, session_id, maximum_amount, expires_at)`, `settle(domain, intent)`, `cancel_allowance()`, `withdraw(amount)`. Cancellation marks expired allowances accordingly and returns unspent allocation to available reserve. Available reserve excludes allocated funds; spent amount tracks consumption of the allocated allowance. This prevents a second deduction from available balance.

Settlement immediately follows an Ed25519 precompile. Signature/key bytes are self-contained; message bytes are referenced only at offset 8 of the current settlement instruction. The program checks the exact message, signer and offsets, domain, consumer, merchant, mint, active state, strict expiry, remaining allocation and actual vault balance before SPL transfer. The compact reference avoids exceeding Solana's transaction size limit.

## Reproduce and verify

```bash
pnpm install
# Fresh clone only, if you do not have the original ignored program keypair:
pnpm setup:solana
pnpm build:solana
pnpm chain
# Another terminal:
SOLANA_RPC_URL=http://127.0.0.1:8899 pnpm deploy:solana:local
pnpm test:solana
# Fresh deployment for a clean browser workflow:
SOLANA_RPC_URL=http://127.0.0.1:8899 pnpm deploy:solana:local
pnpm demo
pnpm test:e2e
```

Localnet automated tests cover real reserve deposit, over-allocation, master/session separation, successful SPL transfer and spent amount, receipt replay, two 8-token intents against 10, amount/merchant tampering, wrong merchant/session/mint/network, expiry, invalid/missing/substituted Ed25519 verification, cancellation and refund. Browser tests prove offline signing and merchant checks and real PWA reload without network.

Devnet public verification will use:

```text
https://explorer.solana.com/address/<confirmed-program-id>?cluster=devnet
https://explorer.solana.com/address/<confirmed-mint>?cluster=devnet
https://explorer.solana.com/tx/<confirmed-reserve-signature>?cluster=devnet
https://explorer.solana.com/tx/<confirmed-allowance-signature>?cluster=devnet
https://explorer.solana.com/tx/<confirmed-settlement-signature>?cluster=devnet
```

These are URL templates, not fabricated transaction records. Actual links are filled only after confirmation on the public cluster. See [SECURITY_MODEL](SECURITY_MODEL.md) for residual risk; isolated merchants can accept conflicting intents before eventual settlement, and escrow bounds on-chain spending rather than all merchant losses.

## Accessible transaction history

Open **Transactions** (consumer) or **Transaction history** (merchant). The app recovers reserve-PDA transactions with `getSignaturesForAddress` at confirmed commitment, 20 records per page, independent of local intent records. Each entry includes signature, status, slot and block timestamp when returned. **Refresh history** and **Load older transactions** require connectivity. IndexedDB preserves cached history for offline viewing.

When the actual deployment cluster is Devnet, each record exposes a public Solana Explorer transaction link with `?cluster=devnet`, and the reserve PDA exposes its public account/history link. Localnet history is clearly labeled and does not produce public Devnet links. Public availability depends on successful Devnet deployment, actual signatures and the network/provider's retention policy. The current lack of test SOL still blocks that public proof; no synthetic signatures are presented as Devnet transactions.
