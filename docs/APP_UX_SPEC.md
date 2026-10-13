# ShimoPay app experience

## Business outcome

People can use a wallet or merchant terminal with one role on screen, task navigation and payment states. The presentation remains available at /demo. This is a product experience over development accounts and testnet funds; it does not add production custody or real-money onboarding.

## Routes

| Route | Experience |
| --- | --- |
| /app | Consumer: Home, Pay, Offline Settings, Transactions |
| /app/merchant | Merchant: Home, Charge, Receive, Transactions |
| /demo | Split-screen presentation and adversarial controls |
| /pitch | Pitch deck |

The stable Vercel launcher routes /app and /app/merchant to the corresponding active backend screens after resuming and installing the current runtime release. The landing page links both roles. PWA installation starts at /app and caches the app shells and static assets. API/RPC traffic stays outside the service-worker cache.

## Technical deliverables

- Reuse the existing payment/session/settlement implementation through explicit consumer and merchant views.
- Mobile navigation, actual Devnet balances, online payments, offline settings and existing transaction history.
- Consumer payment amount entry and strictly validated merchant request import.
- Merchant charge QR/payload with merchant binding and expiry; signed payment payload acceptance and settlement.
- Simulation and presentation controls are hidden in app views. Real device connectivity governs network availability.
- Application labels retain the test environment and development-account boundary.

## Acceptance checks

The hosted browser check in scripts/verify-app-cloud.ts verifies role separation, navigation, visible merchant settlement action, mobile layout, service-worker offline reload and online-payment blocking while offline. It performs no financial mutations. Evidence is recorded in docs/evidence/app-ux-cloud.json and mobile screenshots after execution.

## Residual limitations

Accounts are still the existing configured development consumer/merchant. Wallet connection, production authentication and independent multi-user custody are not implemented. Session snapshots and encrypted keys use the existing browser storage; a separate merchant device requires the correct session/quote cache before offline acceptance. QR is shown and payload import/copy is available; live camera scanning is not implemented. The Mercado Pago QR processing issue remains documented separately. App navigation does not change on-chain security or remove bounded offline counterparty risk.

## Verified delivery

The production Next.js build, lint and typecheck passed. Browser checks on the Cloud workspace production server passed: separate consumer/merchant views; all task navigation; visible settlement action; 390px layout without horizontal overflow; real offline PWA reload; online transfer disabled offline; merchant invoice QR generation; offline invoice import; expired invoice rejection. No financial transaction was executed for these UX checks. Screenshots and observations are in docs/evidence/app-wallet-mobile.png, app-merchant-mobile.png and app-ux-cloud.json.

The initial publication attempt was blocked by invalid saved CLI tokens. The user renewed the device login; publication then succeeded with deployment dpl_DTx5PbGy9bBxdNuusw3hGF7EdMzM. Public access is available at https://shimopay-demo.vercel.app/app and https://shimopay-demo.vercel.app/app/merchant. Full browser checks passed again through these public routes, including redirects, mobile navigation, real offline reload, invoice QR/import and expired invoice refusal. Public evidence was recorded at 2026-10-12T18:19:48.083Z.
