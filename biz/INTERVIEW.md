# Investor interview / FAQ — thirty questions

Draft rehearsal answers. Facts track the validation ledger; personal claims remain pending. Deep answers reference mechanisms and tests without pretending an audit or commercial success.

## 1. Why now?

**10 seconds:** Stablecoin infrastructure and delegated keys are available; demand is still a hypothesis.

**30 seconds:** The ecosystem makes a limited-session prototype practical today. Existing offline payments are also improving, so timing alone is not an advantage. We need evidence our buyer wants this mechanism.

**Deep:** EVIDENCE.md separates infrastructure changes from customer demand. Do not translate token supply into consumer merchant adoption.

## 2. Why you?

**10 seconds:** I bring25 years in security and reported IAM delivery at million-identity scale.

**30 seconds:** I have delivered over20 IAM projects and managed over2 million identities, and my Naapi project won an insurance hackathon using DLT. Those are founder-reported facts; ShimoPay is a new hypothesis inspired by a visit to China.

**Deep:** FOUNDER_MARKET_FIT.md records the source and attribution limits. Public award proof and full-time commitment remain pending; past Naapi recognition is not ShimoPay traction.

## 3. Why crypto?

**10 seconds:** Public escrow creates shared settlement rules for independent integrators.

**30 seconds:** Offline authorization can use a centralized database too. Crypto is useful here if buyers value inspectable reserved funds and reconciliation without one closed operator ledger.

**Deep:** The token issuer, chain availability, funding partner and frontend still matter. This changes the trust model; it does not remove trust or guarantee offline acceptance.

## 4. Why Ethereum or Solana?

**10 seconds:** Solana is our implemented primary rail: Anchor reserves, Ed25519 offline intents and SPL settlement work locally. Public Devnet deployment is still pending test SOL.

**30 seconds:** We migrated the existing split demo to Solana: funded reserve and allowance PDAs, local Ed25519 verification, then an actual SPL transfer. The public Devnet/Explorer gate is not yet satisfied; we will not substitute a local badge for public evidence.

**Deep:** Adapter boundaries preserve domain concepts, not binary signature portability. Production rail choice follows cost, distribution, asset liquidity and security, not a larger prize pool alone.

## 5. Who pays?

**10 seconds:** The proposed buyer is an event operator or POS provider.

**30 seconds:** We hypothesize the operator buys continuity for its vendors. Merchants and consumers are users; we need buyer interviews before assuming they all pay.

**Deep:** BIZ.md and JTBD.md separate buyer, beneficiary and partner. No operator is confirmed and consumers should not need existing USDC wallets for the eventual market.

## 6. How much?

**10 seconds:** R$150 per active merchant-event is a pricing assumption, not validated pricing.

**30 seconds:** The illustrative fee includes two hundred payments. Under our cost assumptions, margin is only thirty percent, so we must validate support, losses and fees before setting a price.

**Deep:** UNIT_ECONOMICS.md shows break-even and sensitivities; it includes customer loss burden even when liability is not ShimoPay’s cost. No six-revenue-model pitch.

## 7. How do you acquire users?

**10 seconds:** Through one organizer and its vendor roster, with preparation at check-in.

**30 seconds:** The first proposed cohort is ten vendors and ninety consenting visitors at one event. After an operational pilot, a POS partner could distribute to more recurring organizers.

**Deep:** DISTRIBUTION.md specifies stage gates, integration, CAC hypotheses and retention. No partner commitments or outreach have been executed by this agent.

## 8. What is the wedge?

**10 seconds:** Small recurring festivals with coordinated merchants and online preparation.

**30 seconds:** A narrow event gives one buyer, controlled merchant onboarding and a chance to preload an allowance. We will compare cash, offline cards and connectivity backup before selling.

**Deep:** BEACHHEAD.md is a weighted hypothetical selection. If measured pain is low or a cheaper accepted fallback solves it, kill the wedge.

## 9. What is the TAM?

**10 seconds:** No sourced numerical TAM yet; we have a bottom-up experiment model.

**30 seconds:** We model eligible merchants times event frequency times infrastructure pricing. The first experiment is deliberately small and does not justify a global payments volume TAM.

**Deep:** MARKET.md separates eventual eligible infrastructure, serviceable integrations and a target pilot SOM. External event/vendor counts and willingness to pay are missing.

