# Settlement boundary

`SolanaSettlementAdapter` is the default and only required working rail for this submission. It exposes createEscrowSession, getSession, settlePayment, cancelSession and getTransactionStatus. Browser transport is a gated same-origin development API; the server performs real Anchor/SPL transactions and reads accounts back after confirmation.

Protocol v2 uses Solana public keys, a cluster genesis hash, program/PDA binding and Ed25519. The central OfflineSession abstraction (identity + device capability + reserve + policy + FX + intent) is reusable. Wire format, signing domain and on-chain verifier are chain-specific and must be explicitly versioned for a future rail; an adapter alone does not make signed Solana bytes compatible with EVM/Sui.

The EVM adapter and EIP-712 v1 remain isolated legacy references. No future rail is implemented or claimed by the main demo.

The fiat test boundary is `PaymentRail` in `packages/sdk/src/fiat.ts` (quote/initiate/getStatus/reconcile). `MercadoPagoPixAdapter` uses provider TEST credentials and live_mode:false checks; its HTTP fixture tests do not prove actual provider Pix availability. Circle Devnet crypto settlement does not implicitly convert Pix or perform fiat payouts. Kora and Solana Pay remain P1.

The online crypto branch is `SolanaSettlementAdapter.payOnline`, separate from escrow settlement. UI passes a bounded BRL amount, signed quote and request UUID; Solana transaction construction remains server-side. Direct checked SPL transfer is implemented, while Solana Pay URL/QR compatibility and Kora remain deferred. Existing EVM escrow implementation remains isolated.
