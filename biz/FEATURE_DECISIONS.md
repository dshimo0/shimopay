# Feature decisions — why should this exist?

Toda feature nova usa este registro. Custos são estimativas relativas (1 baixo, 5 alto), sem horas fabricadas. Critérios oficiais: Functionality, Potential Impact, Novelty, UX, Open-source, Business Plan.

| Feature | Business hypothesis | User / problem | Expected value | Judge criterion | Pitch contribution | Demo contribution | Metric | Cost | Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Escrow OfflineSession | Reserva permite limitar authority sem master key | Payer/merchant; IOU sem backing | Limite verificável | Functionality | Dinheiro reservado antes | 50 USDC registrados | Reserva/conservação | 3 | Bugs financeiros | BUILD |
| Merchant binding Ed25519 / Solana v2 | Destinatário/valor verificáveis localmente | Merchant; payload adulterado | Rejeitar tamper | Functionality | Verificação local | Invalid signature | Rejeições corretas | 2 | Schema/domain mismatch | BUILD |
| Encrypted session key / lock | Authority limitada precisa proteção local | Consumer; roubo do dispositivo | Não persistir plaintext | UX | Não expõe master | Unlock/lock | Storage sem plaintext | 3 | XSS/memória | BUILD |
| PWA real offline | Label offline não prova continuidade | Ambos; app não abre | Checkout sem rede | Functionality | Rede realmente cai | Browser offline reload | Fluxos sem network | 3 | Cache/service worker | BUILD |
| Cached demo FX | Consumer quer preço BRL | Consumer; crypto confusing | Valor fiat predominante | UX | R$25 simples | 4.545455 settlement | Conversão correta | 1 | Quote sem autenticidade | BUILD |
| DID leve | Identificador consistente entre atores | Integrador; bindings ambíguos | Account identifier portátil | Open-source | Mecanismo após problema | Verified locally | Parse round-trip | 1 | DID não é KYC | BUILD |
| Split demo | Jurado precisa compreender rápido | Apresentador | Narrativa reproduzível | UX | Momento memorável | Consumer+merchant | Compreensão em 20s | 2 | Parece só simulação | BUILD |
| Adversarial tests | Claims honestos precisam rejeições | Judge/integrador | Provar limites | Functionality | Risco transparente | Replay/tamper e tests | B–E passam | 2 | Ausência de audit | BUILD |
| Adapter / mock fiat | Isolar rail preserva experiência | Integrador | Expansão sem acoplamento | Open-source | Visão futura limitada | Settlement local | Chamadas isoladas | 2 | Portabilidade exagerada | BUILD mínimo |
| Camera QR scanner | Reduz copy/paste em campo | Merchant | UX de dois aparelhos | UX | Pequeno | Não essencial split | Taxa de scan | 3 | Permissões/device | DEFER |
| Verifiable Credential mock | Poderia expressar tier | Integrador | Ainda sem need observado | Novelty | Baixo | Distração | Nenhuma definida | 2 | Confusão com KYC | DEFER |
| Solana adapter | Track específica/baixo custo | Integrador | Só se requisito/cliente justificar | Potential Impact | Portabilidade | Segundo rail | Suite equivalente | 5 | Retrabalho perto do prazo | DEFER |
| PIX/card/bank real | Funding/payout pode destravar uso | Consumer/merchant | Necessário após parceiro | Business Plan | Futuro | Fora do mock MVP | Funding conversion | 5 | Licenças/integrador | DEFER |
| Token/NFT/yield/DAO/loyalty | Nenhuma contribuição ao wedge | Nenhum definido | Não demonstrado | Nenhum | Scope creep | Ruído | Nenhuma | 5 | Distração/legal | KILL |

## Founder-directed Solana migration — 11 October 2026

Solana v2 / Anchor / SPL becomes the sole primary demo rail for the Solana and Superteam Brazil submission. Preserve offline UX and the OfflineSession business object. EVM stays historical; adapter portability does not mean wire-format portability. The business proof is independently inspectable Devnet reserve/allowance/settlement evidence, not a badge or local validator. That Devnet gate is currently blocked on test SOL funding. No customer interviews, traction, commercial partnerships or PMF are inferred from the technical migration.
