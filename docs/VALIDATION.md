# Executed validation — Solana migration

2026-10-11. Actual execution, no mock chain substituted.

| Check | Result |
|---|---|
| Anchor SBF compile / strip / local deploy | passed |
| Solana program tests | 17 passed on real Agave validator |
| Solana protocol + encryption + network gate tests | 13 passed |
| Retained EVM contract regressions | 20 passed |
| Retained EVM protocol / SDK regressions | 22 passed |
| `pnpm test` aggregate | 72 passed (30 Solana + 42 legacy) |
| `pnpm lint` / `pnpm typecheck` | passed |
| Frontend production build | passed locally and in new Vercel sandbox |
| Browser E2E | 4 passed: real SPL settlement/replay/tamper, actual offline PWA reload, restricted API, deployment-generation invalidation |
| New deployment cache invalidation | passed: old policy/device/proof cleared on generation change |
| Hosted HTTPS happy path | passed; 0 API requests offline; confirmed SPL settlement; replay/tamper rejected |
| Stable production launcher | published; explicit sandbox stop and public resume POST returned HTTP 200 |
| Public Devnet deployment | blocked: faucet 429, deployer 0 lamports; not complete |

Managed environment: Node 24.19, pnpm 11.25, official Solana platform-tools v1.57 compiler, Agave 2.3.13 local validator. Agave 4.3 validator panics because this container does not support its io_uring requirement. The standard `cargo-build-sbf` cache destination is read-only here, so `scripts/solana-build.sh` invokes the same official platform-tools compiler from a workspace-local directory, preserving HOME and network proxy settings.

Commands actually used:

```bash
SHIMOPAY_PLATFORM_TOOLS=/workspace/.tooling/platform-tools \
 CARGO_HOME=/workspace/.tooling/cargo RUSTUP_HOME=/workspace/.tooling/rustup \
 pnpm build:solana
XDG_CACHE_HOME=/workspace/.tooling/cache \
 SOLANA_CLI=/workspace/.tooling/agave-2.3/solana-release/bin/solana \
 SOLANA_VALIDATOR=/workspace/.tooling/agave-2.3/solana-release/bin/solana-test-validator \
 pnpm test
pnpm lint
pnpm typecheck
NEXT_TELEMETRY_DISABLED=1 pnpm build
pnpm test:e2e
SHIMOPAY_DEMO_URL=https://sb-3ep2qj5yh459.vercel.run/demo \
 SHIMOPAY_BROWSER_CA_FILES=/usr/local/share/ca-certificates/environment-proxy-ca.crt,/usr/local/share/ca-certificates/mitmproxy-ca-cert.crt \
 NODE_USE_ENV_PROXY=1 node --import tsx scripts/verify-solana-cloud.ts
```

The workspace-local pnpm store is configured in `pnpm-workspace.yaml`; it fixes read-only home cache errors without changing HOME. Optional bigint/native websocket accelerators are disabled; tested pure-JavaScript fallbacks work. Initial compile/test failures (module imports, duplicated-message transaction size, clock skew, and stale server build) were corrected before the successful results above.

Evidence: `solana-localnet-payment.json`, `solana-browser.json`, `solana-cloud-demo.json`, corresponding screenshots, and `solana-devnet-status.json`. No public Solana Devnet signatures or deployment are claimed. Historical EVM evidence files refer to the former demo.

Final hardening: strict Ed25519 verification rejects a demonstrated degenerate-key forgery accepted by the library’s permissive mode. After that change, the complete suite passed (72 tests), four Playwright cases passed (16.3 seconds), and hosted HTTPS verification passed again with measured merchant +4,545,455 and vault −4,545,455 micro-units.

### Transaction history follow-up

The updated history implementation passed 33 Solana tests (18 actual-program/RPC + 15 protocol) and 5 Playwright E2E cases. New cases verify recovery of real reserve/settlement signatures with non-overlapping RPC pagination, correct public Devnet Explorer URLs, offline refresh blocking, and an empty-device browser recovering on-chain records and retaining them through an actual offline PWA reload. Lint, typecheck and production build passed. The earlier 72-test aggregate/4-E2E row above is historical; unrelated legacy EVM tests were not rerun for this change. The Devnet deployer balance was checked again and remains zero; public Devnet verification remains blocked.

Hosted HTTPS history verification passed against four real funding/allowance/settlement/cancellation signatures, including recovery without a device payment queue, page reload and blocked offline refresh. See `docs/evidence/solana-cloud-history.json` and the accompanying screenshot. Local validator history retention is limited; Devnet/public provider retention remains external.

### Payment-state timeline follow-up

Five Playwright E2E cases passed after adding observed authorization connectivity and authorization/acceptance/confirmation timestamps. The settlement response is deliberately held in one test: the UI shows Awaiting on-chain confirmation and no confirmed signature until the adapter responds successfully. Another case reloads the PWA while truly offline and recovers Authorized OFFLINE / Accepted · Pending settlement from IndexedDB. Lint, typecheck and local/hosted frontend builds passed. The Anchor program and canonical signed-intent format were unchanged.

Hosted HTTPS timeline verification also passed with a genuine SPL settlement and zero API calls while authorizing/accepting offline. Screenshot and machine-readable evidence: `docs/evidence/solana-payment-states.png` and `.json`. Public Devnet deployment remains pending test SOL.

### Pitch page follow-up

Lint/typecheck and local/hosted frontend builds passed. Browser verification passed for shared Next.js `/pitch` and the public static Vercel pitch: header/footer, visible factual qualifications, responsive desktop/mobile without horizontal overflow, functional print action and PDF export. Public launcher failure recovery was tested with a clearly synthetic 503 response; it does not represent a real deployment failure. Static pitch and 11-page A4-landscape PDF return HTTP 200 without starting a sandbox. Production deployment `dpl_EUs1cg95CKZ5zLMRbvvbsDaEA67n` uses the same approved project and stable alias.
