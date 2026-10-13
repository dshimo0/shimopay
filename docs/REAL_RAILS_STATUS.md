# Real rails delivery / status da entrega

## Verified in engineering / Validado em engenharia

Current: public Circle Devnet offline/online proof completed; Pix remains pending. See the latest update below.

- Existing Anchor escrow and canonical Ed25519 v2 protocol retained. Local SPL transfer, replay, overspend, expiry and tamper tests pass.
- Devnet deployment requires the official Circle USDC mint and exact Devnet genesis. Public mock-mint and mainnet paths refused. Devnet funding transfers existing consumer ATA tokens; no mint authority or mint instruction is used.
- Server signs FX quotes with a separate ignored development key. Offline verification pins its cached public key. Fresh <=15min; older quotes require a displayed 3% buffer; >=30min rejected. Signed USDC amount is final. Merchant acceptance can require a new authorization if the quote crosses the freshness boundary before acceptance; settlement never reprices.
- Consumer and merchant have separate connectivity gates. Merchant can transmit and confirm an intent while consumer remains offline. Real browser disconnection still blocks both gates.
- Core payment actions and lifecycle labels have pt-BR/en-US selection. Technical evidence and some diagnostic strings remain English.
- Mercado Pago test adapter uses create-payment/get-payment API, stable persisted idempotency UUID, provider QR/status and server-only credentials. It refuses production tokens and live responses. Without credentials, returns 503 rather than inventing a QR or approved payment.

## Initial public proof gates — historical (superseded below)

Devnet deployer `9mhC1YCwDzPqK72kkafKJRmnG6dEffFsazCtMzcB2t4q` has zero SOL; program account is absent. Funding is external. Circle faucet requires human verification; not bypassed. Consumer address for Circle test USDC: `BXZsykJqowbQGSsWv8o4u7g5qjZLKgGwAm5ibgbT5io4`.

No Mercado Pago test credentials are present. Test-only Pix availability must be checked against the actual account/provider. HTTP fixtures prove adapter behavior, not provider support or completed Pix settlement. No production-token workaround is enabled. Fiat-in → USDC conversion and fiat-out are not implemented transfers; the UI explicitly states that USDC is not credited by Pix.

Therefore no public Circle USDC merchant receipt, Devnet transaction or real Pix sandbox confirmation is claimed. The hosted engineering demo remains localnet until these gates are met.

## Next authorized steps / Próximos passos

After Devnet SOL and Circle faucet funding: deploy existing program, deposit 50 Circle test USDC, create 50 USDC/24h allowance, authorize R$25 offline, reconnect only merchant, confirm +4,545,455 micro-USDC ATA delta and record public Explorer signature. With test credentials: create provider Pix, obtain actual test QR and verify status by GET; record provider-supported behavior or explicit rejection. Only then start Kora/Solana Pay P1 work.

## Executed validation

2026-10-11: 20 EVM contract tests, 25 legacy protocol/SDK tests (including 3 Pix HTTP-fixture tests), 21 Solana protocol/FX/rail tests, 18 local Solana program/RPC tests and 7 Playwright tests passed: **91 tests**. Lint, TypeScript and production build passed. Playwright covered merchant-only reconnection with payer still offline, real browser-offline PWA reload, transaction history/pending/confirmation, locale persistence and unavailable-Pix refusal. These results do not fulfill public Devnet or provider proof gates.

## Update — public Devnet proof completed

Funding confirmed: 10 Devnet SOL and 20 Circle test USDC. Native deployment initially hit Cloud CLI/proxy and public RPC rate limits. Verified buffer resume uploaded missing bytes at a reduced rate; native deployment from the completed buffer confirmed signature `4VzZwV2zEzkuJkBnkmZjBfJemfr1nn4BgmH4c8iHgGv76XWBZGHxStKhoaHBKrNy6J6vUm724jBNHniuxe1cfHyr`.

Live sandbox now uses official Circle mint, Devnet genesis and program `9iWAPSp9p9mbQ7LouMZEdt3qhtpnZGiaSyoCBSXDPYKg`. With 20 funded tokens, the demonstrated reserve/allowance is 10 USDC, not the original 100/50 scenario. Offline R$25 → 4.545455 USDC settled in `4P65dUVHm4UEo5hf7Hmis1XkEUFbmUXXU4bkii4tY2tdLcK5gwVJjRezc74vToZeYomh311eJkzdQypTukxGPauZ`, with zero API requests during authorization and merchant-only reconnection. Online direct transfer confirmed in `rDBBC5tqR2cjyT5DwpHLPLUrhSvsoXYDD8XQSefjnRNsxHH1Ctfi9znL39D7DMWaoLJV8m8Nkk7axpmMdgYb1LM`. Immediate online RPC history lagged; the confirmed transfer and idempotency checks passed, then history was reconciled after indexing. Public evidence is in solana-cloud-demo.json and online-devnet-payment.json.

45 Solana tests and 8 Playwright tests passed; production builds passed. Intent expiry is now independent of FX expiry: up to authorization +1h, capped by session expiry; new authorizations/merchant acceptance still require a valid quote. Signed amount never reprices at settlement.

The Vercel launcher now forwards selected runtime provider variables to the sandbox, with fingerprint-driven restart and no provider-token files. Production variable listing showed none configured. Pix provider support/confirmation remains pending; no Pix → USDC bridge or payout is claimed. A technical silent video is available, distinct from a founder presentation or submitted video.

## Orders API update

The Mercado Pago credential is present and authenticates the expected test seller. Migrating the adapter to Orders removes the Payments 401 from the app flow. Real provider test-order creation, status lookup and idempotent retry succeeded through the public browser. QR issuance is still blocked: the provider returns processing/in_process without a QR, so Pix settlement is not demonstrated. The dedicated browser QR assertion fails and is retained as an unmet acceptance criterion. There are 31 passing protocol/SDK tests in the latest run, including nine Orders adapter tests; lint/typecheck and the hosted build passed. No real BRL moved and no USDC was credited by Pix.
