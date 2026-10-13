# Judge guide

## 90-second product walkthrough

1. Open https://shimopay-mobile.vercel.app/customer/home. Check the customer profile, wallet balance and Solana wallet link.
2. Open offline settings. Reserve test USDC and create a limited session while online; choose a session password. The default amount can be reduced to fit available shared funds.
3. On the merchant side, create a R$25 charge. Transfer the QR or payload to the customer.
4. Disconnect the customer after provisioning. Authorize locally with the session key. Transfer the signed intent to the merchant; local verification uses cached session data when the merchant is also offline.
5. Reconnect the merchant and settle. Open the receipt and Solana Explorer. The customer does not need to reconnect first.

If funds/session metadata are unavailable, show the historical receipt evidence rather than claiming a new transaction succeeded. Shared sessions may be changed by other visitors.

## Where to look in code

- `programs/shimopay/src/lib.rs`: reserve, allowance and settlement constraints.
- `packages/solana/src/protocol.ts`: canonical signed payment and identity representation.
- `packages/solana/test/`: cryptographic, rail and program tests.
- `mobile/src/integrations/shimopay/`: current client integration and offline state.
- `mobile/src/pages/payments/`: customer, merchant, receipts and QR UX.
- `mobile/tests/e2e/`: two-browser offline flow and responsive product checks.

## Evidence and boundaries

[Solana proof](SOLANA_PROOF.md), [mobile review](../mobile/docs/PRODUCT_REVIEW.md), [publication checks](PUBLICATION_REVIEW.md).

Circle USDC on Devnet is a test token. Pix/card are separate online test rails; there is no real USDC-to-Pix conversion. Offline authorization is not final payment settlement. Personal authentication and six-digit transaction PIN are unfinished; do not interpret the shared demo wallet as a visitor-owned account.

The default production build is the Mobile app. The older split-screen Next.js app is retained for engineering tests. Miniapps are role-specific utilities, not partner integrations.
