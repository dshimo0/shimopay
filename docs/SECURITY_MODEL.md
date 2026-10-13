# Security model — Solana MVP

Assets: online development master/fee-payer keys, encrypted device session seed, SPL reserve funds, signed intents, cached FX quotes and merchant identity. The chain is authoritative; offline acceptance is provisional.

| Threat | MVP mitigation | Residual risk | Production recommendation |
|---|---|---|---|
| Stolen session key | allowance-specific signer, prefunded limit, expiry, merchant binding | attacker can spend remaining allocated funds; multiple merchants may accept conflicts | OS keystore/TEE, device attestation, shorter policies |
| Master key compromise | master never signs offline or enters browser; dedicated development server files excluded from Git | shared server controls demo accounts and faucet; restricted file permissions are not a production vault | noncustodial wallet integration or audited custody/HSM |
| Replay | permanent receipt PDA keyed by allowance+nonce; merchant local nonce/sequence cache | isolated merchants cannot see other local caches | synchronize risk signals, retain replay state |
| Offline double spend | allocated prefunded reserve, max amount, expiry, local aggregation | conflicting intents can be accepted; merchant losses can exceed escrow | explicit risk pricing/insurance, trusted hardware or online synchronization |
| Altered intent | fixed canonical Ed25519 bytes; precompile binding to current settle instruction | client bugs/XSS can alter the request before signing | independent audit, reproducible clients, CSP |
| Malicious/fake merchant | signed merchant pubkey, merchant transaction signer and token-account authority | DID proves account control, not trustworthy business identity | authenticated invoices and verified merchant registry |
| Expired capability | Clock sysvar, strict expiry and on-chain active status; local snapshot/time checks | device clock can lie; stale snapshot misses cancellation | trusted policy provisioning, clock/risk controls |
| Compromised device | PBKDF2/AES-GCM seed storage, lock on hidden tab, best-effort memory clearing | unlocked seed/password vulnerable to malware/XSS | OS secure keystore, threat-aware UX, security review |
| Malicious backend | Solana program enforces signed domain, amount, signer, merchant and PDA constraints | backend can lie about snapshots/FX, censor or misuse shared development master wallets | authenticated snapshots, independent RPC, noncustodial transaction signing |
| FX manipulation | demo quote hash and integer conversion included in signed intent | hashes do not authenticate price source; no oracle | signed quotes, source redundancy, bounded validity |
| Precompile substitution | immediately previous Ed25519 instruction; one signature; fixed self key/signature offsets; message restricted to current program data | verifier bugs remain possible | dedicated cryptographic/program audit and fuzzing |
| Vault depletion | available vs allocated accounting, owner/PDA/Token Program constraints, atomic SPL CPI | program upgrade authority can replace code | audited upgrades, production authority controls |

Revoking an allowance releases its unspent allocation. This may invalidate merchant-accepted intents; no irrevocable offline guarantee is claimed. 30-second issuedAt clock skew does not extend expiry. All tokens and SOL used are development assets, with no real fiat movement.

## Circle Devnet and signed FX update

Mainnet and private mock mints on Devnet are refused. Circle faucet test USDC has no real monetary value. Circle mint authority/freeze authority are external issuer controls. The Devnet funding path deposits existing ATA assets; the server cannot mint Circle tokens.

FX uses a separate Ed25519 issuer seed in ignored server-only `.solana/fx-signer.json`. Every quote binds pair, integer rate, timestamps and fixed freshness/buffer policy. Merchant verifies against the cached deployment issuer key. This is a fixed demo rate, not a live oracle. Compromised initial deployment metadata/backend can substitute an issuer; production requires authenticated configuration and quote-issuer governance. Device clocks can be manipulated; offline time validity retains that risk. Once accepted, settlement uses the signed amount unchanged even if a newer quote exists.

Master accounts in this hackathon demo remain server-managed development accounts; no production wallet custody is claimed. Merchant signs online settlement and pays test SOL fees. Consumer session signs offline messages only. Kora/gas sponsorship remains unimplemented.

Pix credentials are server-only, TEST-prefixed and responses must indicate `live_mode:false`. Provider approval is obtained by status lookup rather than a browser button. Conversion and payout remain unimplemented real transfers. Test credentials may not support Pix for the configured provider account; provider validation is a release gate.

## Online direct transfers

Online payments require the payer connectivity gate and a fixed-recipient, bounded test-payment schema. The server checks a signed FX quote and the bound amount, signs with its protected development consumer key, and transfers only unreserved ATA funds. Server-side persisted idempotency binds request UUID, generation/network, merchant, mint, amount, BRL value and quote ID. Transaction bytes/signature are retained before broadcast; retry never silently signs a second transaction. Submitted-but-unconfirmed payments require reconciliation. Single-process mutation locking is demo-only; a production deployment requires authentication, user wallet authorization and transactional idempotency across instances. Localnet/Devnet guardrails remain; no real funds or mainnet are permitted.
