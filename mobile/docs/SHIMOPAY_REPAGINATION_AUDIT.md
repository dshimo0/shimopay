# ShimoPay Repagination Audit

Data: 2026-05-11

## Diagnostico curto

O ShimoPay ja tem as pecas certas para virar um superapp de pagamentos do dia a dia: home de cliente, QR, scanner, wallet, modo offline, marketplace de miniapps, dashboard lojista e simulacao de DID. O problema atual nao e falta de ideias. E excesso de superficie antes do loop principal estar impecavel.

O repositorio hoje parece um alpha de visao: muita coisa boa para vender a tese, pouca coisa ainda consolidada como produto sem atrito.

Direcao recomendada:

> ShimoPay = fluidez de Suica + profundidade de Alipay, mas com foco inicial em pagamento local/offline e lojista pequeno.

## Inventario atual

Arquivos centrais:

- `src/pages/customer/Home.tsx`: home mobile com saldo, acoes rapidas, modo rua, miniapps e historico.
- `src/pages/customer/Scanner.tsx`: fluxo de pagar por QR e simulacao NFC.
- `src/pages/customer/QR.tsx`: QR de pagar/receber, token rotativo e status DID/BLE.
- `src/pages/customer/Offline.tsx`: placeholder de modo offline.
- `src/components/DIDHandshake.tsx`: simulacao visual de handshake DID/offline.
- `src/pages/customer/Wallet.tsx`: carteira multiativo, cartoes e conversao automatica.
- `src/pages/customer/Stores.tsx`: marketplace de miniapps/parceiros.
- `src/pages/merchant/Dashboard.tsx`: dashboard lojista com QR, offline, relatorios, mini-programa, CRM e ajustes.
- `src/pages/Network.tsx`: explorador fake da Shimo Chain.
- `src/pages/Onboarding.tsx`: onboarding com carteira, telefone e KYC simulado.

Validacao tecnica feita:

- `vite build`: passa.
- `tsc -b`: corrigido e passa.
- `eslint .`: corrigido para 0 erros. Restam avisos de hooks/Fast Refresh.

## O que manter

### 1. Pagar em 2 segundos

Manter e priorizar:

- Scanner QR.
- Aproximar/NFC como modo visual de pagamento.
- Confirmacao por PIN/biometria.
- Recibo simples.
- Historico imediatamente atualizado.

Esse e o coracao Suica. Se isso nao for absurdamente rapido, o resto vira enfeite.

### 2. Receber dinheiro como lojista

Manter como segundo pilar:

- Gerar QR de cobranca.
- Receber offline.
- Ver vendas recentes.
- Relatorio basico.
- Separacao simples de dinheiro do negocio e retirada.

O lojista e o lado que cria aceitacao. Sem ele, o consumidor nao forma habito.

### 3. Offline-first com DID

Manter, mas transformar de "efeito hacker bonito" em produto real.

O DID deve ser infraestrutura, nao headline principal. Para o usuario, o texto deveria ser algo como:

- "Paga mesmo sem sinal"
- "Sincroniza quando voltar a internet"
- "Limite protegido para modo offline"

Internamente, usar DID para identificar:

- Conta do usuario: `did:shimo:user`
- Dispositivo autorizado: `did:shimo:device`
- Lojista/terminal: `did:shimo:merchant`

### 4. Modo Rua

Manter. E uma ideia muito boa para Brasil.

Deve virar um bloco de seguranca central:

- Limite reduzido fora de casa.
- Exigir biometria para valores maiores.
- Bloquear troca de aparelho/metodo sensivel.
- Mostrar claramente "Modo Rua ativo".

### 5. Miniapps, mas curados

Manter miniapps, mas reduzir para casos que reforcam pagamento frequente:

- Transporte urbano.
- Recarga/transporte publico.
- Pedido local simples.
- Rachar conta.
- Lojinha de pequeno vendedor/revendedora.
- Metas/cofrinhos se conectar com wallet.

Miniapp no MVP deve existir para aumentar frequencia de pagamento, nao para parecer marketplace infinito.

## O que pausar ou tirar

### Tirar da primeira tela

- Landing page marketing como porta principal depois do onboarding.
- "Saiba mais" e CTA de site dentro de uma experiencia que deveria abrir no app.
- Muitos blocos explicativos.

Depois que o usuario entrou, a primeira tela precisa ser operacional.

### Pausar

