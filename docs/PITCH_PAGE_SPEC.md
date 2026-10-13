# Pitch page — business-driven delivery

## Outcome

A founder can send one stable HTTPS URL presenting ShimoPay's thesis, product, buyer hypothesis, business model, technical proof and next validation steps. A visitor can open the working demo from the page. The pitch must remain available independently of the 45-minute demo session.

## Delivered surface

- Static Vercel entry and `/pitch.html`: header, section navigation, ten numbered pitch sections, footer and accessible demo CTA.
- Next.js `/` and `/pitch`: the same deck content; `/demo` retains the consumer/merchant experience and gains a Pitch deck link.
- Shared React source `apps/web/app/pitch/Pitch.tsx`, scoped CSS and generated static launcher assets. Regenerate with `node --import tsx apps/web/scripts/render-pitch.ts` before publishing the launcher.
- Print action / PDF-friendly landscape print styles. No analytics, third-party fonts or external image dependencies.

## Narrative and factual constraints

Authorization offline, settlement online; OfflineSession as the central object; event operators/POS as the initial buyer hypothesis. Pricing R$150 per active merchant-event with up to 200 transactions is explicitly unvalidated and not charged in the MVP. Technical proof refers to 33 passing Solana tests and 5 E2E; it is not a security audit or commercial traction. Current deployment is localnet; public Devnet proof remains pending. Mock BRL conversion does not move fiat.

Founder experience is user-reported: 25 years security, more than two dozen IAM projects and over two million identities; Naapi hackathon win and Alibaba China visit are not asserted as current partnerships or endorsements. No customers, revenue, market-size estimates, pilots or LOIs are invented.

## Acceptance

- Stable page returns HTTP 200 without starting a sandbox.
- Desktop and mobile layouts have no horizontal overflow; keyboard-accessible navigation, heading hierarchy and live launch status work.
- Consumer balance/offline allowance is shown as a clearly labeled product illustration on the pitch; real balances remain on `/demo`.
- Demo CTA retains the approved same-origin start/resume flow and validates the HTTPS Vercel-run destination.
- PDF export is readable and retains risk/claim qualifications.
- Lint, typecheck, production build and browser verification pass; source is committed and pushed.
