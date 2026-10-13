# Limitations

- Devnet deployment and public Explorer proof remain pending until recorded evidence is produced. Local validator receipts are real Solana execution, but are not publicly inspectable Devnet transactions.
- Fully isolated merchants can accept conflicting intents. Reserve/allowance bound on-chain spend, not aggregate counterparty losses. Revocation and expiry may make accepted offline intents unpayable.
- Merchant policy snapshots are cached, not cryptographic proofs of current account state. A compromised backend/device can falsify snapshots; settlement still enforces program state.
- The split demo uses shared server-held development fee-paying wallets and a mock SPL mint. It is not production wallet integration, custody or secure multi-user tenancy.
- Device seeds are encrypted in IndexedDB but an XSS/compromised browser can steal an unlocked seed or password. JavaScript cannot guarantee memory erasure. No hardware keystore is used.
- Cached FX has hash integrity only and a fixed demo rate; no trusted oracle or real fiat settlement. The mint is not Circle USDC.
- Local validator requires a compatible host. Agave 4 fails with disabled io_uring here; Agave 2.3.13 runs successfully. Development tools are not runtime dependencies of a Devnet-backed frontend.
- Solana receipt rent grows with settlement count; no receipt pruning is implemented, because replay protection must remain permanent while relevant capabilities exist.
- The upgradeable program retains its development upgrade authority; no independent audit, production key management or governance is implemented.
- Cloud sandbox compute is temporary. Use the stable launcher after expiry. Historical EVM evidence and the previous hosted deployment do not prove the Solana migration is deployed.
- Public RPC/faucet rate limits and Devnet resets can interrupt demonstration; no paid RPC service is provisioned.
- The GitHub repository is private unless the founder separately changes visibility. No hackathon form or outreach has been submitted.
