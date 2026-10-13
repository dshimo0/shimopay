# Business thesis — one page

**Problem.** Some merchants cannot finish digital checkout during an interruption. Offline card acceptance and ecash already address parts of this problem; ShimoPay must prove an unmet need in its initial segment.

**Beachhead.** Small recurring music festivals in São Paulo, coordinated by an operator who can organize merchant onboarding and online preparation at entry. This is a scored hypothesis, not a partnership or validated market.

**Insight.** A small reserve and time-limited device authority can precede the purchase. A merchant can then verify an authorization locally, while actual settlement waits for network access.

**Product.** OfflineSession connects account identity, session key, escrow, policy, cached FX and signed intents. The primary Solana prototype uses did:pkh identifiers, encrypted local Ed25519 keys, canonical v2 intents, an Anchor reserve program and a mock SPL USDC mint. Real local settlement is tested; public Devnet proof remains a blocked delivery gate. Fiat payout and other chains are not implemented.

**Blockchain rationale.** Public escrow gives independent integrators common visible limits and settlement rules. Offline authorization does not require blockchain; the chosen settlement trust model is the reason to use it.

**Differentiation.** Combining portable identifiers, delegated authority and public reserve in a merchant component is a hypothesis worth testing. No first-mover, exclusive-IP or solved-double-spend claim. Existing card providers have far stronger distribution and risk operations.

**Model and distribution.** Sell B2B infrastructure per merchant-event through organizers/POS. Start with ten vendors and consenting visitors, then test repeatability through one POS partner. No integration or buyer confirmed.

**Economics.** The illustrative R$150 fee yields only 30% contribution margin under unvalidated cost/loss assumptions. Gas, funding/payout and support could make it unviable; measure before choosing production rail or pricing.

**Proof.** Forty-two unit tests passed; build, two browser E2Es and local integration also passed. No commercial traction, interviews, LOIs or pilots recorded. Technical tests do not demonstrate demand.

**Founder.** The founder reports25 years in security,20+ IAM projects and2mi+ managed identities, and a hackathon win with Naapi in insurance fraud/claims/payment DLT. Public attribution remains to verify; the China/Alibaba invitation inspired the idea and is not a partnership.

**Risk.** Other isolated merchants can accept competing intents, and cancellation/expiry can reject pending purchases. Escrow caps session spending, not merchant aggregate loss. Funding/payout, licensed partners, security assessment and explicit liability are production gates.

**Next decisive experiment.** Interview ten merchants and two operators, compare actual fallbacks, confirm risk acceptance and obtain one scoped pilot commitment. Kill or revise the wedge if buyers don't value it or losses/funding destroy the checkout.
