# Unit economics — modelo auditável

Tudo abaixo é **ASSUMPTION**, exceto fórmula/conversão demo. Não são custos observados em Ethereum, cotações de fornecedores nem forecasts de receita.

## Um merchant-evento (200 transações de R$25)

| Input | Value | Class |
| --- | --- | --- |
| Transaction value | R$25 | KNOWN demo; ASSUMPTION comercial |
| Transactions / merchant-evento | 200 | ASSUMPTION |
| Merchant TPV | R$5,000 | Derived assumption |
| Infrastructure fee | R$150 | ASSUMPTION; a testar |
| Revenue / transaction equivalent | R$0.75 | Derived; take equivalente 3%, não % cobrada |
| Chain cost / transaction | R$0.10 | TARGET budget; Ethereum L1 não validada |
| Infrastructure / transaction | R$0.05 | ASSUMPTION |
| Support/onboarding / merchant-evento | R$30 | ASSUMPTION |
| Fraud/loss reserve | 0.5% TPV = R$25 | ASSUMPTION economic burden, mesmo que merchant arque inicialmente |
| Payment rail funding/payout | R$0.10 / tx = R$20 | ASSUMPTION; fornecedor não contratado |

Gross profit = 150 − (20 chain + 10 infra + 30 support + 25 loss + 20 rail) = **R$45**; margem **30%**. Pricing/custos atuais não sustentam claim de alta margem. Se organizer absorve losses por contrato, retirar a reserva do custo ShimoPay só junto com disclosure e medir a economia total do cliente.

## Escala por ciclo de evento

| Merchants-eventos | Transactions | TPV | Revenue | Variable+allocated cost | Gross profit | Margin |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 200 | R$5,000 | R$150 | R$105 | R$45 | 30% |
| 1,000 | 200,000 | R$5m | R$150k | R$105k | R$45k | 30% |
| 100,000 | 20m | R$500m | R$15m | R$10.5m | R$4.5m | 30% |

Linear exercise only; **not SAM, achievable scale or annual revenue**. Exclui engineering, legal, audit, fixed overhead, impostos, aquisição, capital de garantia e chargeback operations.

## Sensitivity

Break-even fee = R$105 nas hipóteses base. Chain R$1/tx acrescenta R$180: gross profit cai para −R$135. Loss 2% TPV acrescenta R$75: gross profit −R$30. Para margem TARGET 60%, custos precisariam cair de R$105 para no máximo R$60, ou preço subir para pelo menos R$262.50 — ainda sem fixed overhead.

Conclusão: demonstrar EVM não justifica operar micropagamento em L1. Medir receipt gas, cotar rail e validar preço/risco antes de escolher deployment de produção.

## Solana migration update

Earlier EVM/L1 fee scenarios are historical and do not estimate the current Solana rail. Measure actual Devnet instruction fees, allowance/receipt rent and RPC costs separately before converting to BRL or changing margin hypotheses. The local demo establishes functionality, not production unit economics or willingness to pay. Public Devnet evidence is still pending test SOL.
