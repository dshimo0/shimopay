# ShimoPay — entregáveis de negócio da demo funcional

2026-10-12 · vinculados a [SPEC.md](../../SPEC.md), [plano](../plans.md) e [progresso](../progress.md). Estado: demo técnica VERIFIED, sem clientes/pilotos/receita comprovados por esta entrega.

## Hipótese a provar

Um consumidor e um pequeno lojista podem continuar autorizando um pagamento limitado em BRL durante interrupção de conexão e receber USDC de teste on-chain ao reconectar, usando uma interface de produto. O protocolo abstrai autorização, valor apresentado e rail de settlement.

A demo valida viabilidade técnica e compreensão da UX; não prova demanda, economia unitária, compliance, liquidez cambial ou parceria comercial. Turismo/visitante continua hipótese de descoberta, não wedge comercial validado.

| ID | Entregável de negócio | AC técnico | Evidência / métrica da demo | Estado |
| --- | --- | --- | --- | --- |
| B01 | Produto utilizável fora de split demo | AC-01, AC-02 | Consumer/merchant Mobile, saldo verificável, header/nav e idiomas; UI não remete para demo externa | VERIFIED demo |
| B02 | Continuidade de pagamento | AC-04–AC-07 | Uma autorização R$25 aceita com zero RPC/backend, depois uma transferência 4.545455 USDC confirmada | VERIFIED demo |
| B03 | Pagamento online complementar | AC-03, AC-08 | Transferência real Devnet com saldo livre, recibo/histórico/Explorer | VERIFIED demo |
| B04 | Confiança e risco compreensíveis | AC-08–AC-12 | Pendência e confirmação distintas; replay/tamper/overspend rejeitados com motivo; risco offline explícito | VERIFIED demo |
| B05 | Abstração de rail demonstrável | AC-13, AC-14 | Provider order/QR/approval sandbox verificados; conversão/payout simulados visíveis | VERIFIED sandbox, payout/conversion simulados |
| B06 | Apresentação repetível | AC-15 | Pitch PT-BR/EN-US, roteiro 90s, URL persistente, preflight/recovery e evidência | VERIFIED demo |

## Pitch bilíngue — conteúdo entregue em D09

1. Problema: perda de conectividade interrompe autorização no caixa. Não inventar TAM, estatísticas de fraude ou taxa de falhas.
2. Solução: autorização local por session key limitada, escrow e settlement online; mostrar UX consumidor/merchant.
3. Prova: Circle USDC Devnet, Explorer de transações reais, sessão/ATA, pending→confirmed e ataque rejeitado.
4. Arquitetura: identidade/política/FX/intent/adapter; Solana default, EVM secundário; fiat sandbox explicitamente separado.
5. Negócio: hipótese de cliente/comprador, benefício e discovery seguinte; pricing/economics/pilotos continuam a validar, sem números inventados.
6. Time/próximos passos: experiência do fundador com classificação de fonte; relato pessoal não é comprovação externa nem endorsement de Alibaba/seguradora. Produção exige auth/custódia/compliance, off-ramp/parceiro, testes e hardware/key storage apropriados.

Tagline principal: “Payments that don’t stop when the network does.”
PT-BR: “Pagamentos que continuam quando a rede cai.”

## Alegações permitidas após evidência

- GATE-CORE: autorização offline e pagamentos online/offline com settlement Circle USDC de teste na Solana Devnet.
- GATE-RAILS: inclui criação/QR/confirmação de order Mercado Pago sandbox; conversão/payout ainda simulados.
- Somente relatar os saldos, limites, taxas, tempos e quantidades medidos na execução. USDC Devnet não é dinheiro real.

Não alegar: blockchain offline, double spending resolvido, Pix bancário offline, conversão/off-ramp real, compliance/KYC real, Kora integrado, conta Cora integrada, parceiros/clientes/pilotos ou rendimento/receita não comprovados.

## Discovery após a demo

Observar consumidores/lojistas testando cobrança, valor, status pendente, saldo offline e recibo. Registrar entendimento, dificuldades e entrevistas consentidas; metas e resultados comerciais a definir separadamente. Não condicionar conclusão técnica da demo à contratação de clientes, KYC de produção ou integração bancária live.
