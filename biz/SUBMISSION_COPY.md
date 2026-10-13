# Submission copy — draft preparation, not submitted

The actual logged-in World's Fair form has not been inspected. We cannot claim this covers every required field or current character limit. Field inventory below is proposed; confirm with the real form before applying.

The user's business brief explicitly requests draft copy. These are reviewable draft descriptions; founder must confirm facts, rewrite personal material and submit themselves. Nothing is posted by this agent. Do not use unverified founder/traction/IP claims.

## Project name

ShimoPay

## One-line description

ShimoPay is a prototype for limited merchant payments authorized offline and settled later against public escrow.

## Problem

Checkout can stop during network interruptions. Existing fallbacks include cash, better connectivity and offline card payments. Our initial hypothesis is that event operators need an additional option with explicit reserved funds, device-level authority and transparent reconciliation.

## Product

The customer prepares a small offline allowance online. A limited session key then signs a merchant-bound payment intent locally, with the price displayed in reais. The merchant verifies the signature and cached session policy without RPC. Once connected, the merchant submits the intent for escrow settlement.

## Blockchain integration

An Anchor program controls SPL reserves, represents limited OfflineAllowances as PDAs, validates canonical Ed25519 intents through Solana's precompile and permanently records nonce receipts. Real SPL transfers and adversarial tests have passed on local validators, including the hosted engineering demo. Public Solana Devnet deployment and independent Explorer proof remain blocked on test SOL funding; the Solana track submission gate is not complete. No real fiat or USDC is moved.

## Differentiation

Our product hypothesis combines portable account identity, bounded device authority and public escrow in a merchant integration. Offline signing itself is not new. Competition and novelty remain under investigation; no “first” claim.

## Business model / customer

Proposed buyer: an event operator/POS provider serving food and drink merchants at small recurring festivals. The primary model is a B2B infrastructure fee per active merchant-event. Pricing, willingness to pay and customer risk acceptance are not validated yet.

## Progress / traction

Use only the final docs/VALIDATION.md execution results. The Solana migration passed 30 local program/protocol tests and 42 retained legacy regressions, plus four browser E2E cases; see the latest recorded validation. Commercial interviews, customers, LOIs, revenue and production GMV are not recorded. Do not present demo transactions as customers or revenue.

## Security limitations

Offline acceptance remains pending settlement and carries counterparty risk. Competing intents, cancellation or expiry can cause a later rejection. The escrow caps on-chain session spending, not the aggregate value merchants may deliver offline. Device compromise and malicious frontend remain risks.

## Pre-existing work / team / contact

Founder to verify what existed before the contest, authorship, external dependencies, repository ownership, personal biography, commitment, contact and links. No statement fabricated here. Draft code in this workspace was produced during this chat with agent assistance; that does not independently establish hackathon eligibility.

## Assets / references

README and architecture/proof documentation are in the repository; the hosted engineering demo entry is https://shimopay-demo.vercel.app. The GitHub repository is private. Public Devnet proof, public reviewer access and demo/presentation recordings still need completion. Inspect logged-in form for mandatory fields, limits and current track options. Do not bypass the champion gate to fill a deadline.
