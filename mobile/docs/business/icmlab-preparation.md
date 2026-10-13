# ShimoPay — preparação para o ICM Lab

Atualizado em 14/09/2026. Rascunho para revisão dos fundadores, não submetido.

## Posicionamento

ShimoPay é uma experiência mobile de carteira e miniapps para o comércio brasileiro. A hipótese inicial é facilitar pagamentos de visitantes que já usam stablecoins, com recebimento em reais para o estabelecimento. Pagamentos são a porta de entrada; os miniapps preservam a visão de superapp e serão avaliados por uso recorrente, não pelo tamanho do catálogo.

Turismo é um recorte de validação, não uma decisão irreversível de mercado. Não há clientes, acesso a pilotos ou demanda comprovada informados pelos fundadores. Não se deve declarar parceria com Solana, Darwin ou marcas dos miniapps.

## Texto-base para candidatura

**Problema a investigar.** Estabelecimentos que atendem visitantes podem enfrentar fricção para receber pagamentos de clientes que já mantêm stablecoins. Precisamos verificar frequência, alternativas existentes, custos, perdas e esforço de conciliação com esses estabelecimentos.

**Solução proposta.** Uma experiência que mostra cotação e custos ao cliente e permite ao lojista acompanhar o recebimento em reais, conectando no futuro um trilho em Solana a parceiros de conversão e pagamento. Uma camada de miniapps reúne serviços do cotidiano na mesma experiência.

**Estágio.** Alpha web demonstrativo em React/TypeScript. Carteira, QR, histórico, painel de lojista, miniapps e modelo local de pagamentos. Saldos, conversão, KYC, pagamentos e reserva offline são simulados. Gerar um BR Code não comprova confirmação ou liquidação. Não há backend de pagamentos ou integração Solana ativa demonstrados.

**Por que ICM Lab.** A tese de pagamentos e stablecoins é compatível com a hipótese. Buscamos apoio para validar o comprador, delimitar uma PoC em Solana e identificar parceiros para conversão, recebimento em reais e responsabilidades operacionais. Conhecimento financeiro do time precisa ser descrito com experiência verificável.

**Modelo de receita.** Hipótese: cobrar do estabelecimento ou parceiro pelo serviço de aceitação/conciliação; formato e preço serão testados. Não há receita ou unit economics comprovados. Miniapps não devem ser apresentados como fonte de receita existente.

**Pedido ao programa.** Mentoria técnica e operacional, introduções para descoberta de clientes e desenho de uma PoC com métricas verificáveis. Não presumir investimento, parceiro ou piloto garantido.

Fonte consultada: https://www.darwinstartups.com/icmlab (14/09/2026). A página anuncia inscrições de 14/09 a 11/10/2026. Regulamento não pôde ser acessado nesta análise; elegibilidade, obrigações e condições precisam de conferência antes da submissão.

## Roteiro de demonstração — 3 minutos

1. **0:00–0:30 / LP:** explicar hipótese de comprador, visão de superapp e rótulo alpha.
2. **0:30–1:10 / Explorar demo → Cliente demo:** mostrar carteira, pagar/receber e histórico; esclarecer que o saldo é local. Não executar transferências reais nem escanear QR com banco.
3. **1:10–1:40 / Serviços:** abrir um miniapp e mostrar continuidade da experiência. Marcas são referências, não parceiros; nada é solicitado fora do ambiente.
4. **1:40–2:20 / Acesso demo → Lojista demo:** mostrar cobrança e acompanhamento de transações de exemplo. Não chamar registro local de liquidação.
5. **2:20–3:00 / Próximo marco:** explicar PoC proposta, validação de clientes e lacunas. Offline é pesquisa de continuidade, não pagamento garantido sem conexão.

## Descoberta e decisão de foco

- Até 20/09: listar 20 estabelecimentos de turismo e identificar o responsável por pagamentos. O agente não deve contatá-los sem autorização de envio.
- Até 27/09: realizar 8–12 entrevistas. Perguntar pelo último problema real de pagamento de visitante; frequência, alternativa, custo total, prazo de recebimento e reconciliação. Investigar quantos clientes efetivamente usam stablecoins.
- Critério para avançar: pelo menos dois estabelecimentos interessados em definir piloto, com problema recorrente documentado e um fluxo viável a investigar com parceiro. Interesse não equivale a contrato.
- Se não houver demanda: não forçar turismo ou stablecoins por causa da aceleração. Reavaliar segmento com evidência; conservar o código e a visão de miniapps.
- Até 04/10: consolidar entrevistas e revisar narrativa, time e roteiro. Até 09/10: concluir conferência do regulamento e revisão da inscrição, deixando margem antes do prazo publicado.

## PoC proposta, não implementada

Começar com ambiente de testes e um único ativo (USDC em Solana, sujeito à viabilidade técnica e operacional), um fluxo de cobrança e uma referência de conciliação. Demonstrar estados separados: cotação, pagamento aguardado, confirmação on-chain e recebimento em reais. Na devnet, qualquer etapa em reais será simulada e explicitamente rotulada.

Antes de qualquer piloto monetário: definir parceiro, responsabilidades, autenticação de servidor, gestão de segredos, confirmação por webhook, idempotência, reconciliação e tratamento de expiração/falha. Testar confirmação duplicada, valor divergente, cotação vencida e indisponibilidade do parceiro. Não liberar produto financeiro apenas com a demo atual.

Comparar custo total, tempo até recebimento, taxa de conclusão e esforço de conciliação com a alternativa real do estabelecimento. Registrar rede, tamanho da amostra, condições e falhas; não extrapolar desempenho de devnet para produção.

## Pendências dos fundadores antes de enviar

- Nome, função, dedicação e experiência financeira/técnica verificável de cada fundador.
- Empresa, localização, contatos e condições de elegibilidade conforme regulamento.
- Evidência das entrevistas e autorização para citar participantes.
- Canal comercial público real para interessados; não inventar e-mail nem publicar formulário que não entrega mensagens.
- Revisar respostas e condições do programa. Nenhuma inscrição foi enviada.
