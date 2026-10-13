# ShimoPay Operations

Este documento registra o que e operavel hoje e o que precisa ser decidido antes de producao.

## Ambientes

| Ambiente | Status | Evidencia | Observacao |
| --- | --- | --- | --- |
| Local dev | `CONFIRMED` | `npm run dev`, `vite.config.ts` | Vite na porta 8080. |
| Preview Vite | `CONFIRMED` | `npm run preview`, `npm run start` | `start` usa preview em 8080 com host. |
| DigitalOcean preview/host | `CONFIGURABLE` | `vite.config.ts` | `preview.allowedHosts` inclui `shimopay-crudv1-jgfbe.ondigitalocean.app`. |
| Supabase project | `CONFIGURABLE/PARTIAL` | `.env`, `supabase/config.toml` | Client configurado, sem tabelas/uso funcional confirmado. |
| Producao | `UNKNOWN` | Sem CI/deploy manifest | Precisa de decisao. |

## Variaveis De Ambiente

Nomes confirmados, sem expor valores:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

Fonte: `.env`, `src/integrations/supabase/client.ts`.

## Deploy

- `CONFIRMED` Build local por `vite build`.
- `CONFIRMED` Preview local por `vite preview`.
- `UNKNOWN` Processo de deploy real, CI/CD, rollback e ambientes de staging/producao.
- `UNKNOWN` Docker, compose ou infraestrutura como codigo nao encontrados.

## Monitoramento

- `UNKNOWN` Nao ha monitoramento, logging centralizado, tracing, analytics operacional ou alertas no repo.
- `NEEDS_DECISION` Definir monitoramento para disponibilidade, erros frontend, conversao de funil, pagamentos e incidentes.
- `NEEDS_SOURCE` Qualquer SLO/SLA, disponibilidade ou performance operacional.

## Backups E Dados

- `CONFIRMED` Estado atual principal e local/mocado.
- `CONFIGURABLE/PARTIAL` Supabase existe como client/config, mas sem schema confirmado.
- `UNKNOWN` Politica de backup, retencao, restauracao e migracao.
- `NEEDS_DECISION` Se houver dados financeiros/pessoais reais, definir backup, criptografia, retencao, exclusao e auditoria.

## Incidentes

Sem processo de incidente implementado no repo.

Processo minimo recomendado:

1. Registrar incidente com hora, impacto, rotas afetadas e ambiente.
2. Congelar claims publicas relacionadas ate confirmacao.
3. Validar se o problema afeta dados pessoais, saldos, transacoes ou seguranca.
4. Definir comunicacao ao usuario/lojista conforme obrigacoes legais.
5. Criar postmortem e atualizar `docs/plans.md`.

## Seguranca Operacional

- `PARTIAL/MOCK` Auth, KYC, PIN, biometria, DID e assinatura offline nao devem ser tratados como controles reais.
- `NEEDS_DECISION` Definir gestao de secrets e permissao de Supabase.
- `NEEDS_SOURCE` Postura LGPD, AML/KYC, PCI, custody, cripto e pagamentos.
- `NEEDS_DECISION` Criar checklist de release para areas sensiveis.

## Smoke Manual Sugerido

1. Abrir `/onboarding`, concluir fluxo demo e ir para `/auth`.
2. Entrar como cliente demo.
3. Pagar por `/customer/scanner` com valor pequeno.
4. Ver atividade em `/customer/home` e `/customer/history`.
5. Abrir `/customer/qr` e alternar abas.
6. Abrir `/customer/offline` e simular assinatura.
7. Entrar como lojista demo e gerar QR/receber offline.
8. Abrir `/network` apenas como explorer simulado.

## Release Gate

Antes de declarar pronto para producao:

- [ ] Backend real definido.
- [ ] Auth real definido.
- [ ] Modelo de dados e migracoes definidos.
- [ ] Testes automatizados criados.
- [ ] Monitoramento e incidentes definidos.
- [ ] Claims reguladas revisadas.
- [ ] `NEEDS_SOURCE` criticos resolvidos ou removidos da experiencia publica.
