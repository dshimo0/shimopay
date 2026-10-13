# ShimoPay — Value Proposition

> Extraida de `SPEC.md` e `docs/business-model.md`. Produto demo: cada promessa esta classificada pelo que o codigo prova.

## Promessa central (inferida, ainda a ratificar)

Pagar e receber no comercio local em segundos, por QR, mesmo quando a internet cai — com reserva offline e experiencia de caixa simples para o pequeno lojista.

Status: proposta coerente com o codigo e a auditoria interna (`INFERRED`); wedge comercial oficial `NEEDS_DECISION`.

## Mapa valor ↔ dor (por segmento)

### Cliente local

| Dor | Alivio oferecido | Status |
| --- | --- | --- |
| Friccao no caixa (troco, maquininha, app pesado) | Pagar por QR/scanner com PIN ou biometria nativa (WebAuthn real) | UI `CONFIRMED`; leitura de camera simulada |
| Internet instavel no ponto de venda | Reserva offline com limite visual e fila de sincronizacao | Modelo de risco testado; assinatura/liquidacao `SIMULATED` |
| Falta de historico/controle | Historico, carteira e perfil com dados locais + LGPD (exportar/apagar) | `CONFIRMED` (dados demo) |

### Lojista pequeno

- Receber sem maquininha: gerar QR (matriz escaneavel real) e BR Code Pix com payload EMV/CRC16 real — `CONFIRMED`; pagamento efetivo exige chave Pix real configurada, sem webhook de confirmacao.
- Gestao simples: dashboard com vendas, relatorios, ajustes e catalogo — operacional na UI, backend mock.
- Seguranca de caixa/cashback/impressora — UI/simulacao.

### Turista / visitante

- Carregar USDC/USDT e pagar em BRL — narrativa visual do onboarding/wallet; fluxo e conversao `PARTIAL/MOCK`, demanda `NEEDS_SOURCE`.

## Ganancias criadoras / redutoras

- Reduz custo de aceitacao para quem nao tem maquininha.
- Reduz perda de venda quando o sinal falha (diferencial offline-first).
- Analogia estrategica declarada na auditoria: "fluidez de Suica + profundidade de Alipay" — referência, nao benchmark comprovado.

## O que NAO prometer (limites honestos)

- Nao ha liquidacao real, mainnet/TPS real, KYC real, biometria como validacao, cripto convertivel nem parcerias confirmadas — tudo `NEEDS_SOURCE` (`SPEC.md` Nao-Features).
- Enquadramento regulatorio (instituicao de pagamento, custodia, AML): `NEEDS_SOURCE` / `NEEDS_DECISION`.
- Linguagem publica deve evitar "pagamento real", "DID seguro" e "conversao" sem implementacao e fonte.
