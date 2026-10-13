# ShimoPay — Personas

> **Este produto e uma DEMO hoje: nenhuma persona abaixo pode pagar por pagamento real porque nenhum rail liquida de verdade** (`CONFIRMED` no SPEC: Pix sem webhook/liquidacao, offline SIMULATED, KYC mock). As personas descrevem para QUEM o produto viraria produto — servem para orientar o caminho minimo descrito em `gtm-mrr-plan.md` e para testes de dor que ja podem rodar agora.
>
> Criado em 2026-08-26. Fontes: `SPEC.md`, `README.md`, `docs/business-model.md`, `docs/business/*`. Classificacao: `CONFIRMED` · `INFERIDO` · `[NEEDS_SOURCE]` · `[HIPOTESE]`.

---

## Persona 1 — Antonio Ribeiro, 52 — Dono de lanchonete/mercado de bairro (microlojista)

| Campo | Conteudo |
| --- | --- |
| Papel | Dono-operador de comercio de bairro (lanchonete, mercadinho, padaria), 1–5 funcionarios, faturamento ate ~R$ 50k/mes `[HIPOTESE de porte]`. Persona "Lojista" e `CONFIRMED` no SPEC (`src/pages/merchant/Dashboard.tsx`); porte especifico e hipotese. |
| Contexto / dor principal | Ja recebe Pix mostrando um QR estatico impresso ou ditando a chave — mas precisa CONFERIR no celular do cliente se o dinheiro caiu (comprovante impresso/falso e golpe conhecido `[INFERIDO como dor popular; frequencia NEEDS_SOURCE]`); fecha o caixa conferindo linha por linha no app do banco; nao tem historico organizado de vendas. |
| Gatilho de compra | Levou (ou conhece quem levou) golpe de comprovante falso; passou o dia com internet instavel e perdeu venda; contador pediu controle mensal que ele nao tem. `[HIPOTESE]` |
| Objecoes | "O banco me da Pix de graca"; "nao vou pagar por aplicativo"; medo de app financeiro novo (golpe digital). Contra-ponto honesto: ele NAO pagaria por carteira — pagaria por **confirmacao automatica + controle de caixa**, se o preco for menor que o prejuizo de um golpe. Nota tecnica: QRs gerados pelo app JA sao pagaveis com chave Pix real (`CONFIRMED`: BR Code EMV/CRC16) — falta confirmacao automatica via provedor (`NEEDS_SOURCE`). |
| Onde vive online | WhatsApp e Facebook (grupos de bairro/comerciantes) `INFERIDO`; associacao comercial local (ACE) e Sebrae `INFERIDO`; fornecedores e feira da regiao (boca a boca) `[HIPOTESE]`; praticamente ausente de LinkedIn/subreddits. |
| Disposicao a pagar | `[HIPOTESE]` R$ 29–49/mes por "Pix confirmado na hora + fechamento de caixa automatico". Modelo sem custodia: dinheiro cai na chave Pix DELE — ShimoPay vende software, nao toca no recurso (ver GTM; enquadramento `[NEEDS_SOURCE juridico]`). |
| Validacao em <1 semana (custo < R$ 50) | 1) Visitar 10 comercios de um mesmo corredor comercial com 3 perguntas: "ja sofreu golpe de comprovante? como voce confirma que caiu? quanto vendeu de Pix ontem?". 2) Mostrar o dashboard lojista do app como prototipo visual. 3) Oferta de pre-venda simbolica R$ 10 (pix direto pra voce mesmo cobrar depois que existir) — quem paga R$ 10 hoje e sinal muito mais forte que elogio. Meta: 7/10 relatam dor de confirmacao; 3/10 aceitam pre-venda. |

---

## Persona 2 — Camila Rocha, 29 — Operadora/caixa de loja de rua ou quiosque com internet ruim