- Shimo Chain Explorer.
- Mainnet live, TPS, nodes, gas e block hash.
- Bitcoin/BTC como metodo de pagamento cotidiano.
- Wallet multiativo grande demais.
- Governo, games, streaming, investimentos e grandes marcas no marketplace.
- Programa de desenvolvedores.

Essas ideias podem voltar, mas hoje diluem a narrativa.

### Remover ou esconder do MVP

- "Crypto (USDT)" no recibo aleatorio do lojista.
- "Shimo Chain Network" em todo comprovante.
- Conversao automatica global como promessa principal.
- Rankings, ratings e milhoes de usuarios ficticios no marketplace.

O app fica mais confiavel quando promete menos e entrega mais.

## Arquitetura recomendada para pagamento offline

### Produto

O usuario deve entender assim:

1. Ativo uma reserva offline.
2. Posso pagar ate um limite baixo sem internet.
3. O lojista recebe uma prova assinada.
4. Quando qualquer lado voltar para internet, o pagamento sincroniza.

### Fluxo tecnico MVP

1. Quando online, o app baixa uma `offline_allowance`.
2. Essa reserva tem limite, validade, device DID e contador.
3. No pagamento offline, o pagador assina um voucher com:
   - valor
   - moeda
   - merchant DID
   - device DID
   - nonce
   - contador
   - expiracao
4. O lojista valida assinatura localmente.
5. O lojista guarda o voucher como "pendente".
6. Ao sincronizar, o backend liquida ou rejeita.
7. Se houver conflito, o risco fica limitado ao allowance.

### Transporte

Ordem recomendada:

1. QR dinamico como base universal.
2. NFC/tap para experiencia premium.
3. BLE apenas para handshake entre dispositivos quando fizer sentido.

QR primeiro porque funciona em qualquer celular/camera e e mais facil de demonstrar.

### Regras de risco

MVP offline deve ter limites duros:

- Limite por transacao.
- Limite diario offline.
- Validade curta dos vouchers.
- Um dispositivo principal por conta.
- PIN/biometria para ativar reserva offline.
- Bloqueio de offline em conta nova ou suspeita.
- Merchant com limite de aceitacao pendente.

Offline sem limite vira risco financeiro. Offline com limite vira vantagem de UX.

## Nova hierarquia do produto

### Home

Prioridade visual:

1. Pagar
2. Receber
3. Saldo
4. Offline status
5. Ultimas atividades
6. Servicos frequentes

Hoje o app tem saldo, gamificacao, carteira, modo rua, notificacao, miniapps e historico competindo. A repaginada deve fazer o usuario pensar: "abri, paguei, acabou".

### Bottom nav recomendado

- Inicio
- Pagar
- Receber
- Servicos
- Perfil

Para lojista:

- Hoje
- Cobrar
- Vendas
- Clientes
- Ajustes

### Texto e posicionamento

Evitar:

- "blockchain"
- "mainnet"
- "zero-knowledge"
- "DID secure"
- "gas"
- "criptoativos"

Usar:

- "sem sinal"
- "seguro no aparelho"
- "limite offline"
- "sincronizado"
- "comprovante protegido"
- "modo rua"

## Roadmap enxuto

### Fase 1: pagar e receber sem friccao

Objetivo: app parecer confiavel em 30 segundos.

- Refazer home operacional.
- Unificar scanner, QR e offline em um fluxo de pagar/receber.
- Finalizar tela Offline.
- Criar modelo local de transacoes pendentes.
- Mostrar sync status.
- Arrumar copy para linguagem de usuario normal.

### Fase 2: lojista pequeno

Objetivo: criar aceitacao.

- Dashboard simplificado.
- Cobrar por QR/offline.
- Historico de vendas.
- Relatorio diario.
- Lojinha simples.
- Impressora/recibo como opcional futuro.

### Fase 3: miniapps de alta frequencia

Objetivo: aumentar uso diario.

- Rachar conta.
- Recarga transporte.
- Bike/transporte.
- Pedido local.
- Metas/cofrinhos.

### Fase 4: financeiro avancado

Objetivo: monetizacao, so depois do habito.

- Credito pequeno para lojista.
- Seguro simples.
- Cashback/fidelidade.
- Stablecoin/remessa se houver estrategia regulatoria.

## Decisao de produto

Se o dinheiro de desenvolvimento estiver curto, nao tentar construir o Alipay inteiro.

Construir primeiro o gesto:

> "Abro o ShimoPay, pago mesmo sem sinal, o lojista confia, e eu vou embora."

Depois vem o superapp.
