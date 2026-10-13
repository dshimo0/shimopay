# Competition publication review

Scope: public source snapshot, app/protocol build, automated tests, secrets and documentation. This is not an independent smart-contract audit or a production security certification.

## Included and excluded

Included: current Mobile app, Solana program and SDK, legacy EVM reference, test suites, specifications and historical evidence. Excluded: private Git history, ignored files, environment values, Solana keypairs, Vercel credentials, generated dependencies/build artifacts and local tool profiles.

Source commits are recorded in [PROVENANCE.md](PROVENANCE.md). The app's hosted URL still runs the existing deployment; publishing this repository does not redeploy it or create a new financial transaction.

## Executed on the publication copy

- Clean dependency install: Mobile `npm ci`, protocol `pnpm install --frozen-lockfile`.
- Mobile: 68 unit tests, lint (0 errors; 8 existing Fast Refresh warnings), TypeScript and production/PWA build.
- Protocol/SDK: 34 tests passed.
- Solana canonical protocol and rail tests: 22 tests passed.
- Legacy EVM contracts: 20 tests passed (Hardhat cache redirected to a writable directory in this environment).
- Root lint, TypeScript and Next.js production build passed.
- Mobile browser suite: 10 passed, 1 optional live adversarial test skipped. Browser financial operations use test fixtures.
- Gitleaks 8.30.1 scanned the exported source. Three false positives were manually identified as a public local contract address and two test idempotency UUIDs; exact-value exceptions are in `.gitleaks.toml`. Final scan found zero remaining credential matches. This does not prove absence of every possible secret.

Solana validator/program integration was not rerun as part of this publication review. Historical on-chain evidence retains its date and network; do not interpret the unit suite as a new Devnet transfer or fresh Mercado Pago approval.

## Dependency review

Mobile dependency audit decreased from 17 to 6 findings (all remaining findings trace to `braces` in the CSS/build dependency chain; 0 critical).

Mobile transitive `ws`, `source-map-js` and `postcss-selector-parser` were updated using explicit overrides to patched versions and the app checks repeated.

Residual dependency advisories are recorded below. Do not treat this prototype as cleared for production. `braces` is used by the CSS/build toolchain and had no published patched version at review time. Legacy protocol/tool dependencies also include advisories in bigint-buffer, uuid, stream-json and toml. Their native/parser API changes require a separate compatibility review; blanket major-version overrides were not applied.

### Protocol production dependency audit

- bigint-buffer: bigint-buffer Vulnerable to Buffer Overflow via toBigIntLE() Function (https://github.com/advisories/GHSA-3gc7-fjrx-p6mg).
- uuid: uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided (https://github.com/advisories/GHSA-w5hq-g745-h8pq).
- stream-json: stream-json: pick/ignore/filter/replace filters are O(depth²) on nested input — small crafted JSON blocks the event loop for seconds→minutes (DoS) (https://github.com/advisories/GHSA-528h-pc64-c93x).
- toml: toml-node: Uncontrolled Recursion (https://github.com/advisories/GHSA-82x6-q7mm-w9cf).
- toml: toml-node: Prototype Pollution Leads to `Object.prototype` Corruption via `__proto__` Key-Path Desynchronization (https://github.com/advisories/GHSA-v5mp-jgw5-2x6j).
- stream-json: stream-json: JSONC parser and verifier re-scan the whole accumulated comment on every input chunk (https://github.com/advisories/GHSA-hqr4-qq8f-hg3x).
- stream-json: stream-json has a prototype pollution issue: Assembler writes this.current[this.key] on plain objects (https://github.com/advisories/GHSA-mjw6-4jj6-33hc).

## Product limitations

- Shared test wallets; personal authentication, wallet ownership and six-digit transaction PIN are not complete.
- Fiat conversion and bank payouts are not implemented. Pix/card are online provider test rails.
- Offline merchants retain bounded counterparty risk until settlement.
- Live hosted demo depends on RPC/provider availability and test funds.
- Mobile source is PT-BR; pitch supports PT-BR/EN-US.
- No open-source license was added; third-party licenses are unchanged.

## Publication status

Source prepared and reviewed locally. GitHub repository creation was refused by the connected integration: `Resource not accessible by integration (createRepository)`. Publication is pending creation of an empty public `dshimo0/shimopay` repository by the owner. The existing private source repositories were not changed.
