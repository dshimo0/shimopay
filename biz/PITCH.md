# Presentation video — 2–3 minutes

English script draft for rehearsal. Not submitted or recorded. Founder must rewrite personal claims in their own words; replace bracketed bio only with facts. Do not say “working proof” until technical gates pass.

## 0:00–0:15 — hook

“This checkout has money on both sides. But the connection is gone. A sale that should take seconds can stop at the moment it matters most.”

Show connectivity disabled, not a crypto slide.

## 0:15–0:35 — problem

“Our first customer hypothesis is an event operator whose food and drink vendors need a fallback during outages. Cash, backup networks and offline card payments already exist. We are testing where they still leave a gap, rather than assuming every merchant needs another wallet.”

## 0:35–0:50 — insight

“Authorization and settlement do not need to happen at the same moment. Before losing connectivity, a customer can reserve a small allowance and authorize one limited device key. At checkout, that key can authorize the purchase locally.”

## 0:50–1:35 — product

“Here is ShimoPay. This local Solana demonstration reserves fifty demo USDC and creates a thirty-USDC offline allowance. Now we disable the network. The merchant charges twenty-five reais. The customer signs locally, using the device key, not the main wallet. The merchant checks the signature and cached session policy without calling a blockchain.

The screen says accepted, pending settlement. That distinction matters. Competing offline payments or a revoked session can still fail later. We limit authority; we do not claim to solve isolated double spending.

When connectivity returns, the merchant submits the intent. The Solana program checks the Ed25519 authorization, expiry, replay and remaining allowance, then transfers SPL demo tokens. The receipt proves settlement.”

## 1:35–1:55 — why blockchain

“A centralized database can also support offline authorization. Our reason for public escrow is the settlement trust model: independent integrators can inspect the reserve and reconcile against the same rules. Blockchain does not make the offline moment possible by itself.”

## 1:55–2:15 — market and business

“We plan to test this through event operators and POS providers, with a B2B infrastructure fee per active merchant-event. Pricing, demand and losses remain hypotheses. The next proof is a real buyer and an agreed risk policy, not a giant global payments TAM.”

## 2:15–2:35 — why us

“I have spent25 years in security, worked on more than20 IAM projects and managed over2 million identities. My Naapi project won an insurance hackathon for a DLT approach to claims, fraud and instant payments. We built the limited-session mechanism and adversarial tests to make the risks observable from the start.”

## 2:35–2:50 — vision / CTA

“The first step is one reliable offline checkout. The larger vision is a payment experience independent of connectivity and settlement rail. We are looking for an event operator and a licensed payment partner to help test it. ShimoPay: payments that don't stop when the network does.”

## Claims and rehearsal

Read at natural speed and time the recording; target 2:30–2:50, cut market context before risk disclosure. Solana / SPL engineering demo today; public Devnet proof is still pending test SOL funding. Fiat and additional rails are not implemented. No traction/bio/market numbers added without evidence. Compare hook “The internet went down. The payment didn't.” with principal tagline in five-person comprehension test; no winner asserted yet.

## Why blockchain — 15 seconds

“PostgreSQL could authorize offline too. Public escrow changes who must be trusted for settlement: merchants and integrators can inspect the same reserve and rules without sharing one operator's ledger. It does not guarantee an offline payment will settle.”

## Why not Alipay — 20 seconds

“Alipay shows that people value payment abstraction. ShimoPay tests a different settlement trust model: a limited device authorization and public escrow that independent integrators can verify. We are not claiming better distribution or first offline payments, and today's demo has no real fiat rails.”

Founder facts above are self-reported in this conversation. Confirm official hackathon naming and permitted attribution before recording; Alibaba visit is insight origin, not endorsement.
