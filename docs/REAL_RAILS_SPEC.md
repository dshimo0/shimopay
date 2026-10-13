# ShimoPay — real test rails / P0 delivery specification

Source: founder's latest backlog. This supersedes the mock-token Devnet deployment path. Preserve the tested Anchor escrow, session key and canonical Ed25519 payment-intent format. Use pt-BR/en-US.

## Business proof

A person authorizes R$25 without payer RPC/backend access. A merchant can submit the signed intent while the payer remains offline. The official Circle Devnet USDC ATA of the merchant increases by the signed amount; a confirmed signature is publicly inspectable. Separately, a real Mercado Pago test request can demonstrate a fiat-in rail. Conversion to test USDC and fiat-out are explicitly simulations until an actual authorized off-ramp exists.

## P0 gates

- [x] Executable program deployed to Solana Devnet; no mainnet.
- [x] Official Circle mint `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`, verified SPL owner and six decimals; no private mint authority, no mint instruction on Devnet.
- [ ] Consumer receives faucet USDC in its canonical ATA. Deposit 50 USDC into reserve-PDA ATA; session authority 50 USDC/24h.
- [x] Signed server FX quote, locally verified against a cached issuer key. <=15min base quote; 15–30min requires explicitly priced 3% buffer; >=30min requires online refresh. The signed settlement amount is final; settlement does not fetch/reprice FX.
- [x] Independent payer/merchant simulated connectivity gates; real offline PWA remains supported. Merchant online can settle while payer remains offline.
- [x] Confirmed merchant ATA delta +4,545,455 micro-USDC for fresh R$25/5.50 quote; public Explorer evidence.
- [ ] Mercado Pago sandbox credential, request, QR, idempotency and server-side verified status; do not fabricate provider success. Simulated conversion/off-ramp labeled separately.
- [ ] Demo guidance and business status in pt-BR/en-US.

## Initial external readiness — historical

Official Circle mint was checked through official docs and Devnet RPC. Program account is absent and deployer balance is zero. Circle public faucet uses reCAPTCHA; human verification is not bypassed. MERCADOPAGO_ACCESS_TOKEN is not configured. Requested test funding/provider setup once; implementation proceeds independently. The statement 'all P0 green' remains forbidden until actual public/provider evidence exists.

Current: the program is executable on Devnet and confirmed offline/online Circle transfers are recorded. Initial funding was 20 USDC with a 10-USDC reserve; the 100/50 scenario remains a separate funding gate. Pix credentials/provider confirmation remain pending.

## Sequence / excluded work

Devnet + Circle funding -> existing escrow -> offline intent -> merchant settlement -> Explorer -> denomination / signed FX -> provider sandbox -> narrative. Kora, Solana Pay and extra EVM work remain P1/P2 until P0 is verified. No additional token, DAO, DeFi, loyalty, paid/mainnet assets or implicit guarantees.

## Evidence discipline

Separate actual RPC/provider integrations, local contract tests, HTTP fixture tests and simulations. Provider HTTP fixture tests do not establish a real Pix sandbox integration. Testnet tokens have no real monetary value. Device-recorded OFFLINE state is an observation, not an on-chain attestation. Offline acceptance retains counterparty risk until settlement.
