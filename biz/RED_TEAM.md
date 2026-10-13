# Red team — try to kill the company

FATAL significa bloqueio comercial/submissão, não prova de morte definitiva. Não esconder nem declarar corrigido sem experimento.

| Attack | Severity | Current answer | Correction / falsification |
| --- | --- | --- | --- |
| Needed, or better connectivity cheaper? | FATAL hypothesis | Problema geral existe; wedge local não medido | Entrevistas + custo do fallback; matar wedge se backup resolve |
| Merchant bears unacceptable risk? | FATAL hypothesis | Cancel/expiry/competing intents podem deixar merchant sem saldo | Consentimento explícito, liability contract, bounded pilot; sem live rollout antes |
| Will anyone pay? | FATAL hypothesis | Não há buyer commitment | Pricing interviews/paid pilot; não substituir por stars |
| Escrow destroys UX? | SERIOUS | Prefunding e funds locked são fricção real | Medir preparação/refund; parceiro funding, sem fingir automático |
| Too niche? | SERIOUS | Evento isolado pode ser pequeno | Provar repetibilidade PSP, não inflar TAM |
| DID adds real value? | SERIOUS | Identificador padronizado, sem reputation/KYC | Testar integração/portability; reduzir destaque se não muda resultado |
| Why blockchain? | SERIOUS | Shared escrow trust model, não offline exclusivity | Comparar banco ledger e token issuer dependencies |
| Visa/Mastercard/Stripe already do it? | SERIOUS | Sim, existem offline/card SAF; forte distribuição | Comparar contexto e buyer total cost; abandonar “first” |
| Alipay already does it? | SERIOUS | Payment codes e weak-signal handling existem; capability depende do cenário | Verificar official flow; não alegar ambos offline sem fonte |
| Wallet copies in one month? | SERIOUS | Plausível; mecanismo público é copiável | Integração/customer learning; não prometer IP moat |
| Fiat rails actual bottleneck? | SERIOUS | Sim, user onboarding e payout faltam | Parceiro licenciado antes de piloto live |
| Regulation fatal? | SERIOUS | Pode inviabilizar papel operacional escolhido | Counsel/PSP decide estrutura; não alegar software exemption |
| Protocol or feature? | SERIOUS | Hoje protótipo de protocolo, single working primary Solana rail (local; Devnet blocked) | Adoption de terceiros e economics devem provar necessidade |
| “Blockchain works offline” | COSMETIC claim with serious consequence | Não usar | Mostrar local authorization/pending, receipt só online |

## Release disposition

Produto comercial: **BLOCKED** por H1/H3/H4 sem evidência. Submissão champion: **BLOCKED** por traction/founder/market gaps. Sandbox técnico: continuar dentro do escopo para produzir prova e material de pesquisa; não lançar com fundos reais.
