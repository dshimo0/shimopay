# Business model

**PRIMARY MODEL: B — B2B infraestrutura para operadores / POS de eventos.** Pricing hypothesis: R$150 por merchant-evento ativo com até 200 transações; excedente negociado antes do piloto. Sem cobrança no MVP e sem preço validado.

| Model | Customer | Pricing unit | Gross margin hypothesis | Dependencies | Regulatory complexity | Scale / decision |
| --- | --- | --- | --- | --- | --- | --- |
| A Merchant transaction fee | Vendedor | % TPV ou transação | Sensível a loss e gas; não medida | Funding/settlement/payout | Média/alta conforme operação | DEFER; competir com fees existentes |
| B Infrastructure | Organizer/POS | Merchant-evento + franquia | TARGET positiva depois de suporte/gas; modelo em UNIT_ECONOMICS | Integração/contrato B2B | Menor exposição se software-only, não isenção | BUILD hipótese primária |
| C SDK licensing | PSP/wallet | Licença anual + usage | TARGET maior margem com integração repetível | Enterprise sales / SLA | Depende de papéis legais | Expansion após pilotos |
| D Settlement spread | Trader/merchant | Spread por settlement | Não estimada | Liquidity / treasury | Alta | DEFER; não cobrar implicitamente |
| E Premium offline risk | Organizer/merchant | Prêmio por exposure | Pode ser negativa sem dados | Underwriting, capital, claims | Alta, possível seguro/garantia | DEFER; MVP não garante |
| F FX/cross-border | PSP/merchant | Spread FX | Não estimada | On/off ramps/câmbio | Alta | DEFER; não misturar com demo BRL |

## Quem paga e por quê

Organizer paga se receita preservada, throughput e previsibilidade justificarem custo incremental. SDK vira uma opção de continuidade, não replacement de todos os métodos. Merchant precisa poder rejeitar offline com risco incompatível.

## Experimentos

Comparar fee por evento com contratos reais e custos do fallback; demonstrar processo de suporte/settlement; oferecer piloto limitado sem fundos reais antes de proposta comercial. Pricing precisa de buyer interviews, não de escolha arbitrária de take rate.