## 10. What prevents Stripe or Alipay copying?

**10 seconds:** Nothing prevents them copying the mechanism; no strong moat exists today.

**30 seconds:** Incumbents have offline alternatives, distribution and risk expertise. Our possible advantage is a focused integration and operational learning, not exclusive cryptography.

**Deep:** MOAT.md distinguishes current assets from twelve/thirty-six-month hypotheses. Public protocol, DID and Ed25519 are not proprietary defenses.

## 11. What happens during double spend?

**10 seconds:** First valid settlement can succeed; later intents can exceed the reserve and fail.

**30 seconds:** With ten reserved USDC, two isolated eight-USDC authorizations can both look valid offline. The contract pays one and rejects the other; the merchant can lose delivered goods.

**Deep:** Escrow caps on-chain spending, not aggregate merchant exposure. Local counters reduce honest overspending but rollback/cloned devices bypass them. No perfect offline prevention claimed.

## 12. Who absorbs offline risk?

**10 seconds:** The accepting merchant does in the MVP; no guarantee is provided.

**30 seconds:** A commercial organizer might contractually assume a capped share of losses, but that is not implemented or agreed. Risk acceptance is a release gate, not fine print.

**Deep:** Cancel/expiry, concurrent intents, stolen session keys and issuer/device risks need explicit liability, loss measurement and pricing. Any guarantee needs legal and capital review.

## 13. What licenses are necessary?

**10 seconds:** That depends on actual custody, funding, payout and jurisdictions; counsel must decide.

**30 seconds:** The prototype uses only mock assets. Production in Brazil must review PSAV, payments, AML and FX obligations and any licensed partners, rather than relying on the word noncustodial.

**Deep:** REGULATORY.md cites current BCB sources and maps functions. We do not issue legal conclusions or claim an exemption.

## 14. How does fiat settlement work?

**10 seconds:** It does not in this MVP: fiat payout is simulated.

**30 seconds:** The screen shows BRL, a fixed cached demo quote converts it to mock USDC, and the vault transfers tokens. A MockFiatRail only demonstrates payout states.

**Deep:** A live PSP/on-off-ramp, KYC, FX quote authenticity, costs and settlement contracts are production prerequisites. BRL display must never be described as PIX or bank payout.

## 15. What did you build during the hackathon?

**10 seconds:** This chat built contracts, SDK, UI and specs; the founder must verify contest disclosure.

**30 seconds:** Use the final validation ledger for tested behavior. Forty-two unit tests passed at the drafting point; integration status changes only after actual execution.

**Deep:** We have no authoritative timestamp/version history for all founder pre-existing work. Agent assistance and third-party code should be disclosed consistently with current rules.

## 16. What existed before?

**10 seconds:** The founder must confirm pre-existing code, designs and IP.

**30 seconds:** The workspace initially had no project files. That does not establish whether the founder had work elsewhere, so no blanket claim of everything being new is made.

**Deep:** Inventory owned code, generated code, dependencies and reused assets before submission. No eligibility determination from an empty workspace alone.

## 17. What did users tell you?

**10 seconds:** No user interviews are recorded yet.

**30 seconds:** We have a non-leading interview guide and validation rubric. We will not fabricate quotes, LOIs, interest or willingness to pay from the technical demo.

**Deep:** VALIDATION.md separates research classes and demand signals. Actual technical tests can prove mechanism behavior but not customer pain.

## 18. What would you build with $250k?

**10 seconds:** Harden the protocol, resolve liability and run a small partner-led pilot.

**30 seconds:** The plan allocates engineering, independent security, legal work, pilot operations and contingency. Hiring or new chains depend on milestones, not spending the entire amount immediately.

**Deep:** ACCELERATOR_PLAN.md totals exactly $250k in assumptions and targets a paid buyer/repeatability. It is not funding received or permission to spend.

## 19. Would you work full time?

**10 seconds:** That is a founder decision not yet provided.

**30 seconds:** We should state actual availability, obligations and conditions, rather than manufacture commitment to fit an accelerator narrative.

**Deep:** Founder must confirm time allocation and runway. Investor/application text cannot replace that fact.

## 20. Why not card offline mode?

