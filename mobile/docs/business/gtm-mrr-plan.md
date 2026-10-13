# ShimoPay — GTM e plano de MRR (honesto)

> **ShimoPay e hoje um PROJETO DEMONSTRATIVO sem monetizacao real possivel: nenhum rail liquida de verdade** — Pix gera payload EMV pagavel mas sem confirmacao/webhook, reserva offline e SIMULACAO, KYC mock, sem backend (`CONFIRMED` no SPEC). Nao existe receita possivel nesta condicao, e este documento nao finge o contrario. Abaixo: o caminho minimo para virar produto e, a partir dai, a matematica de MRR.
>
> Criado em 2026-08-26. Fontes: `SPEC.md`, `README.md`, `docs/business-model.md`, `docs/business/*`. Classificacao: `CONFIRMED` · `INFERIDO` · `[NEEDS_SOURCE]` · `[HIPOTESE]`.

---

## Caminho minimo para virar produto (pre-requisito de todo o resto)

1. **Cortar o que nao sustenta claim:** tirar do MVP publico cripto/turista/mainnet/DID ate existir infraestrutura — decisao ja pendente no SPEC (`NEEDS_DECISION`).
2. **Escolher modelo SEM custodia:** o recurso cai direto na chave Pix do lojista; ShimoPay vende SOFTWARE de cobranca/gestao (QR dinamico, confirmacao, caixa) e nunca segura dinheiro. E o unico caminho que evita enquadramento de instituicao de pagamento no curto prazo `[HIPOTESE; NEEDS_SOURCE juridico — obrigatorio antes de vender]`.
3. **Fechar o loop tecnico minimo** (tudo apontado como pendente no proprio SPEC): persistencia real via Supabase (decisao `NEEDS_DECISION` aberta), webhook/consulta automatica de pagamento via provedor com API Pix (`provedor pendente` — `CONFIRMED` que falta), auth real minima.
4. **Piloto fechado:** 5–10 lojistas reais (Persona 1), chave Pix deles, cobranca manual de R$ 29/mes. Prazo realista: 4–8 semanas part-time `[HIPOTESE]`; custo de infra/provedor no piloto R$ 0–500/mes `[HIPOTESE]`.

Sem esses 4 passos, as secoes abaixo sao ficcao planejada — por isso estao marcadas.

---

## 1. A matematica do MRR

| Rota | Contas × ticket | Perfil | Veredito |
| --- | --- | --- | --- |
| A — SaaS para microcomercio | ~3.400 lojistas × US$ 29 (~R$ 157)… ou 14.000 × US$ 7 (R$ 39) | Ferramenta "Pix confirmado + caixa" para microlojista | Norte de produto de longo prazo; CAC porta a porta e churn de microempresa sao os dois assassinos `[NEEDS_SOURCE]`. Muito lenta sozinha |
| B — Licenciamento white-label/SDK do nucleo | 25 licencas × US$ 4k/mes (~R$ 21k) | PSPs pequenos, software houses de PDV/fintechs B2B licenciando dominio offline+EMV testado + servicos de integracao | **Mais plausivel como PONTE de receita**: e a unica rota monetizavel pelo ativo que existe HOJE (dominio puro com 24 testes, BR Code EMV/CRC16 real, WebAuthn, modelo de risco offline — tudo `CONFIRMED`) sem licença financeira |
| C — Transacional (MDR/spread cambial) | qualquer combinacao | Ganhar por transacao como adquirente/IP ou spread cripto | **Rejeitada**: exige licenca/parceria adquirente e custodia — bloqueada regulatoriamente enquanto o modelo for demo (`NEEDS_DECISION` explicito do SPEC) |

**Rota escolhida: B como ponte -> A como norte.** Justificativa pelo repo: o ativo real e engenharia (dominio testavel desacoplado de UI — decisao de arquitetura central documentada), e a rota B vende exatamente isso para quem ja tem distribuicao e licenca. A rota A depende de go-to-market de campo que o projeto ainda nao tem e de rails que ainda nao fecham. US$ 100k MRR na rota B = ~25 licenciantes — numero pequeno de contratos, mas cada um exige prova tecnica seria (auditoria externa `[NEEDS_SOURCE]`). Honestidade: US$ 100k MRR e horizonte de anos e pode nao chegar por nenhuma rota; o marco honesto intermediario e **US$ 1–2k MRR em 12 meses** `[HIPOTESE]`.