| Campo | Conteudo |
| --- | --- |
| Papel | Funcionaria responsavel pelo caixa de loja/quiosque em ponto com wi-fi/sinal instavel (rua comercial, feira, galeria). Persona "Cliente local" e `CONFIRMED`; esse recorte operacional e `INFERIDO` da narrativa offline do repo ("reserva offline", auditoria de repaginacao recomenda foco no gesto de pagar). |
| Contexto / dor principal | O sinal cai no meio da venda e a venda para (cliente sem dinheiro fisico vai embora); a reserva offline do ShimoPay e exatamente essa narrativa — mas hoje e SIMULACAO sem liquidacao (`CONFIRMED` no SPEC). A dor dela valida a tese; o produto ainda nao pode resolve-la de verdade. |
| Gatilho de compra | Um sabado de instabilidade que custou vendas visiveis; chefe reclama de fechamento divergente. `[HIPOTESE]` |
| Objecoes | "Se a internet cai, como fica garantido?" (pergunta correta — exige resposta tecnica real: assinatura criptografica/liquidacao diferida `NEEDS_DECISION` no SPEC); "meu gerente vai autorizar app novo?". |
| Onde vive online | WhatsApp familiar/grupal; quase zero presenca profissional online — alcance so presencial ou via dono do comercio (Persona 1 decide por ela). `INFERIDO` |
| Disposicao a pagar | Indireta: paga o empregador (Persona 1). Valor declarado: nao perder venda por conexao `[HIPOTESE]`. |
| Validacao em <1 semana (custo < R$ 30) | Incluida nas mesmas visitas da Persona 1: perguntar "quantas vendas perdeu na ultima queda de sinal?" e cronometrar quanto tempo leva para reaver cliente que saiu. Se a perda media for < 1 venda/semana, a tese offline enfraquece e o foco deve migrar para confirmacao/gestao (Persona 1 pura). |

---

## Persona 3 — Juliana Prado, 34 — PM/CTO de PSP, software house ou fintech de automação comercial

| Campo | Conteudo |
| --- | --- |
| Papel | Decisor tecnico em empresa que PRECISA de licenca/parceria para features de pagamento (PSP pequeno, software house de PDV, fintech B2B). Comprador da rota de licenciamento white-label/SDK proposta no GTM. |
| Base da persona | `INFERIDO`: e a unica rota de receita compativel com o ativo real do repo — dominio puro testado (24 testes Vitest), BR Code Pix EMV com CRC16 real e testado, WebAuthn nativo, modelo de risco offline com limites (`CONFIRMED`). Nenhuma relacao comercial desse tipo existe hoje (`NEEDS_SOURCE`). |
| Contexto / dor principal | Precisa implementar QR EMV/offline UX no roadmap trimestral e avaliar construir vs licencar referencia funcional; implementacoes de referência testadas economizam semanas. Dor `INFERIDO`; demanda real `[NEEDS_SOURCE]`. |
| Gatilho de compra | Roadmap trimestral com feature offline/Pix dinâmico; auditoria de segurança exigindo dominio testavel; pressao de prazo. `[HIPOTESE]` |
| Objecoes | "Dominio sem auditoria externa"; "prefiro construir internamente"; "licensa de demo vale pouco" — resposta honesta: o valor e o nucleo puro TESTADO + contratos, e a oferta inclui suporte de integracao. |
| Onde vive online | LinkedIn (canal principal); GitHub/open source BR (visibilidade do repositorio como vitrine) `INFERIDO`; comunidades de devs BR (Discord/Telegram de frontend/fintech) `[HIPOTESE—mapear]`; eventos fintech/pagamentos `[HIPOTESE—confirmar calendario]`. |
| Disposicao a pagar | `[HIPOTESE]` Licenca US$ 2–5k/mes + servicos de integracao, ou deal de implementacao pontual — e receita mais proxima do que este repo consegue gerar SEM virar instituicao de pagamento. |
| Validacao em <1 semana (custo R$ 0) | 1) Mapear 10 software houses/PSPs brasileiros de automação comercial. 2) LinkedIn para PMs/CTOs com o pitch de 5 linhas + link de demo gravada. 3) Pergunta única: "construir vs licenciar — onde seu time esta nesse trade-off?". Meta: 5 respostas, 2 calls. Zero interesse = rota B do GTM morre e sobra só a rota lojista lenta. |

---

## Regras de uso destas personas

- Personas 1 e 2 sao o destino de PRODUTO (se o ShimoPay virar produto); Persona 3 e a fonte de RECEITA mais rapida enquanto o rail real nao existe.
- Nada aqui autoriza promessa publica de "pagamento real", "offline seguro" ou conversao cripto — linguagem restrita pelo proprio SPEC (nao-features).
- Marcas/orgaos ficticios do catalogo de miniapps (SPTrans etc.) nao devem ser citados em nenhuma abordagem comercial (`NEEDS_SOURCE` — parcerias inexistentes).
