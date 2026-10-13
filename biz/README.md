# Business-driven delivery

Status: business hypothesis documented; no commercial validation or submission claim.

| Need | Source of truth |
| --- | --- |
| One-page case | [BUSINESS_THESIS](BUSINESS_THESIS.md) |
| Customer / north star | [BIZ](BIZ.md), [JTBD](JTBD.md), [BEACHHEAD](BEACHHEAD.md) |
| Wedge / novelty / positioning | [WEDGE](WEDGE.md), [POSITIONING](POSITIONING.md), [WHY_WIN](WHY_WIN.md) |
| Claims / customer research | [EVIDENCE](EVIDENCE.md), [VALIDATION](VALIDATION.md), [TRACTION](TRACTION.md) |
| Competition / past winners | [COMPETITION](COMPETITION.md), [WINNER_BENCHMARK](WINNER_BENCHMARK.md), [COPILOT_REVIEW](COPILOT_REVIEW.md) |
| Model / economics / market | [BUSINESS_MODEL](BUSINESS_MODEL.md), [UNIT_ECONOMICS](UNIT_ECONOMICS.md), [MARKET](MARKET.md) |
| GTM / moat / founder | [DISTRIBUTION](DISTRIBUTION.md), [MOAT](MOAT.md), [FOUNDER_MARKET_FIT](FOUNDER_MARKET_FIT.md) |
| Risks / progress | [REGULATORY](REGULATORY.md), [RED_TEAM](RED_TEAM.md), [METRICS](METRICS.md), [JUDGE_SCORECARD](JUDGE_SCORECARD.md) |
| Work selection | [FEATURE_DECISIONS](FEATURE_DECISIONS.md), [PRIORITIZATION](PRIORITIZATION.md) |
| Pitch / interview / investment | [PITCH](PITCH.md), [INTERVIEW](INTERVIEW.md), [ACCELERATOR_PLAN](ACCELERATOR_PLAN.md) |
| Submission readiness | [SUBMISSION_COPY](SUBMISSION_COPY.md), [SUBMISSION_CHECKLIST](SUBMISSION_CHECKLIST.md), [CHAMPION_GATE](CHAMPION_GATE.md) |
| Technical proof | [SPEC](../SPEC.md), [acceptance](../docs/ACCEPTANCE_CRITERIA.md), [validation](../docs/VALIDATION.md), [demo](../docs/DEMO.md) |

Every new feature must answer why it exists. BUILD → DEMO → VALIDATE → RESEARCH → UPDATE CASE → RE-SCORE → KILL LOW-VALUE WORK → BUILD. Do not hide unknowns behind more code.

## Current business proof gate — real test rails

The founder's current priority is real Devnet Circle USDC + on-chain reserve + offline authorization + merchant-initiated settlement, followed by an actual provider Pix sandbox request. [Delivery specification](../docs/REAL_RAILS_SPEC.md) and [current verified/blocked status](../docs/REAL_RAILS_STATUS.md) control the claim. Localnet transfers, HTTP fixtures and simulated conversion do not establish public Devnet or fiat proof. P1 gasless/Solana Pay work is deferred until these P0 gates are green. No customer, revenue, pilot or LOI is inferred from technical tests.