**10 seconds:** It may be the better solution; we compare it first.

**30 seconds:** Card store-and-forward already keeps some checkouts moving. We test whether public reserved funds and independent verification solve a remaining problem for the event buyer.

**Deep:** Region/hardware/risk rules differ. Compare actual total cost, liability and onboarding in the intended event; do not claim card networks require online for every authorization.

## 21. Does prefunding ruin UX?

**10 seconds:** It can; it is one of our most important adoption risks.

**30 seconds:** An event might prepare a small allowance at check-in, but visitors may reject locked funds or refunds. The pilot must measure preparation and abandonment.

**Deep:** Future funding partners are not implemented. Browser passwords, wallets and balances must remain measured frictions, not hidden prerequisites.

## 22. What does DID add?

**10 seconds:** A portable account identifier, not verified real-world identity.

**30 seconds:** It makes payer, merchant and device references consistent. If it does not improve integration or recognition, it should stay out of the main pitch.

**Deep:** did:pkh ties an account namespace to address control. Without trusted credentials and governance it provides neither KYC nor merchant reputation.

## 23. Can merchants verify reserve offline?

**10 seconds:** Only a trusted cached snapshot, not current blockchain state.

**30 seconds:** A merchant needs session metadata obtained while online. A valid signature cannot reveal spending or revocation after that snapshot.

**Deep:** Never treat untrusted QR-supplied metadata as chain truth. Show snapshot age; a future portable attestation also needs expiry and revocation policy.

## 24. What if device is compromised?

**10 seconds:** A stolen session key has limited authority, but the merchant and session remain exposed.

**30 seconds:** Encryption protects stored bytes; it does not stop XSS, malware or a key already unlocked in memory. Caps and expiry reduce scope.

**Deep:** Production needs OS keystore/TEE where appropriate, CSP/supply-chain controls, session lifecycle, incident response and audit. JS memory cannot guarantee zeroization.

## 25. What if a payer cancels after buying?

**10 seconds:** The pending intent can fail; the merchant bears that risk today.

**30 seconds:** Cancellation releases unspent funds and revokes the session. Offline merchants do not observe that immediately, so revocation is part of counterparty risk.

**Deep:** Future policy could delay release or protect accepted commitments, but no universal acceptance oracle exists offline. Do not change contract policy casually for a pitch.

## 26. Why is this a protocol rather than feature?

**10 seconds:** Today it is a protocol-shaped prototype; external adoption will decide.

**30 seconds:** OfflineSession and adapters create reusable interfaces. That only becomes a network business if independent integrators use them and economics justify distribution.

**Deep:** Do not confuse package structure with a moat or demand. Preserve the small useful component; avoid superapp scope.

## 27. How do you measure success?

**10 seconds:** Successfully settled offline-authorized volume, plus losses and preparation friction.

**30 seconds:** Count accepted and settled separately; demo transfers are not GMV traction. Measure merchant recurrence and buyer renewals as well as latency.

**Deep:** METRICS.md defines denominators/cohorts and real vs simulated modes. Small test samples do not prove production fraud rate or p95 latency.

## 28. What is open-source and what is IP?

**10 seconds:** Public interfaces and code need a selected license; no protected-IP claim exists.

**30 seconds:** The user sees OfflineSession as a possible strategic asset. We must distinguish product insight, reproducible code, patents and rights in dependencies.

**Deep:** No patentability/FTO analysis performed. License and copyright ownership require founder review; open-source status is not established by local files alone.

## 29. How do you expand?

**10 seconds:** Only after one buyer, a repeatable integration and acceptable losses.

**30 seconds:** A POS/PSP channel could take the same component to additional events and markets. Funding, payout, legal and risk requirements may differ.

**Deep:** MARKET and DISTRIBUTION label this as conditional expansion. Solana or other chains require new signing/verifying implementations, not a marketing toggle.

## 30. What kills ShimoPay?

**10 seconds:** No material pain, unacceptable merchant risk, or no buyer willing to pay.

**30 seconds:** If card offline or connectivity backup solves the real problem more cheaply, or prefunding destroys conversion, the wedge should be abandoned or revised.

**Deep:** RED_TEAM identifies fatal business hypotheses. A functional technical demo is still useful evidence, but it must not become an excuse to ignore a negative market result.
