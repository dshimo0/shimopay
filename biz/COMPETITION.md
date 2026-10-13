# Competition — provisional, not novelty proof

**Gap classification: PARTIAL / combination unverified.** Offline signing, prefunding, QR, delegated authority e reconciliation já existem. A comparação deve considerar duas partes completamente offline, snapshot trust, revocation e quem suporta losses.

Legenda: Y = capacidade indicada na fonte citada; N = não na arquitetura descrita, não inexistência global; U = não verificado; P = parcial/depende do produto; Planned = visão sem implementação. “Escrow” significa reserva programável limitada, não apenas custodial balance.

| Competitor / source | Offline | Escrow | DID | Fiat UX | Crypto Settlement | Open Network | Weakness / limit of evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Stripe Terminal](https://www.federalreserve.gov/econres/notes/feds-notes/offline-payments-implications-for-reliability-and-resiliency-in-digital-payment-systems-20240816.html) | Y SAF | N described | U | Y | N described | N card acceptance model | Merchant risk exists; hardware/region conditions; strong distribution |
| [Braintree store-and-forward](https://developer.paypal.com/braintree/in-person/legacy/guides/offline-transactions/) | Y | N described | U | Y | N described | N | Limits, declines and supported-reader conditions |
| [Fedi ecash](https://fedibtc.github.io/fedi-docs/docs/fedi/payments/ecash/) | Y, both offline pending | P federation balance | U | U | Y BTC/federation | P federation | Federation trust/reissue needed; strongest counterexample to “offline first” |
| [Solana Pay](https://solana.com/docs/payments/accept-payments) | U for both offline | U | U | P | Y | Y settlement | QR does not establish offline acceptance; check exact implementation |
| [Gnosis Pay](https://help.gnosispay.com/hc/en-us/articles/39388201965332-What-is-Gnosis-Pay) | U | P Safe balances | U | Y card | Y | P public assets / Visa acceptance | Requires network/scheme partners; does not prove identical offline policy |
| [Stripe + Bridge](https://stripe.com/newsroom/news/stripe-completes-bridge-acquisition) | U stablecoin offline | U | U | Y | Y | P | Biggest distribution/fiat-infrastructure threat; absence of offline docs not absence of ability |
| [Stripe/Shopify stablecoins](https://stripe.com/newsroom/news/shopify-stripe-stablecoin-payments) | U | U | U | Y | Y | P | Merchant enablement and currencies depend on eligibility |
| [Circle](https://www.circle.com/reports/internet-financial-system/usdc-and-circle-digital-assets) | U | U | U | P | Y | P public assets + issuer | Partner/infrastructure and competitive risk; issuer controls remain |
| [Alipay+](https://docs.alipayplus.com/alipayplus/alipayplus/faq_mpp/integration_and_acceptance?pageVersion=2) | P weak-signal codes; both offline U | U | U | Y | U | P interoperable wallets / operator-led | Do not equate weak signal with independently final offline settlement |
| WeChat Pay | U | U | U | U in this review | U | U | Primary capability check pending; no unsupported superiority |
| Visa | P card offline per E01 | U | U | Y | U | P scheme network | Acquirer/issuer rules vary; current local capabilities need primary check |
| [Mastercard resilience](https://newsroom.mastercard.com/news/europe/en/newsroom/press-releases/en/2026/mastercard-offline-payments-europe/) | Y announced Europe | U | U | Y | U | P scheme | Regional policy announcement; not same public escrow mechanism |
| [Digital euro / ECB](https://www.ecb.europa.eu/euro/digital_euro/faqs/html/ecb.faq_digital_euro.en.html) | Planned | P prefunding concept | U | Y | N public crypto | N proposed central-bank rail | Proposal/pilot is not general live availability |
| [Payment channels / Polaris context](https://www.bis.org/project/polaris) | P depending peer/state/connectivity | P | U | U | P | P | Bilateral liquidity and disputes; not blanket both-offline merchant support |
| ShimoPay current | Solana local and hosted E2E executed | Y local Anchor program | Solana did:pkh identifier | BRL demo | Mock SPL token | Real local deployment; public Devnet proof pending test SOL | No buyer, fiat payout, offline guarantee, audit or production trust yet |

## Historical Colosseum candidate set — 20

These are **researched candidate comparables**, not the “20 closest” from semantic corpus. Winner results are historical; survival and exact current product require Copilot full record + official live site. Y prize excludes honorable mention. We do not assert team failure from silence.

[R] [Radar results, Nov 2024](https://blog.colosseum.com/announcing-the-winners-of-the-solana-radar-hackathon/). [B] [Breakout results, Jul 2025](https://blog.colosseum.com/announcing-the-winners-of-the-solana-breakout-hackathon/). [P] [Colosseum portfolio listing](https://colosseum.com/).

| Candidate | Historical evidence | Why compare (analyst interpretation) | Won? | Accelerator evidence | Current survival |
| --- | --- | --- | --- | --- | --- |
| FXSwap | R Payments1 | FX abstraction | Y | U | U |
| Hylo | R Payments2 | Settlement asset | Y | P Cohort2 | U |
| Split Finance | R Payments3 | Merchant payment alternative | Y | U | U |
| Ribh Finance | R Payments4 | SME workflows | Y | U | U |
| Quartz | R Payments5 | Offramp bottleneck | Y | U | U |
| Reflect | R Grand | Currency UX | Y | P listed | U |
| Verve | R Infra4 | Embedded wallet | Y | U | U |
| Attest Protocol | R Public Good | Identity/attestation | Y | U | U |
| Wink | R Consumer5 | Transaction UX | Y | U | U |
| CargoBill | B Stablecoins1 | Specific B2B payment wedge | Y | P listed | U |
| Decal | B Stablecoins2 | Merchant distribution | Y | P listed | U |
| LocalPay | B Stablecoins3 | Emerging-market payments | Y | P listed | U |
| Xelio | B Stablecoins4 | SMS payment access | Y | U | U |
| Bagel | B Stablecoins5 | Self-custody UX | Y | U | U |
| Paytos | B Stablecoins University | Phone wallet onboarding | Y | U | U |
| One-time Action Codes | B Infra4 | Solana Pay UX | Y | U | U |
| Unruggable | B Infra3 | Device key security | Y | P listed | U |
| Latinum | B AI1 | Integrable payment middleware | Y | U | U |
| Myfye | B DeFi University | Emerging market access | Y | U | U |
| Deks | B Consumer5 | Physical/digital onboarding | Y | U | U |

“Better than ShimoPay”: historical award demonstrates external selection; several have a narrower buyer/rail story than our broad vision. It does not establish better implementation or market success. “What failed”: **not verified**; no fabricated postmortems.

## Research gaps to close

Copilot winner-first semantic discovery, broaden non-winners for offline precedents, read full records and inspect repos/demo descriptions. The Grid organization/product status, live sites, eCash/Cashu/Fedimint and Ethereum channel systems, WeChat official capability and current Visa/acquirer rules. No feature additions justified by unknown cells.
