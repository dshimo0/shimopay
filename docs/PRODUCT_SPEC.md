> **Solana migration supersedes EVM-specific criteria in this historical baseline.** Current deliverables and status: [SOLANA_MIGRATION_SPEC](SOLANA_MIGRATION_SPEC.md). The primary demo uses Solana v2 / Ed25519 / Anchor / SPL; no Sepolia/EVM path satisfies the new submission gate.

# ShimoPay — especificação de negócio

Status: baseline v0.1, derivada do briefing do usuário. Implementação em andamento; MVP não aprovado.

## Hipótese e posicionamento

Uma OfflineSession vinculada a DID, respaldada por escrow e limitada por política permite autorizar pagamentos localmente e liquidá-los quando a conectividade retorna. O usuário vê BRL; o settlement da demo usa exclusivamente mock USDC.

**Payments that don’t stop when the network does.**

O produto separa **offline authorization + online settlement**. Não promete blockchain offline, finalidade durante aceitação offline, prevenção perfeita de double spending ou movimentação real de fiat.

## Personas e resultados

| Persona | Necessidade | Resultado verificável |
| --- | --- | --- |
| Consumer | Pagar durante perda de conexão sem expor a chave principal | Autoriza localmente com session key limitada e criptografada |
| Merchant | Aceitar uma autorização verificável durante perda de conexão | Verifica assinatura, destinatário, validade e snapshot; vê pending settlement |
| Apresentador | Provar a tese em aproximadamente 90 segundos | Executa /demo e mostra recebimento on-chain e tx hash |

## Requisitos de negócio

| ID | Requisito | Aceite |
| --- | --- | --- |
| BUS-01 | Identidade visível e verificável localmente | DIDs de payer, merchant e device/session exibidos; nenhum KYC real |
| BUS-02 | Reserva anterior à desconexão | Consumer recebe 100 mUSDC e reserva 50 em sessão de 24h |
| BUS-03 | Compra offline em BRL | Cobrança R$25 converte pelo quote cacheado de 5,50 BRL/USDC para 4,545455 mUSDC |
| BUS-04 | Aceitação offline verificável | Merchant aceita sem RPC/backend e informa Pending settlement e risco residual |
| BUS-05 | Liquidação posterior | Após retorno da rede, merchant recebe tokens e vê tx hash |
| BUS-06 | Risco limitado pelo escrow | Duas autorizações de 8 sobre reserva de 10: primeira liquida, segunda rejeitada |
| BUS-07 | Resiliência real | PWA previamente carregada abre offline e permite assinar/verificar |
| BUS-08 | Experiência de produto | Consumer e Merchant têm valores, estados e ações; dados técnicos ficam colapsados |
| BUS-09 | Abstração de rails | CryptoSettlementRail liquida; MockFiatRail apenas simula payout |
| BUS-10 | Revogação controlável | Remover chave local e cancelar sessão on-chain quando conectado, explicando pendência offline |

## Escopo e exclusões

Monorepo pnpm, Hardhat 3, EVM local 31337, suporte configurável a Sepolia 11155111, Next.js PWA, IndexedDB, WebCrypto, EIP-712, did:pkh, ERC-20 de teste. Ganache não é dependência.

Fora do escopo: mainnet, fundos reais, PIX/bancos/cartões reais, KYC, DEX/oracle, bridges, token próprio, NFTs, yield, account abstraction completa, biometria e hardware seguro.

## Indicadores da demo

- Um fluxo A completo: funding → reserva → offline → autorização → aceitação → online → settlement.
- Todos os cenários B–E com rejeição verificável e razão explícita.
- Zero chamadas de rede iniciadas pela aplicação durante simulação offline.
- Chave principal nunca persiste em texto claro; session key persiste somente cifrada.
- Build, lint, typecheck, testes e integração passam antes de declarar concluído.

Esses indicadores validam funcionamento da demo; não representam adoção, disponibilidade de produção ou aprovação de segurança independente.
