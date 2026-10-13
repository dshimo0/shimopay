# ShimoPay — business source of truth

Baseline: 11 outubro 2026, America/Sao_Paulo. Estado: protótipo em implementação; validação comercial pendente; **não submission-ready**.

## Why should this exist?

Durante uma interrupção, um merchant pode ter estoque e um consumidor pode ter saldo, mas a venda ainda depender de uma conexão disponível. ShimoPay testa se uma reserva pequena, preparada antes da interrupção, permite manter o checkout com verificação local e risco explícito até settlement.

Não é o primeiro produto com pagamentos offline. Stripe Terminal, sistemas de cartão e ecash já oferecem alternativas. A hipótese específica é um componente integrável de autorização limitada que verifica a sessão localmente e reconcilia contra escrow público, sem um único ledger de aceitação.

## North star

Categoria de visão: identity-native programmable payment network.

Wedge atual: pagamentos merchant offline respaldados por escrow previamente financiado.

Tagline: **Payments that don't stop when the network does.**

Frase de demonstração: **The internet went down. The payment didn't.** A frase exige mostrar Pending settlement; não implica finalidade offline.

Pitch defensável hoje: ShimoPay is a prototype that authorizes limited merchant payments offline and settles them later against on-chain escrow, with prices displayed in local currency.

Visão: Money should work independently of network, currency and payment rail. Visão não descreve capacidades atuais.

## Customer

**Beachhead escolhido:** operadores de pequenos festivais/eventos recorrentes em São Paulo, com vendedores de alimentos/bebidas e distribuição controlada no check-in. Seleção por score hipotético em [BEACHHEAD](BEACHHEAD.md); nenhum operador parceiro confirmado.

| Papel | Quem | O que recebe / compra |
| --- | --- | --- |
| USER consumer | Visitante que aceita preparar uma reserva antes de entrar | Checkout alternativo durante indisponibilidade |
| USER merchant | Vendedor credenciado do evento | Aceitação com verificação local e fila de reconciliation |
| CUSTOMER | Operador de evento / provedor de POS do evento | SDK e painel de continuidade; modelo B2B por merchant-evento |
| BENEFICIARY | Merchant e visitante | Venda preservada, fila menor; benefício ainda não medido |
| PARTNERS | PSP licenciado, POS vendor, organizer e wallet | Distribuição, funding/payout e responsabilidade regulatória |

Não atacar transporte, rural, turismo, delivery e festivais simultaneamente. Não exigir que usuários comuns já tenham carteira cripto ou USDC: piloto comercial só avança com parceiro de funding e payout autorizado, sem essas integrações no MVP.

## Business model e risco

Modelo primário: **B2B infraestrutura**, fee por merchant-evento ativo mais uso acima de franquia, hipótese em [BUSINESS_MODEL](BUSINESS_MODEL.md). O cliente paga por continuidade operacional; não cobramos spread de FX na primeira proposta.

Até settlement, o merchant suporta a perda potencial do intent que não liquidar. Um futuro operador pode contratar regras de indenização com reserva e preço próprios; não existe garantia no MVP. O escrow limita o desembolso do payer, **não o total de bens que merchants isolados podem entregar**.

## Hipóteses que podem matar o negócio

- H1: vendas perdidas por indisponibilidade são materiais após comparar cash, cartões offline e backup de conectividade.
- H2: usuários aceitam prefunding pequeno e têm caminho viável de funding.
- H3: merchant/operador aceita risco e cancellation policy mensuráveis.
- H4: operador paga mais que custo de infraestrutura, suporte e perdas.
- H5: um PSP/POS distribui sem reescrever todo checkout.

Se H1, H3 ou H4 falhar em pesquisa/piloto, pausar produto comercial. Continuar uma demo não prova empresa.

## Controle de entregas

[FEATURE_DECISIONS](FEATURE_DECISIONS.md) · [PRIORITIZATION](PRIORITIZATION.md) · [VALIDATION](VALIDATION.md) · [METRICS](METRICS.md) · [JUDGE_SCORECARD](JUDGE_SCORECARD.md) · [RED_TEAM](RED_TEAM.md).

## Status de evidência

Actual traction: nenhuma comercial. Demand signal: não coletado. Interviews/LOIs/pilots/waitlist: nenhum registrado. Testes executados são evidência técnica, não demanda. Não alegar IP exclusivo, patenteabilidade, moat ou parceria com Colosseum.
