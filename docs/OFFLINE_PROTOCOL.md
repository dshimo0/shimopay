# Offline protocol v2 — Solana

Provisioning is online; signing and merchant verification are offline; settlement is online. A cached snapshot is advisory. It cannot attest current revocation, competing isolated intents or exact remaining on-chain balance.

## Canonical binary message

410 bytes, in the following fixed order. Prefix is UTF-8 `ShimoPay/Solana/v2` (18 bytes). Fields: full cluster genesis hash, program, reserve, allowance, consumer, session public key, merchant, mint (each 32 bytes); amount u64 LE; nonce 32 bytes; issuedAt i64 LE; expiresAt i64 LE; sequence u64 LE; BRL displayAmountMinor u64 LE; FX quote hash 32 bytes; deviceIdHash 32 bytes. Times are nonnegative safe integers at the TypeScript boundary. BRL and protocol version 2 are fixed by schema/domain.

The JSON envelope is portable and schema-strict, but JSON ordering is not the signed representation. Ed25519 signs canonical bytes. Base58 represents addresses/signatures; hashes use lowercase 0x-prefixed 32-byte hex. Values must fit u64, and nonzero amounts/sequences are required. Every signed field is bound both offline and on-chain.

Offline verification uses strict Ed25519 verification (`zip215:false`) to reject degenerate-key forgeries; it checks signature, schema, version, cluster/program/allowance/consumer/mint binding, merchant, active cached allowance, time, cached remaining funds, local nonce and sequence history. FX integrity and conversion are checked locally. The server authenticates the quote with a separate Ed25519 FX key, whose public key is cached with deployment metadata. The rate is demonstrative and fixed, not a live market oracle. The hash/signature bind the complete freshness/buffer policy. Up to 15min the base rate applies; 15–30min requires an explicitly priced 3% buffer; at 30min the quote expires. Merchant acceptance verifies the amount using signing time and refuses an unbuffered intent if the quote has aged before acceptance. Settlement uses the signed amount without fetching a new quote. R$25 becomes 4.545455 token units (round up in micro-units).

## Compact Solana verification

Duplicating the entire message in both instructions exceeds Solana's 1,232-byte transaction limit. The transaction contains merchant ATA creation, Ed25519 verification, then settlement. Public key/signature offsets point inside the Ed25519 instruction (`u16::MAX`). The message points to offset 8 (after the Anchor discriminator) of the current settlement instruction. The program requires exactly that instruction index, offset, expected message length, current program ID and equality to its independently serialized canonical message. It accepts no arbitrary cross-instruction references or unrelated verified messages.

A receipt PDA derived from `receipt`, allowance and nonce permanently blocks a second settlement of the same nonce. Sequence is a local risk signal; nonce receipts enforce on-chain uniqueness. Clock comparison allows at most 30 seconds future issuedAt skew. Expiry is strict, with no grace period.

Deleting the device seed offline cannot instantly revoke an already signed capability. Revocation is queued until on-chain cancellation succeeds. Multiple isolated merchants can accept mutually conflicting intents, including intents that become unpayable after owner cancellation. The reserve bounds on-chain spending, not total merchant losses.

## Payment timeline in the demo

Each device payment records the observed authorization mode (`offline`/`online`), signed intent `issuedAt`, merchant acceptance time, and the time the client observed confirmed settlement. These timestamps are device observations; the on-chain history independently displays the RPC block timestamp when available. A merchant importing a payload without matching local payer metadata shows connectivity as not recorded rather than claiming the payer was offline.

The UI distinguishes authorized/pending merchant acceptance, accepted/pending settlement, awaiting on-chain confirmation while the settlement request runs, confirmed on-chain only after the adapter confirms, and rejected settlement. Offline authorization and merchant acceptance timestamps/mode survive IndexedDB reload. No transaction signature or Explorer link is fabricated for a pending offline intent.

Consumer and merchant simulation gates are independent. Reconnecting only the merchant allows it to submit a fresh Solana transaction while the consumer remains offline. A browser-wide physical disconnection blocks both gates in split mode.
