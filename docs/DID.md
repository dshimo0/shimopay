# DID identities

The Solana demo uses `did:pkh:solana:<genesis-first-32-base58-characters>:<public-key>` following the Solana CAIP-2 reference convention. Consumer, merchant and device/session identities appear in the UI. The signed protocol domain uses the complete 32-byte genesis hash, not the shortened DID reference.

`createSolanaDid` and `parseSolanaDid` live in `packages/solana/src/protocol.ts`; malformed namespaces, network references and public keys are rejected. DID is a locally verifiable account identifier, not KYC, legal identity, a government credential or merchant trust certification. No real credential verification is implemented. Legacy EVM DID helpers remain in `packages/protocol/src/identity`.
