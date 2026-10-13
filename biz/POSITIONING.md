# Positioning

For event operators whose merchants need a fallback during network interruptions, ShimoPay is an offline payment authorization component that keeps a bounded checkout moving until settlement is available. Unlike an unbacked payment screenshot, the prototype binds the authorization to a limited session and public escrow. Alternatives like card SAF and ecash must still be compared before claiming superiority.

## 5 words

Payments continue when connectivity fails.

## 10 words

Keep merchant payments moving offline, then settle when connectivity returns.

## 25 words

ShimoPay lets merchants verify limited payments offline, backed by funds reserved beforehand, then reconcile online, with local currency prices and explicit settlement risk for transactions.

## 50 words

ShimoPay is testing a payment fallback for event merchants when connectivity fails. Customers reserve a small allowance beforehand, authorize purchases locally, and merchants verify them without internet. Settlement happens after reconnection. The prototype uses demo tokens and local currency prices. It limits spending authority while disclosing the merchant's remaining risk.

## 100 words

When connectivity fails at an event, a checkout can stop when the customer has money. ShimoPay tests a different fallback: prepare a small spending allowance online, authorize a purchase locally, and reconcile it when the network returns. Merchants verify the signed authorization on their devices and see pending settlement clearly. The prototype displays prices in reais while settling demo tokens against public escrow. It uses a limited device key, not the customer's main wallet key. Existing offline alternatives remain relevant. Our next commercial test is whether event operators value this approach enough to accept its risk and pay for integration.

These are draft messages, not claims of live service. Validate comprehension and exact word counts before a constrained field. Portable identity and programmable rails belong after the user's problem, not in the hook.
