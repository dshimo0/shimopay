# Metrics

**North star candidate:** volume de pagamentos autorizados offline e liquidados com sucesso. Medir asset-native e fiat cotado separadamente; nenhuma soma multimoeda sem método de conversão explícito.

| Metric | Definition | Measurement / exclusions | Current |
| --- | --- | --- | --- |
| Offline authorization latency | início do click Pay até envelope persistido/assinado | performance.now; separar unlock/PBKDF2 e QR | Não instrumentada |
| Settlement latency | envio online até receipt e confirmação policy | Não confundir aceitação offline com finality | Não medida |
| Transaction cost | gasUsed × effectiveGasPrice | gas native + preço externo com timestamp; mock gas não custo comercial | Não medida |
| Failure rate | falhas por tentativa válida | Adversarial tests fora da taxa operacional | Não medida |
| Replay rejection | repetição liquidada bloqueada | Teste isolado + ausência de 2ª transferência | Teste contract passou |
| Overspend rejection | excedente de reserva rejeitado | A=8/B=8 sobre10; ledger correto | Teste contract passou |
| Merchant activation | concluído onboarding + risk consent + test settlement | Download não conta | 0 comercial |
| Payments/user | intents únicos + settled separados | dedup por domain/session/nonce | Não medida |
| GMV | valores efetivamente settled | intents aceitos não entram em GMV final | 0 comercial |
| Successful offline authorization | signed/persisted valid locally | contar modo real e simulado separados | E2E pendente |
| Settlement success | settled / accepted elegíveis | coorte; incluir expired/cancelled losses | Não medida |
| Merchant retention | merchant ativo em evento seguinte elegível | cadastro e uso não são retenção | Não medida |
| Loss/fraud rate | bens entregues sem recebimento / TPV aceito | escrow não garante merchant aggregate liability | Não medida |

Piloto futuro: registrar consentimento e mínimo de dados, não plaintext key/PII on-chain. Mediana/p95 de latência só com n suficiente e hardware identificado; não reportar percentis sobre poucas execuções.
