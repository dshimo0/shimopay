# ShimoPay Mobile — roteiro e operação da demo

Quando precisar de mais tokens, abra a carteira e a seção **Solicitar fundos**. Copie o endereço, abra **Solicitar USDC** (Circle, Solana Devnet) ou **Solicitar SOL** (Solana Devnet), conclua no faucet e consulte o recebimento. **Atualizar** consulta USDC; o link da carteira no Explorer também permite conferir SOL. Os faucets têm limites; o agente não automatiza o faucet web. As contas de taxas do backend são distintas da carteira selecionada.

Status: demo integrada verificada em Devnet e Mercado Pago sandbox; gates e evidências em [SPEC.md](../SPEC.md)/progress. Plano [D01–D09](plans.md); estado real [progress](progress.md). Não apresentar telas mock como prova financeira.

## Antes da apresentação

1. Iniciar frontend Mobile e backend Solana de referência; usar gateway same-origin. Verificar URL HTTPS estável e comportamento após restart do backend. Config deve apontar Devnet, mint Circle e programa/deployment reais.
2. Executar npm run demo:preflight read-only. Confirmar fee payer SOL, ATAs, saldo real de teste e configuração FX; não usar fake balance.
3. Separar consumer/merchant em dois contexts ou aparelhos. Preparar cache confiável de sessão e quote no merchant enquanto online; não depender de IndexedDB compartilhado entre duas abas.
4. Demo compacta: ≥10 USDC totais e composição suficiente para sessão 5 + online 4.545455. Funding usa USDC Circle de teste já transferido, não mock faucet; configuração 100/50 só se efetivamente financiada.
5. Criar/confirmar sessão online e guardar signature/PDA; chave criptografada e expiração 24h ou configuração explícita. Reutilizar sessão válida somente se tiver saldo suficiente e chave correspondente; não regenerar chave por refresh.
6. Cachear quote nova 5,50 BRL/USDC para R$25 = 4.545455 USDC sem buffer. Registrar balances antes, horário e disponibilidade; carregar rotas/QR/assets para PWA.
7. Escolher PT-BR ou EN-US. Header deve mostrar Devnet/USDC de teste. API failure é estado visível, não trocar para mock.
8. Verificar GATE-CORE. Se Pix estiver BLOCKED, apresentar rail como incompleto e a conversão/payout como simulação; não anunciar GATE-RAILS concluído.

## Roteiro principal — aproximadamente 90 segundos

| Tempo | Ação e prova visual | PT-BR | EN-US |
| --- | --- | --- | --- |
| 0–12s | Home Mobile, saldo real, allowance e sessão previamente confirmada | Pagamentos normalmente falham quando a conexão cai. Este usuário já reservou uma autorização offline respaldada por escrow on-chain. | Payments normally fail when connectivity fails. This user has already reserved an offline allowance backed by an on-chain escrow. |
| 12–25s | Cortar rede dos dois aparelhos/contexts; status OFFLINE; abrir app novamente | Agora consumidor e lojista estão sem conexão. A autorização funciona no aparelho. | Both consumer and merchant are offline. Authorization runs on the device. |
| 25–45s | Merchant cobra R$25; payer revisa merchant, BRL/USDC e quote; desbloqueia sessão e paga | Nada tocou a blockchain aqui. A sessão limitada assinou um PaymentIntent localmente. | Nothing touched the blockchain here. A limited session key signed a PaymentIntent locally. |
| 45–58s | QR/payload chega ao merchant; validação local; “Autorizado offline · Pendente de liquidação” | O lojista validou a assinatura sem internet. Ainda existe risco até a liquidação. | The merchant verified the signature without internet. Acceptance carries risk until settlement. |
| 58–78s | Restaurar apenas merchant; liquidar; mostrar submitted e depois confirmed | Basta um lado recuperar conexão. O intent é reconciliado contra o escrow. | Only one side needs to recover connectivity. The intent is reconciled against the escrow. |
| 78–90s | Merchant ATA, 4.545455 USDC, Explorer Devnet; final/brand | ShimoPay separa autorização de liquidação, para que pagamentos continuem quando a rede cai. | ShimoPay separates authorization from settlement, allowing payments to continue when the network fails. |

Os tempos são orientativos: não acelerar estado de confirmação artificialmente se a cadeia demorar. Narrativa 50 USDC pode ser usada somente quando saldo/reserva corresponderem. O caminho normal não depende do botão simulate offline; testes/vídeo devem cortar rede de verdade.

## Complemento online — 20 a 30 segundos

