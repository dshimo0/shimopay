# Problem proof & customer validation

## Evidência atual

| Hipótese | Evidência | Classe | Estado |
| --- | --- | --- | --- |
| Outages podem quebrar payments | E01 e E02 | C / B | Suportada qualitativamente |
| Evento escolhido perde vendas suficientes | Nenhuma entrevista/telemetria | F | Não validada |
| Users aceitam prefunding | Nenhuma pesquisa | F | Não validada |
| Merchant aceita perda/settlement posterior | Nenhum consentimento | F | Não validada |
| Organizer paga pela infraestrutura | Nenhum contrato/LOI | F | Não validada |
| DID portátil melhora negócio | Interoperabilidade técnica apenas | F comercial | Validar integração, não KYC |

A — entrevista/usuário; B — indústria/comercial; C — pesquisa confiável; D — relato informal; F — hipótese. Problema geral pode usar C/B; tese comercial não pode depender só de F.

## Plano de pesquisa sem indução

Primeiro coletar experiências reais, depois mostrar a solução. Alvo: dez vendedores do beachhead e dois organizers/PSPs. Não foram contatados por este agente; autorização para outreach ainda não existe.

1. Quando sua conexão cai, o que acontece com pagamentos?
2. Conte a última vez; com que frequência acontece?
3. Como estimou o custo? Há registro?
4. Qual fallback usa e o que ele resolve?
5. Depois de explicar pending settlement: em quais condições aceitaria?
6. Quem deveria absorver a perda quando não liquida?
7. Quanto tempo de espera seria aceitável?
8. Pagaria por isso? O que deixaria de usar para financiar?
9. Fee fixa ou percentual? Por quê?
10. O que impediria a adoção?

Registrar: ID anônimo, persona, data com consentimento, contexto, pain, frequency, quote summary, alternativa, condições de risk, signal strength e evidência disponível. Não inventar citações nem registrar PII desnecessária.

## Validation score

Rubrica: dor recente documentada 0–2; custo quantificável 0–2; alternativa insuficiente 0–2; risk acceptance explícito 0–2; compromisso pago/piloto 0–2. Total por entrevistado 0–10; reportar mediana, n e distribuição. Sem entrevistas = **não mensurável**, nunca score positivo.

TARGET experimental: pelo menos 6/10 merchants com dor recente, 3/10 com condições explícitas aceitáveis e um organizer disposto a piloto. Estes thresholds são decisões de experimento, não facts. Não representam PMF.

## Kill / pivot criteria

Dor resolvida por alternativa mais barata e aceita → KILL wedge. Prefunding inviável → DEFER consumer launch; testar integração via PSP. Risco inaceitável sem garantia → pausar live rollout até underwriting ou modelo diferente. Nenhum buyer paga → não disfarçar ausência de business com volume de testes.
