# Comprovantes e acompanhamento on-chain

UX-08 / AC-08 · publicado e verificado.

## Experiência

Histórico on-chain e movimentos recentes abrem comprovante nativo em vez de mandar diretamente para o Explorer. O recibo mostra transferências identificadas, remetente/destinatário (proprietário da conta token quando informado pela rede), asset/valor, data do bloco, taxa SOL e tracker Enviada → Confirmada → Finalizada. Falha tem estado próprio e não representa fundos recebidos. Pagamentos locais com assinatura também oferecem “Acompanhar na rede”.

Consulta sob demanda em `GET /api/transaction?signature=...`; endpoint read-only, RPC Devnet padrão ou SOLANA_RPC_URL server-side, genesis Devnet obrigatório. São lidas instruções externas e CPI SPL/system e metadata, sem inferir transferência a partir de mudança de saldo. USDC só para o mint oficial Circle Devnet. Sem conversão retroativa em BRL. Operações não reconhecidas continuam acessíveis no Explorer, com detalhes indisponíveis explicitamente indicados.

Atualizar status faz nova consulta; não há avanço por timer. Cache público em IndexedDB permite reabrir o comprovante offline, com horário da última consulta. Não gerar chamadas RPC offline. Download PDF usa impressão do navegador (Salvar como PDF); JSON fica em detalhes da rede. Compartilhar usa share sheet do dispositivo ou copia o link público da Solana.

## Aceite

- Valor decimal exato, inclusive taxa micro SOL e tokens com decimais diferentes; sem cálculo float.
- Meta err nunca apresentada como transferência concluída. Null/pruned/RPC failure não fabrica campos nem confirma pagamento.
- Histórico → modal → atualizar finality → cache offline; Explorer secundário; modal e impressão legíveis em mobile.
- Nenhuma transação assinada/enviada; nenhuma alteração de saldo/policy/escrow.

## Evidências iniciais

62 testes unitários (7 novos parser/segurança/precisão). 6 E2E passaram, incluindo tracker confirmed→finalized, valores/taxa/owners, cache offline sem novas chamadas, e regressões offline/câmera/dinheiro. Teste adicional de impressão usa PDF Chromium. Build/typecheck passaram; lint 0 erros/8 avisos existentes.

Consulta real read-only à transação `3H5KGjwctHH4bcU2ePEo8g8RZYRbo9AMUM1pDNxcSoeFNdr2Hv5QW2MneG3j5Q1HHJKfYfmHMGYCAtxMJ4LwB47p`: finalized, 4.545455 Circle USDC, taxa 10000 lamports (0.00001 SOL), reserve→merchant. Não é novo pagamento.

Limites: RPC público sujeito a latência/rate limit; instruções sem parsing SPL/system não viram transferências inventadas. Finality só é atualizada ao consultar. Horário de cada estágio não é fabricado; a data exibida é blockTime. Captura `chain-receipt-finalized.png` usa fixture E2E; evidência pública posterior é separada.

## Publicação verificada

Runtime `92f70f9`, deploy `dpl_GxPvZXxS7ko72C7sKvYk3hHYgrPF` READY. [Receipt público real](evidence/chain-receipt-public.json) e [captura](evidence/chain-receipt-public.png): 20 USDC recebidos de H3sjy…cV79w para BXZsy…T5io4, status finalized, taxa 12209 lamports (0.000012209 SOL). Endpoint 200, sem erros JS ou overflow. É a transação histórica exibida na referência do usuário, consultada sem movimentação nova.
