# Wedge

**Why this problem?** Continuidade no checkout é uma tarefa concreta; pesquisa publicada reconhece riscos de outages. Frequência e perdas do segmento escolhido continuam sem validação.

**Why now?** Infraestrutura merchant com stablecoins e delegated wallets está disponível; fontes em EVIDENCE.md. Isso reduz trabalho de integração futuro, não elimina prefunding, risco ou compliance.

**Why blockchain?** Reserva programável e regras de desembolso verificáveis por integradores independentes, sem um operador único decidir saldo final. Uma implementação com PostgreSQL também pode autorizar offline; a diferença é o modelo de confiança do settlement.

**Why ShimoPay?** OfflineSession unifica limite, dispositivo, identidade, quote e intent em um componente integrável. A combinação é uma hipótese de produto, não prova de novidade.

**Why this market first?** Um organizer distribui a preparação e limita valor/tempo do experimento. Usuário desconhecido em comércio genérico seria exposição prematura.

**Why can we win?** Se integração simples e reconciliação clara preservarem vendas a custo menor que alternativas, podemos entrar pelo POS do evento. Hoje incumbents têm distribuição e risk operations muito superiores.

## Divisão objetiva

| On-chain obrigatório no MVP | Off-chain recomendado |
| --- | --- |
| Deposit, reserva, owner/sessionSigner, token, limite, validade | Identidade legível, aliases, invoices, fiat display |
| Nonce/sequence consumption, spentAmount, transfer | Criptografia da session key, cached snapshots e quote |
| Cancelamento e liberação | Assinatura local, QR/payload e merchant checks |
| Eventos e receipt de settlement | Risk warnings, métricas e futura decisão comercial |

## Novelty test

O que pode ser novo é o produto integrável que combina identidade portátil, política de sessão e escrow público para aceitação offline com reconciliação posterior; **offline signing, QR, prefunding e delegated keys já existem**.

Gap provisório: **PARTIAL / unverified combination**. Fedi demonstra transferência offline com pending; cartões suportam store-and-forward; Gnosis conecta self-custody e cartões. Ausência de match na pesquisa não prova novidade ou liberdade de operação.

Se Copilot/Grid/site/repo mostrar equivalente, mudar a tese para integração e risco operacional em eventos, sem acrescentar feature só para parecer original.
