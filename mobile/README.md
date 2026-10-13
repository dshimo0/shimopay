# ShimoPay Mobile

Current customer and merchant PWA. See the [competition README](../README.md), [visual review](docs/PRODUCT_REVIEW.md) and [SPEC](SPEC.md).

```bash
npm ci
npm test
npm run lint
npx tsc --noEmit
npm run build
npm start
```

Open http://localhost:8080. The bridge uses the hosted shared Devnet backend. To deploy on Vercel, set the root directory to `mobile`; existing `vercel.json` configures the app and server routes. Secrets must stay in server environment variables. Optional Supabase configuration does not complete personal wallet ownership or PIN authorization.

Browser verification: keep `npm start` running, then run `SHIMOPAY_MOBILE_URL=http://127.0.0.1:8080 CHROMIUM_PATH=/path/to/chromium npm run test:e2e`. The normal suite uses financial fixtures; the adversarial live test is explicitly opt-in. Never point tests at real funds.

The historical inventory is preserved in [LEGACY_README.md](LEGACY_README.md); descriptions of removed routes there are not current product claims.