**Price point inicial recomendado** `[HIPOTESE]`: rota B — licenca inicial US$ 2k/mes + implementacao pontual; rota A — plano lojista R$ 39/mes (confirmacao + caixa), gratis para consulta simples.

---

## 2. Beachhead (quando virar produto)

**Nicho: microcomercio de UM corredor comercial/cidade satelite (lanchonetes, mercadinhos, padarias, pet shops) que JA recebe Pix por QR estatico impresso.** Primeiros 10 clientes porta a porta, manual.

- Oferta unica e estreita: "Pix confirmado na hora no seu balcao + quanto voce vendeu hoje, sem conferir banco" — nao carteira, nao superapp, nao cripto.
- Por que esse nicho primeiro: ele JÁ usa Pix (zero educacao de mercado sobre rail); a dor é operacional diária e concreta (golpe de comprovante, conferencia manual); decisao de compra e do dono, na hora, sem processo `[HIPOTESE]`; densidade geografica permite suporte presencial e indicacao boca a boca, unico canal barato para microempresa `[INFERIDO]`.
- O produto minimo para eles ja esta 80% desenhado no repo: dashboard lojista existe (`CONFIRMED`), QR EMV real existe (`CONFIRMED`); falta webhook de confirmacao e persistencia (caminho minimo acima).

---

## 3. Ondas de expansão

| Onda | Quem | O que precisa ser construido |
| --- | --- | --- |
| 0 — Virar produto | 0 clientes | Caminho mínimo (topo do doc): corte de claims cripto/turista, modelo sem custodia ratificado por juridico `[NEEDS_SOURCE]`, Supabase decidido, webhook Pix real, auth real. |
| 1 — Beachhead | 10 lojistas de um corredor | Confirmacao automatica end-to-end; fechamento de caixa diario; onboarding presencial; precificacao BRL. |
| 2 — Adjacente | Prestadores autonomos (barbeiros, personal, entregas) e segundo bairro/cidade | App instalavel/PWA decente; auto-onboarding sem visita; suporte remoto; relatorios fiscais simples `[NEEDS_DECISION]`. |
| 3 — Escala | Software houses/PSPs (rota B) + rede de revendedores locais | SDK/licenca documentado; auditoria de segurança externa `[NEEDS_SOURCE]`; SLA; miniapps SO depois de rede propria viva (hoje sao catalogo ficticio — `CONFIRMED`). |

---

## 4. Unit economics (placeholder — nada disto e dado real)

| Item | Valor | Status |
| --- | --- | --- |
| CAC — porta a porta fundador | R$ 30–80/loja (tempo + material impresso) | `[HIPOTESE]` |
| CAC — indicacao de vizinho da rua | ~R$ 0–20 (bonus de indicacao) | `[HIPOTESE]` |
| CAC — licenca B2B (outbound LinkedIn) | ~R$ 500–2.000 por contrato fechado | `[HIPOTESE]` |
| ARPA lojista | R$ 39/mes | `[HIPOTESE]` |
| Churn mensal microlojista | 3–6% (microempresa morre/muda muito) | `[HIPOTESE]` / `[NEEDS_SOURCE]` |
| Churn licenca B2B | < 1%/mes (contrato anual) | `[HIPOTESE]` / `[NEEDS_SOURCE]` |
| Margem bruta SaaS lojista | 85%+ (custo variavel baixo: webhook/API Pix por chamada) | `[HIPOTESE]`; valores de provedor `[NEEDS_SOURCE]` |
| LTV (formula) | LTV = ARPA × margem ÷ churn. Ex.: R$ 39 × 0,85 ÷ 0,04 = R$ 828 | Formula padrao; inputs `[HIPOTESE]` |
| Alerta estrutural | Com LTV ~R$ 800, CAC precisa ficar < R$ 270 — ads estao fora; so canal presencial/indicacao fecha conta | `[INFERIDO]` |

Medir no piloto para trocar hipotese por dado: golpes evitados autorrelatados/mes, tempo de fechamento de caixa, retencao mes 3, custo real de API Pix.

---

## 5. Milestones

Premissa: ~10 h/semana `[HIPOTESE]`.

