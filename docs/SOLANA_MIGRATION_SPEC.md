# ShimoPay Solana delivery specification — 2026-10-11

Source: founder's uploaded migration request. Supersedes the EVM-first main demo specification; existing EVM implementation remains a legacy reference.

Business outcome: a hackathon judge independently verifies prefunded offline authorization and real SPL settlement on Solana Devnet in under 60 seconds. No real assets, no claim that the chain operates offline, no fabricated transaction evidence.

## Deliverables and acceptance gates

- [x] Anchor program: UserReserve, OfflineAllowance, SettlementReceipt PDAs; SPL vault; deposit, reserve allocation, settle, cancel/expire.
- [x] Canonical Solana v2 intent and Ed25519 session signer, encrypted device key, cached verification with no RPC.
- [x] SolanaSettlementAdapter is the demo default. Existing split-screen and PWA preserved.
- [x] Visible cluster badge, Solana Proof panel, on-chain balances, actual signatures and Explorer links.
- [x] Real validator execution and adversarial tests: replay, tamper, wrong merchant/key, expiry, allowance overspend, insufficient reserve.
- [ ] Devnet program deployment and reserve/allowance/settlement receipts, independently inspectable.
- [x] Build, lint, typecheck, browser integration and offline behavior verified.
- [x] README, security model and SOLANA_PROOF updated; cloud demo published.

## Decisions

Solana protocol version 2 uses a fixed-width binary canonical message, signed with Ed25519, bound to cluster genesis hash and program ID. This is a protocol version change; EIP-712 remains legacy only. Browser session secrets never reach the backend. Demo master accounts are server-held development-only keypairs; the API constructs only supported program/token transactions. SOL pays development transaction fees; USDC is a mock SPL mint. An Ed25519 precompile instruction immediately preceding settlement verifies exactly the canonical message, with self-contained public key/signature offsets and a message reference restricted to offset 8 of the current settlement instruction (saving duplicate message bytes to fit Solana’s transaction size limit). A receipt PDA keyed by allowance and nonce enforces replay protection.

Unspent allocation returns to available reserve after cancellation or expiry. Reserve funds remain in the vault until settlement or owner withdrawal. Offline snapshots cannot detect concurrent isolated spending or revocation; settlement is authoritative. A new deployment generation invalidates local cached allowance metadata.

## Evidence discipline

Tests, signatures, addresses and deployment status are filled only after actual execution. Devnet faucet/RPC availability is an external dependency; a failure must be reported without substituting fake Devnet evidence. No mainnet or real financial integration is authorized.

## Final execution status

72 automated tests passed (30 Solana and 42 retained legacy regressions); 4 browser E2E passed; lint, typecheck and frontend build passed locally and in cloud. Hosted HTTPS Solana local happy path passed with confirmed SPL transfer and zero offline API calls. Stable launcher deployed and explicit stop/resume returned HTTP 200. Public Devnet remains blocked on test SOL; this specification is not fully done. See SOLANA_PROOF.md and evidence/solana-devnet-status.json.

## Transaction history delivery requirement

- The consumer and merchant can open Transaction history in the demo.
- Recover confirmed/finalized/failed on-chain escrow signatures directly from Solana RPC using the reserve PDA; browser payment storage is not the source of truth.
- Fetch 20 records per page, newest first, with a validated `before` signature and Load older transactions.
- Show signature, block time when available, slot, status, and cluster. Do not label unsigned/pending offline intents as on-chain settlements.
- Devnet records link to `https://explorer.solana.com/tx/<signature>?cluster=devnet`; the reserve links to the public account history. Localnet records explicitly state that they are not publicly accessible on Devnet.
- Cache results in IndexedDB for viewing after real offline reload; block refresh and pagination while offline. Recover history in a fresh browser when online.
- Isolate history by deployment/cluster/reserve. RPC failures retain cached records and allow retry.
- Public Devnet acceptance remains pending until actual deployment and confirmed public transactions exist. Devnet ledger/RPC retention is controlled by Solana providers, not ShimoPay; no indefinite archival promise.

### Payment-state timeline

Display observed OFFLINE/ONLINE authorization and device authorization timestamp, merchant acceptance timestamp, pending settlement, awaiting chain confirmation during submission, confirmed settlement with signature and observed confirmation time, or rejection. Persist available observations across offline reloads. Treat imported payment connectivity without local observations as unknown. Verify that pending intents show no confirmed transaction hash and confirmation is displayed only after the adapter succeeds.
