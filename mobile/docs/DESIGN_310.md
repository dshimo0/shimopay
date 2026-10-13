# Experiência ShimoPay · revisão 3-1-0

Estado: VERIFIED UX · publicado e verificado em https://shimopay-mobile.vercel.app. Fonte: revisão enviada pelo usuário e capturas atuais em `evidence/design/before-*.png`.

## Direção de negócio

Uma pessoa deve entender quanto tem, como pagar e o que aconteceu, sem aprender infraestrutura. O modelo 3-1-0 da Ant é uma inspiração para reduzir espera, preenchimento e intervenção; não é promessa de aprovação em um segundo, KYC automático ou benchmark já medido no ShimoPay.

## Auditoria capturada

1. Landing: 4520 px em 390 px; repete a mesma proposta em várias seções, destaca miniapps cedo e mistura identidade verde com marca azul. Reduzir para até 2800 px.
2. Carteira: 2836 px; ação de pagar abaixo de gráfico vazio, cartão, localização e faucet. Saldo ainda carregando na captura: não foi aceito como prova financeira. Pagar e saldo devem aparecer antes da primeira rolagem em 390×844.
3. Demo: 3324 px; caixa de instruções/adversarial sobre a mesma home longa. Substituir por percurso curto dependente do estado real; falha externa nunca vira sucesso.
4. Conta: configuração ausente, login indisponível. Não criar autenticação decorativa; acesso à carteira de desenvolvimento deve ser explícito e o bloqueio operacional permanece.

## Aceite UX-01–UX-07

- UX-01: azul cobalto/ink/marfim; logotipo existente preservado, espaçamento e escala consistentes. Damasco para offline/pendências, com texto escuro de contraste adequado.
- UX-02: home com saldo USDC/equivalente BRL marcado ≈, pagar, reserva offline e três últimos movimentos. Cartão/Pix/localização/faucets continuam acessíveis em Mais/Adicionar.
- UX-03: navegação consumidor Início/Pagar/Atividade/Mais com ícones e área mínima 44 px. Offline é estado global; ajustes acessíveis por reserva/Mais.
- UX-04: primeira visita orientada por três ações sem modal obrigatório; não solicitar câmera/GPS antes da intenção do usuário.
- UX-05: demo com etapas guiadas e critérios reais. Reiniciar roteiro não apaga chave, saldo, pendências ou histórico; nenhum pagamento automático.
- UX-06: comprovante com timeline apenas de eventos registrados, sem inventar hora de reconexão/validação. Explorer direto. Dados de BRL são equivalência, não depósito fiat.
- UX-07: landing ≤2800 px em 390 px, app sem overflow 390/1440, teclado/foco e reduced-motion; testes unit, E2E offline/QR, lint/typecheck/build. Supabase/hardware e aprovação cartão continuam pendentes.

## Limites

Não expandir rails, miniapps ou custódia. Identificação Devnet fica discreta mas visível. Prova visual histórica é rotulada e vinculada a uma transação existente. Rotas financeiras de preview devem redirecionar ao fluxo real, removendo acesso a handshake por timers. Sem séries/saldos fictícios para preencher tela. Serviços fora do ar mostram erro/retry e preservam dados locais.

## Resultado observado

- Landing: 4520 → 2413 px em 390 px (redução de 46,6%). Hero visual, três movimentos, prova Devnet, consumidores/negócios, miniapps secundários e CTA.
- Carteira: botão principal no primeiro viewport; equivalente marcado ≈; sem formulário de cartão/Pix, GPS ou faucets disputando a home. Mais/Adicionar abre os recursos existentes. Gráfico passa para Histórico.
- Marca: símbolo original preservado; wordmark/escala/contraste/nav unificados em cobalto, ink e marfim. Sem novo asset gerado por IA.
- Demo: etapas derivadas de sessão/intent/confirmação; reinício visual preserva snapshot e não envia transações. Não reduz precondições financeiras a um timer de 90 segundos.
- Comprovante: autorização e confirmação registradas; sem inventar timestamps de rede. Preview financeiro antigo redireciona aos fluxos reais; miniapps preservados.
- Conta: sem formulário inoperante quando Supabase não está configurado; acesso de desenvolvimento explícito.

Evidências: `evidence/design/verified-landing.png`, `verified-wallet.png`, `verified-desktop.png`. A captura de carteira validada usa fixture E2E; não é nova prova de saldo Devnet. Capturas `before` vieram do site público no início da revisão, com saldo ainda carregando; capturas `after` são do build local.

Checks: 55 testes unitários; 5 E2E (regressão offline, câmera/GPS/cash e 2 jornadas de design); lint sem erros/8 warnings legados; typecheck e build passaram. Altura/overflow/botão acima da dobra verificados automaticamente. Capturas não certificam acessibilidade completa; hardware real continua pendente. APP-01 e aprovação de cartão permanecem abertos.

## Publicação

Commit runtime `d5134f8`, deploy `dpl_FQ8KH1S46gMzNV5CsxBPYZLFWtX8` READY. [Verificação pública](evidence/design/public-verification.json): sete rotas HTTP 200, sem overflow mobile/desktop e sem erros JavaScript observados. Fotos `public-*` representam o deploy atual; algumas consultas financeiras ainda carregavam no instante da captura. Não são prova de novo settlement.

Consulta pública após carregamento: `/deployment.json` 200/Devnet e `state` 200; saldo total 36.814541 USDC, livre 27.625452 USDC. [Snapshot visual do saldo real](evidence/design/public-balance.json), equivalente ≈ R$202,48 naquele instante. Nenhuma transferência nova; não confundir o valor fixture de R$92,48 com este snapshot.
