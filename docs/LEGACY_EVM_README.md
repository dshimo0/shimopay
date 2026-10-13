# Historical EVM implementation — not the main demo

# ShimoPay

**Payments that don't stop when the network does.**

Local MVP: identity-bound OfflineSession + escrow-backed offline authorization + online ERC-20 settlement. Consumer sees BRL; settlement uses **mock USDC only**. A session key, not the master wallet, signs locally. Blockchain does not run offline.

## Hosted demo

Open **https://shimopay-demo.vercel.app** and click **Iniciar ou retomar demo**. The stable page can resume the temporary environment after its45-minute session expires. The development chain resets between sessions; see [cloud demo lifecycle and limits](docs/CLOUD_DEMO.md).

## Run the demo

Requires Node22.13+ (tested24.19.0) and pnpm11.25.0.

```sh
pnpm install
pnpm compile
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Start the chain, deployment and production PWA in one terminal:

```sh
pnpm demo
```

Keep that terminal open. Open **http://localhost:3000/demo** (or **http://127.0.0.1:3000/demo**). The web server accepts IPv4 and IPv6. In Codex Cloud the browser may be on another machine, so these localhost links can fail despite a healthy server. Use an HTTPS hosted preview with `DEMO_HOSTED_MODE=1`; it forwards only restricted demo RPC calls through the same origin and does not expose port8545. See [cloud demo setup and current hosting blocker](docs/CLOUD_DEMO.md).

Alternatively, Terminal1:

```sh
pnpm chain
```

Terminal2:

```sh
pnpm deploy:local
pnpm dev
```

Open **http://localhost:3000/demo**. Fund100 demoUSDC; choose password10+ chars; enable50USDC/24h allowance; simulate offline; chargeR$25; Pay offline; Validate & accept; restore connectivity; Settle now. QR/payload and transaction hash are visible.

For real offline/PWA behavior use the production server after `pnpm build`:

```sh
pnpm --filter @shimopay/web start
```

Visit first, establish session, wait for service worker, disable browser network, reload, unlock and pay/verify. Service worker caches only shell/static assets, not RPC/API. Simulation blocks app network operations; real offline reload is a separate Playwright case.

In the managed workspace where HOME/cache writes are restricted, commands were run with `CI=true XDG_CACHE_HOME=/tmp/shimopay-cache`; installation initially used `XDG_DATA_HOME=/tmp/shimopay-data`. Keep package-store configuration consistent per machine. Compiler downloads and local servers need the environment's network/process permissions.

## Verified results

**42 unit tests +4 Playwright E2Es passed.** Contract tests20; protocol16; SDK6. Compile, lint, strict typecheck and production build passed. Separate local integration settled8USDC and rejected replay/overspend/expired/wrong-merchant/tamper. The real browser offline test reloaded the PWA, unlocked, signed and verified without connectivity.

[Execution evidence](docs/VALIDATION.md) and [local receipt](docs/evidence/local-integration.json). Testnet execution, audit and commercial validation are not claimed.

```sh
pnpm test:contracts
pnpm test:protocol
pnpm test:e2e
# With a running/deployed local chain:
pnpm test:integration
```

E2E starts a fresh chain/deployment and production frontend unless compatible servers already run. Build and compile beforehand. Install browser if needed: `pnpm exec playwright install chromium`. This workspace used `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`.

## Contracts and networks

Fresh Hardhat deployment31337:

| Contract | Address |
| --- | --- |
| MockUSDC | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| OfflineEscrowVault | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |

Addresses depend on nonce/chain reset; actual metadata is written to `apps/web/public/deployment.json`. MockUSDC has6 decimals and an unrestricted development faucet. Unspent funds after cancel/expiry return to available vault balance; `withdraw` returns available funds to wallet.

Hardhat3 primary; Anvil or external EVM JSON-RPC via `EVM_RPC_URL`. No Ganache/Truffle dependencies or migrations. Compiler0.8.28, OpenZeppelin5.4.0 fixed, Paris target. Compatibility with externally configured Ganache is not an executed certification.

Copy `.env.example` to `.env` for deployment settings; never commit keys. `pnpm deploy:local` defaults to localhost8545. `pnpm deploy:sepolia` requires `SEPOLIA_RPC_URL`, test gas and `DEPLOYER_PRIVATE_KEY`; it refuses a non-Sepolia public target. Sepolia11155111 not deployed in this environment. Split web demo is local-only and uses unlocked development accounts; do not expose that RPC. Sepolia browser wallet/explorer flow is future work.

## Spec driven / business driven

[SPEC.md](SPEC.md) ties code and business to explicit gates. [Business source of truth](biz/BIZ.md), [business index](biz/README.md), [product requirements](docs/PRODUCT_SPEC.md), [technical spec](docs/TECHNICAL_SPEC.md), [deliverables](docs/DELIVERY_PLAN.md), [acceptance](docs/ACCEPTANCE_CRITERIA.md).

Business hypotheses are documented, **not validated**. No commercial users, revenue, LOIs or pilots recorded. Founder career and Naapi award are user-reported and marked accordingly. Working code is technical proof; submission readiness remains blocked by commercial/research/asset gaps.

## Architecture and risk

[Architecture](docs/ARCHITECTURE.md) · [security model](docs/SECURITY_MODEL.md) · [offline protocol](docs/OFFLINE_PROTOCOL.md) · [DID](docs/DID.md) · [chain abstraction](docs/CHAIN_ABSTRACTION.md) · [90-second demo](docs/DEMO.md) · [limitations](docs/LIMITATIONS.md).

Offline acceptance contains bounded counterparty risk until settlement. Escrow caps on-chain session spending, **not aggregate merchant losses** from competing isolated intents. Cancellation/expiry can reject accepted payments. No perfect offline double-spend prevention.

WebCrypto AES-GCM/PBKDF2 protects the stored session key; key plaintext exists only in memory after unlock, and lock/deletion are supported. It does not replace Secure Enclave/TEE or protect a compromised browser. Quotes are fixed demo hashes for cached integrity, not authenticated market pricing. DID is account identity, not KYC. MockFiatRail simulates payout states only.

No real fiat/USDC/mainnet, bank/card/PIX integration, oracle/DEX, bridges, yield, token launch or production security audit. Other chains preserve domain concepts but require new address/DID/signing/verifier implementations; a settlement adapter alone is not binary EIP-712 portability.

Repository publication and open-source license/ownership review remain to be done by the founder. No code or business application was submitted to Colosseum by this work.
