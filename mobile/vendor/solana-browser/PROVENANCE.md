# Browser protocol snapshot

Source: dshimo0/shimopay_solana, commit 2606c9e2406b1798f63ae345119cb23b785c7486, packages/solana/src and packages/sdk/src/storage.ts/ConnectivityGate. Browser-only versioned file dependency; no server exports/keypairs. Canonical signing and verification unchanged. Adaptation: separate IndexedDB namespace, remove EVM wallet/server imports, re-export storage/gate. Maintain source version and regression fixtures when updating.

APP expansion: optional async requestHeaders injection in SolanaSettlementAdapter. Gate checks run before headers, preserving zero network for offline protocol operations. This carries Supabase bearer to the Mobile gateway when configured; it does not change intent bytes/signatures or the underlying Devnet account mapping.