Reconectar consumer, usar quote nova, revisar R$25 e pagar online a partir da ATA livre. Exibir tx confirmada, merchant creditado e histórico “Online · Confirmado”, distinguindo do intent offline. Replay de click/retry deve usar mesma idempotency key, sem nova transferência. Esse cenário é obrigatório para GATE-CORE, mesmo que gravado como complemento ao roteiro principal.

## Complemento adversarial — cerca de 20 segundos

Fixture atacante explícita: escrow 10, intents 8+8 produzidos em contextos isolados. Ambos podem parecer válidos offline; online A liquida e B rejeita allowance insuficiente. Exibir: “ShimoPay limita o risco offline; não elimina double spending entre sistemas desconectados.” Este cenário requer funding adicional se executado Devnet; regression local automatizada + UI pode cumprir AC-10.

## Complemento fiat — somente com provider verificado

Add R$100 → Mercado Pago sandbox cria order → QR retornado → consultar/conciliar aprovação real de teste. Mostrar ordem/status do provider. Conversion simulated in MVP. Preference merchant BRL demonstra payout SIMULADO após USDC confirmado; não alegar Pix enviado. Processing sem QR exibe indisponibilidade/pendência e mantém AC-13 BLOCKED.

Não usar QR de chave Pix bancária real, cartão live, mainnet ou fundos reais nesta apresentação. O Pix de teste é fluxo online separado; o pagamento offline é PaymentIntent ShimoPay.

## Recuperação

- Backend dormiu/parou: gateway inicia/resume e exibe readiness; preservar chave/intent, depois consultar status.
- Sem saldo/fees: parar antes de assinatura, mostrar valor disponível e financiar tokens/SOL de teste ou ajustar cobrança explicitamente.
- Senha incorreta/chave bloqueada: erro local, nenhuma assinatura/tx; desbloquear sem regenerar sessão.
- Quote venceu: reconectar para atualizar antes de autorizar; nunca reprecificar intent já aceito.
- Settlement timeout: consultar receipt/idempotency antes de reenviar; submitted não significa confirmed.
- Sessão expirada/revogada: rejeição e orientação visíveis; cancelar/reconciliar online conforme programa.
- Pix processing sem QR: registrar resposta sanitizada; continuar CORE, sem rotular RAILS pronto.

## Evidência mínima de cada execução

Data/commit/browser/ambiente; config pública/mint/program; autorização e confirmação com horários distintos; request count offline = 0 para assinatura/verificação; tx signatures/Explorer; balances ATA/escrow antes/depois; snapshots screenshots; rejeições e provider status. Sem tokens/private keys/seed/PIN.

## Comandos disponíveis e planejados

Baseline atualmente disponível:

```sh
npm ci
npm test
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm run build
npm run dev
```

`test:e2e`, `demo:preflight` e `demo:verify` estão implementados; verificações Pix/expiração também disponíveis no README. Não executar comandos financeiros com credenciais mainnet. D09 registra comandos exatos no README e provas em docs/evidence.

## Funções adicionais do app

- **Conta**: login real está preparado, porém indisponível até configurar Supabase e operadores. Senha arbitrária não produz sucesso.
- **Pagar / Receber → Ler QR com câmera**: permitir câmera traseira; leitura preenche o payload para revisão, não paga. **Importar imagem** e colar payload são alternativas. Validar em Android/iOS físico além dos testes de stream do browser.
- **Carteira → Localização → Usar minha localização**: permitir GPS, ver precisão e abrir mapa. Coordenadas ficam em memória e podem ser removidas.
- **Lojista → Receber em dinheiro**: informar o valor recebido, confirmar e baixar comprovante local; anular erro preserva o registro. Isso não altera USDC nem equivale a ledger autenticado centralizado.
- **Carteira → Cartão de crédito**: criar checkout sandbox, abrir Mercado Pago com buyer/cartão de teste, depois **Consultar cartão**. Não usar cartão ou conta de produção. Criação/retorno do checkout não aprova. Aprovação real deste fluxo ainda precisa ser verificada.

## Navegação atualizada · 3-1-0

Abra `/demo` e use **Começar jornada**. A configuração offline fica em **Mais → Configuração offline** (ou no atalho da reserva na carteira). Prepare a sessão online, depois abra o lojista e use **Receber** para cachear a sessão. Desligue a rede, autorize e compartilhe o QR. O lojista reconecta, aceita/liquida em **Mais → Pendentes** ou Histórico. Confira o comprovante e Explorer. **Reiniciar roteiro** limpa apenas o formulário visual; fundos, chave e histórico são preservados. Testes adversariais ficam em Developer Details. Pix/cartão/caixa estão em Mais.