### Degrau 0: virar produto (gate de tudo)
- Pre-requisitos: caminho minimo completo (modelo juridico sem custodia, Supabase, webhook Pix real).
- Metrica-guia: **1 transacao real confirmada automaticamente fim a fim** (hoje: zero rails liquidados — `CONFIRMED`).
- Prazo realista: 4–8 semanas `[HIPOTESE]`.

### Degrau 1: 0 -> US$ 1k MRR (~R$ 5,4k)
- Pre-requisitos: degrau 0 + onboarding presencial afiado + precos definidos.
- Metrica-guia: **lojistas pagantes ativos** (~140 × R$ 39, ou mix com 1 licenca B2B).
- Caminho realista: 1 licenca white-label (rota B) OU ~140 lojas (rota A) — a licenca e mais rapida se Persona 3 responder.
- Prazo realista: 6–12 meses `[HIPOTESE]`.

### Degrau 2: -> US$ 10k MRR
- Pre-requisitos: produto sem fundador no loop (auto-onboarding); 2–3 licencas OU ~700 lojas; auditoria externa do nucleo.
- Metrica-guia: retencao de lojistas mes 3 > 70% `[HIPOTESE de meta]`.
- Prazo realista: 18–24 meses `[HIPOTESE]`.

### Degrau 3: -> US$ 100k MRR
- Pre-requisitos: rota B madura (25 licencas) OU rota A em escala multi-cidade com rede de revenda — ambas exigem time e capital que nao existem hoje `[INFERIDO]`.
- Prazo realista: 4+ anos; pode nao acontecer — e o plano diz isso de proposito.

---

## 6. As 3 hipoteses falsificaveis (teste esta semana, < R$ 100)

1. **"Microlojista paga por confirmacao automatica de Pix."** Se o banco gratuito resolver a dor dele bem o suficiente, nao ha negocio.
   Teste: 10 visitas presenciais (roteiro em personas.md) + pre-venda simbolica R$ 10. Falha = <3 pre-vendas em 10 lojas com dor confirmada. Custo: ~R$ 50 de impressos/cafe.
2. **"Golpe de comprovante falso e dor frequente, nao anedota."** Se for raro, o gancho de venda principal cai e sobra "gestao de caixa" (dor mole, concorrencia gratuita).
   Teste: mesma rodada — perguntar incidencia nos ultimos 6 meses. Falha = <2 em 10 relataram caso proprio/conhecido recente.
3. **"Um player fintech/PDV licencia o nucleo testado."** Se ninguem compra engenharia, a unica rota de receita proxima morre e o projeto permanece portfolio.
   Teste: 10 mensagens LinkedIn para PMs/CTOs de software houses de automação comercial/PSPs com demo gravada de 90s. Falha = zero calls em 10 contatos. Custo: R$ 0.

---

## 7. O que NAO fazer (armadilhas especificas deste mercado)

- **Nao entrar em custodia de recursos** (carteira que segura dinheiro do usuario): transforma o projeto em instituicao de pagamento sujeita a licenciamento — inalcancavel para este tamanho de time `[NEEDS_SOURCE juridico]`. Modelo software-sobre-Pix-do-lojista sempre.
- **Nao prometer "pagamento real", "offline seguro", "mainnet" ou conversao cripto** enquanto liquidacao/assinatura criptografica forem simulacao — proibicao literal do SPEC e risco reputacional/legal direto.
- **Nao gastar 1 real em aquisicao B2C de carteira**: cold-start two-sided (clientes + lojistas) contra bancos gratuitos e carteiras incumbentes e jogo de capital, nao de indie dev `[INFERIDO]`.
- **Nao perseguir turista/cripto agora**: fluxo mock, demanda `[NEEDS_SOURCE]`, regulação pesada — cortado no caminho minimo.
- **Nao citar SPTrans/marcas do catalogo de miniapps** em material comercial: parcerias inexistentes (`NEEDS_SOURCE`); exposição publica disso e risco juridico puro.
- **Nao competir por "carteira completa"**: a vitoria possivel e ferramenta vertical de cobrança/gestao para quem o banco ignora (controle de caixa do microcomercio).
- **Nao construir mais UI antes do rail real**: a auditoria do proprio repo ja apontou superficie ampla demais diluindo o loop pagar/receber; mais tela sobre mock aumenta o custo de migracao (risco tecnico registrado no SPEC).
