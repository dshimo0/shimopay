# Codex Cloud + Vercel operational setup

Codex Cloud is the development workspace. Vercel `shimopay-demo` is the stable public launcher. Its named persistent sandbox hosts the actual Next.js backend. A deployment/configuration in the workspace does not automatically update the sandbox.

## Solana Devnet

The deployer and consumer are test-only accounts. Preserve ignored server-side `.solana` keys. `pnpm deploy:solana:devnet` discovers the bundled Cloud CLI; where a managed proxy is present, a temporary loopback bridge forwards native RPC through Node's HTTPS fetch with the inherited proxy/CA. It does not bypass network policy or TLS. Public metadata is written only after the configured network reports the program executable. A CLI transport error is distinct from missing funding.

Use `SHIMOPAY_RESERVE_USDC=10` for a consumer funded with 20 Circle test USDC: 10 reserved and 10 free for the online transfer demo. Use 50 when at least enough tokens are available for that reserve and the desired online balance. This smaller demonstration does not assert the original 100/50 scenario completed.

## Provider configuration

In Vercel project settings, add Production variables `MERCADOPAGO_ACCESS_TOKEN` (type Secret, TEST credential only) and `MERCADOPAGO_TEST_PAYER_EMAIL`. Select Checkout Transparente for the integrated API checkout; QR Code is a separate point-of-sale integration. Credentials/eligibility must be verified against Mercado Pago's actual Pix test support. MCP is optional agent tooling, not the runtime payment adapter; do not give it a Public Key as a server bearer secret.

After a redeploy, the launcher passes selected provider variables as process environment when starting/resuming the sandbox backend. It compares an internal runtime fingerprint to detect changes and restart with the latest values. Provider tokens are not written to files, browser responses, logs or the repo. Only a fingerprint is queried on a loopback-only runtime endpoint. Snapshot/resume does not retain processes; current values come from the launcher on resume.

The shared demo uses protected server development keys, not production wallet custody. Secret values are not returned by env listing/pull; inspect variable names only and test actual server behavior.

## Offline time policy

FX can authorize/accept only while the signed cached quote remains valid (up to 30min, 3% buffer after 15min). Once accepted, settlement does not reprice FX. The intent expires at the earlier of authorization +1h or session expiry. This separates quote validity for authorization from the on-chain settlement window. Merchant acceptance remains risky: revocation, competing intents and missed intent/session deadlines can still reject settlement.

## Pix credential verification

The previous TEST-prefix-only validation was too restrictive. Use the raw Access Token from Mercado Pago test credentials, without Bearer, quotes or whitespace. APP_USR tokens must resolve through GET /users/me to an account tagged test_user before any payment API request. Ordinary accounts are refused before creation. Returned payments must still have live_mode=false, Pix payment method and BRL currency. The public key is not an Access Token. Provider Pix test-account support remains a separate verification gate; a credential screen alone is not proof of a successful Pix payment.

Latest public check after the account-verification fix: demo HTTP 200; Pix payment request returned provider HTTP 401 and no QR. The error was not from the local token-prefix guard. No Pix success is claimed; verify Access Token versus Public Key, credential activation and provider eligibility for Pix test payments. Test-credential screen alone cannot distinguish invalid credentials from Pix endpoint restrictions.

## Investigated provider response

The read-only GET /users/me call returned HTTP 200 and confirmed the expected seller (3758554144) and test_user tag. GET /users/3758554146 succeeded but omitted email; the configured buyer email was not independently verified. POST /v1/payments returned HTTP 401, error unauthorized, code 7, recognized message "Unauthorized use of live credentials". This is a payment credential-mode refusal, not evidence that the token fails authentication or belongs to the wrong seller. The adapter now preserves bounded provider codes and recognized reasons without arbitrary provider response text. Do not switch to a real-money production account to force success. Official endpoint reference: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post (automated documentation access did not yield usable content in this environment).

A loopback-only runtime diagnostic exposes account-match booleans and test status, not the token or account profile. Public runtime requests remain 404. Five adapter tests, typecheck, lint and the hosted production build passed. Snapshot storage hit the Hobby quota; automatic review rejected deletion of older snapshots because they might contain recoverable state. No snapshots were deleted. The active web process was restarted to finish diagnostics; a new durable snapshot of the extended buyer lookup remains blocked by quota.

## Official reference supplied by the user

The user supplied the full official POST /v1/payments reference, although its navigation path is under subscriptions. Its 401 entry states: “Esse erro ocorre quando o token de acesso não tem o escopo 'payment' necessário.” This supersedes the earlier generic credential-mode interpretation: missing payment authorization is the documented explanation of the observed error. GET /users/me confirms authentication and seller identity, not payment scope. Actual granted token scopes have not been independently inspected. The payment payload, buyer email and idempotency header cannot grant scope. Verify payment permissions for the application/token and obtain a newly authorized test-seller token if required; where the dashboard does not expose these controls, ask Mercado Pago to confirm the payment scope on the token. Do not assume that merely recreating the same token grants additional scope, and do not switch to a real-money account to force a demo. No Pix settlement is claimed.

## Current integration: Orders API

The same existing credential successfully created a test order through POST /v1/orders (HTTP 201), while Payments returned 401/7. The current adapter uses Orders for creation and GET /v1/orders/{id} for reconciliation. Its prerequisites are an authenticated Brazilian test seller, test buyer email, ORDTST response identifier, matching seller/amount/currency and Pix method. Request amounts remain limited to R$1–R$100. The Orders response does not document live_mode, so sandbox enforcement uses verified test-account identity plus the ORDTST identifier; explicit live_mode=true is still refused.

The browser creates a R$100 test order, queries status, and retries the same idempotency key without creating another order. The provider currently leaves these orders in processing/in_process with no QR. No approval, fiat conversion or USDC credit is claimed. The application polls briefly and allows manual status refresh. The latest test request explicitly uses X-Test-Scope: sandbox, payer first_name APRO, and the sample CPF from the official reference; these fields have not established QR availability. The QR browser acceptance check remains failing; protocol/SDK unit tests, lint, typecheck and hosted build pass. See docs/evidence/pix-orders-cloud.json and pix-orders-cloud-failure.json.

The former conclusion that the user must replace the token or request a new scope was too broad. The token is accepted by Orders. The remaining observable failure is the provider's processing state without QR; do not interpret HTTP 201 as a completed Pix flow.

## Runtime updates without new snapshots

Run node scripts/build-runtime-release.mjs before publishing apps/demo-launcher. The launcher packages an explicit allowlist of application source files and their content hash. On resume it updates those files, builds the frontend, records the release hash, and restarts the backend with runtime credentials supplied only as environment variables. It does not replace .solana keys, deployment metadata or provider secrets. This keeps the Orders fix available after resuming an older snapshot while storage quota prevents creating another snapshot. Existing snapshots remain intact.
