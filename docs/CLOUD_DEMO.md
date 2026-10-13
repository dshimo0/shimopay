# Codex Cloud demo access — Solana migration

Use **https://shimopay-demo.vercel.app** and click **Iniciar ou retomar demo**. The stable Vercel production page resumes the named `shimopay-solana-demo` sandbox and starts `scripts/cloud-solana.ts`. It verifies both deployment metadata and the real Solana-backed state API before redirecting. Runtime project OIDC supplies hosting authorization; no PAT is embedded.

The current hosted engineering demonstration is **SOLANA LOCALNET**, running an actual Agave validator, Anchor program and SPL mint. It must not be described as a public Devnet deployment. Devnet deployment is blocked by zero test SOL and the public faucet's 429 response; see `SOLANA_PROOF.md`. Once confirmed Devnet configuration is installed, the same UI/API uses Devnet and no local validator is started.

Only the web port 3000 is public. The local Solana RPC port 8899 is private. `/api/solana-demo` constructs supported transactions for fixed development wallets and mock mint; it refuses arbitrary signing requests and cross-origin calls. Session seeds/passwords never reach that API. All server wallet files are dedicated development-only keys, excluded from Git and restricted by filesystem permissions.

The browser in Codex Cloud runs on a different machine from the workspace. Its localhost does not reach this app. Temporary `.vercel.run` links expire with the active sandbox session. Use the stable entry after expiry; sessions remain limited to 45 minutes. One retained filesystem snapshot has the provider's observed 30-day retention; prolonged inactivity can require reprovisioning.

A local ledger may survive filesystem restoration, but this is not a production durability guarantee. If the ledger is recreated or a deployment generation changes, cached session keys, policies and transaction displays are invalidated. Pending old intents cannot be guaranteed payable. No persistent real-money ledger is claimed.

The previously published `shimopay-resumable-demo` and its EVM receipts are historical, not evidence for this migration. Current literal endpoint/proof is recorded in `docs/evidence/solana-cloud-demo.json`. Never construct a public URL from a workspace ID.

## Verification

The new hosted browser workflow executes reserve/allowance/settlement, checks confirmed status, measures zero API requests during simulated offline authorization, and rejects replay/tampering. Screenshots are saved with evidence. Local Playwright additionally reloads the PWA with real browser networking disabled.

```bash
SHIMOPAY_DEMO_URL=https://<literal-sandbox-url>/demo \
  node --import tsx scripts/verify-solana-cloud.ts
```

In a managed environment that intercepts HTTPS, the browser may require the configured proxy CA. `SHIMOPAY_BROWSER_CA_FILES` supplies explicit public CA files whose SPKI pins are trusted by the test browser; this avoids disabling all HTTPS verification. Node/CLI commands preserve configured proxy and CA settings.
