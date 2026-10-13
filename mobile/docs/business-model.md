# ShimoPay Business Model

Este documento separa fatos do repo de hipoteses comerciais. Como pagamentos, KYC, cripto, conversao cambial e dados financeiros sao areas sensiveis, qualquer claim externa deve ser tratada como `NEEDS_SOURCE` ate haver documento de produto, juridico, regulatorio ou comercial.

## Resumo

`CONFIRMED` O repo apresenta ShimoPay como app de pagamentos mobile no Brasil com cliente, lojista, QR, reserva offline, miniapps e dashboard de comerciante. Fontes: `README.md`, `src/pages/Landing.tsx`, `src/pages/customer/*`, `src/pages/merchant/Dashboard.tsx`.

`INFERRED` A proposta de valor mais coerente com o codigo e com a auditoria atual e "pagar e receber rapido, inclusive quando o sinal falha, com aceitacao por pequeno lojista". Fontes: `docs/SHIMOPAY_REPAGINATION_AUDIT.md`, `src/pages/customer/Home.tsx`, `src/pages/merchant/Dashboard.tsx`.

`NEEDS_DECISION` O modelo de negocio oficial ainda nao esta declarado.

## Cliente, Usuario E Comprador

| Papel | Classificacao | Hipotese/descricao | Fonte ou pendencia |
| --- | --- | --- | --- |
| Usuario cliente | `CONFIRMED` | Pessoa que usa carteira, QR, scanner, servicos, historico e perfil. | `src/pages/customer/*` |
| Usuario lojista | `CONFIRMED` | Comercio/operador que gera QR, recebe offline e acompanha vendas. | `src/pages/merchant/Dashboard.tsx` |
| Cliente pagante B2B | `INFERRED` | Pequeno comercio pode ser comprador se o produto monetizar aceitacao, relatorios ou servicos. | Inferido de dashboard e auditoria; precisa validacao. |
| Cliente pagante B2C | `INFERRED` | Consumidor pode ser usuario principal, mas cobrar do consumidor nao esta definido. | `NEEDS_DECISION` |
| Turista/visitante | `PARTIAL/MOCK` | Fluxo de USDC/USDT para BRL aparece como experiencia, nao oferta validada. | `src/pages/Onboarding.tsx`, `src/pages/customer/Wallet.tsx`; `NEEDS_SOURCE` |
| Parceiro/miniapp | `PARTIAL/MOCK` | Catalogo sugere monetizacao via parceiros, mas relacoes reais nao existem no repo. | `src/pages/customer/Stores.tsx`; `NEEDS_SOURCE` |

## Proposta De Valor

- `CONFIRMED` Cliente consegue demonstrar pagar, receber, transferir, consultar atividade e abrir servicos em UI mobile. Fonte: `src/pages/customer/Home.tsx`.
- `CONFIRMED` Lojista consegue demonstrar recebimento, QR, vendas recentes, relatorios e configuracoes. Fonte: `src/pages/merchant/Dashboard.tsx`.
- `PARTIAL/MOCK` Reserva offline e DID sao narrativa/experiencia visual, nao infraestrutura comprovada. Fontes: `src/pages/customer/Offline.tsx`, `src/components/DIDHandshake.tsx`.
- `INFERRED` Valor diferencial provavel: reduzir friccao de pagamento local e criar fallback visual quando internet falha.
- `NEEDS_SOURCE` Promessas de confiabilidade financeira, liquidacao, compliance, taxas, disponibilidade ou seguranca criptografica.

## Canais

- `CONFIRMED` Canal demonstravel atual e app web local/preview Vite. Fonte: `package.json`, `vite.config.ts`.
- `NEEDS_DECISION` Canal comercial: venda direta para pequenos lojistas, parcerias com adquirentes, distribuidores, turismo, app stores ou white-label.
- `NEEDS_SOURCE` Qualquer canal com governo, SPTrans, marcas, restaurantes, mobilidade ou bancos.

## Pricing

Nao ha fonte de pricing no repo.

Hipoteses que exigem decisao:

- `NEEDS_DECISION` MDR/taxa por transacao para lojistas.
- `NEEDS_DECISION` Assinatura mensal para dashboard/relatorios/CRM.
- `NEEDS_DECISION` Receita por miniapps/parceiros.
- `NEEDS_DECISION` Spread/cambio para visitante.
- `NEEDS_DECISION` Freemium para cliente e cobranca B2B.

Nenhuma dessas hipoteses deve ser apresentada como fato ate haver fonte.

## Concorrentes E Alternativas

- `NEEDS_SOURCE` Concorrentes diretos e benchmarks precisam de pesquisa externa.
- `INFERRED` Categorias provaveis para comparar: carteiras digitais, Pix apps, adquirentes/maquininhas, superapps, apps de transporte/recarga, carteiras cripto e solucoes offline/closed-loop.
- `CONFIRMED` A auditoria interna cita direcao "fluidez de Suica + profundidade de Alipay" como analogia estrategica, nao como benchmark comprovado. Fonte: `docs/SHIMOPAY_REPAGINATION_AUDIT.md`.

## Riscos Comerciais

- `NEEDS_SOURCE` Mercado, TAM, demanda por offline-first e comportamento de lojistas.
- `NEEDS_SOURCE` Custo de aquisicao de cliente/lojista.
- `NEEDS_SOURCE` Relacao real com redes de aceitacao, Pix, bancos, adquirentes, bandeiras, stablecoins ou provedores KYC.
- `NEEDS_DECISION` Foco comercial inicial para evitar dispersao entre pagamento, cripto, miniapps, turismo e dashboard.

## Riscos Legais E Regulatorios

- `NEEDS_SOURCE` Enquadramento regulatorio no Brasil.
- `NEEDS_SOURCE` Responsabilidades sobre KYC, AML, custody, conversao cripto/fiat, chargeback, protecao de dados e incidentes.
- `NEEDS_DECISION` Linguagem publica deve evitar prometer "pagamento real", "mainnet", "DID seguro", "biometria" ou "conversao" sem implementacao e fonte.

## Hipoteses A Validar

1. `INFERRED` Pequenos lojistas valorizam receber por QR/offline mais do que um superapp amplo.
2. `INFERRED` Consumidores entenderao "reserva offline" melhor do que "DID/blockchain".
3. `NEEDS_SOURCE` Turistas precisam carregar USDC/USDT para pagar em BRL no caixa.
4. `NEEDS_SOURCE` Miniapps aumentam frequencia de uso antes de haver rede de aceitacao.
5. `NEEDS_DECISION` O MVP deve cortar ou esconder claims de blockchain ate a infraestrutura existir.
