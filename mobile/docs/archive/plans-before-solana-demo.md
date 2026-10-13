# ShimoPay Living Plan

Plano vivo para evoluir o projeto de forma spec-driven. Este arquivo deve ser atualizado a cada milestone com status, notas de implementacao e verificacao.

## Verification Checklist

Ultima verificacao: 2026-08-21.

- [x] Lint passa.
- [x] Typecheck passa.
- [x] Build passa.
- [x] PRD alvo criado em `docs/prd.md`.
- [x] Testes automatizados existem e passam (Vitest, 24 testes de dominio; `npm test`).
- [x] Smoke local com rotas principais documentado (secao Implementation Notes).
- [x] Separacao explicita entre mocks e providers reais (mapa em `docs/architecture.md`).
- [x] Modelo de dominio minimo documentado e implementado (`src/domain/*` + `docs/spec.md`).

Comandos atuais:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run lint
& 'C:\Program Files\nodejs\node.exe' '.\node_modules\typescript\bin\tsc' -b --pretty false
& 'C:\Program Files\nodejs\node.exe' '.\node_modules\vite\bin\vite.js' build
```

## Milestone 01 - Documentacao Viva [x]

Objetivo: criar base spec-driven para produto, negocio, arquitetura, desenvolvimento, operacoes, fontes e status.

Arquivos provaveis:

- `README.md`
- `docs/spec.md`
- `docs/business-model.md`
- `docs/architecture.md`
- `docs/development.md`
- `docs/operations.md`
- `docs/source-registry.md`
- `.project/spec-status.md`

Critérios de aceite:

- Claims de produto/negocio classificadas.
- Mocks, parciais e desconhecidos separados.
- Fontes do repo registradas.
- Proximos milestones definidos.

Comandos de validacao:

- Lint, typecheck e build.

Riscos:

- Docs ficarem desatualizadas se runtime mudar sem atualizar spec.

Dependencias:

- Nenhuma dependencia externa.

Definicao de pronto:

- Arquivos criados/atualizados e validacao registrada.

## Milestone 02 - PRD v1 Implementavel [x]

Objetivo: criar documento alvo para sair do MVP e orientar produto, engenharia, negocio e operacao.

Arquivos provaveis:

- `docs/prd.md`
- `docs/plans.md`
- `.project/spec-status.md`

Critérios de aceite:

- PRD cobre app cliente mobile, painel lojista web/mobile e admin/backoffice.
- PRD combina QR/offline lojista como core e turista/cripto como diferencial.
- Requisitos P0/P1/P2 documentados.
- Claims sensiveis marcadas como `NEEDS_SOURCE` ou `NEEDS_DECISION`.

Comandos de validacao:

- Revisao documental.
- Busca textual por `NEEDS_SOURCE`, `NEEDS_DECISION` e `PARTIAL/MOCK`.

Riscos:

- PRD virar promessa comercial se os marcadores forem removidos antes das fontes existirem.

Dependencias:

- Nenhuma dependencia runtime.

Definicao de pronto:

- `docs/prd.md` criado e status atualizado.

## Milestone 03 - Contrato Do MVP De Pagamento [x]

Objetivo: transformar o loop "pagar, receber, historico" em contrato testavel antes de backend real.

Arquivos provaveis:

- `docs/spec.md`
- `src/contexts/MockContext.tsx`
- `src/pages/customer/Scanner.tsx`
- `src/pages/customer/Home.tsx`
- `src/pages/merchant/Dashboard.tsx`

Critérios de aceite:

- `NEEDS_DECISION` Definir se o contrato inicial cobre apenas saldo BRL local.
- Pagar com saldo suficiente altera saldo e historico de forma previsivel.
- Saldo insuficiente nao altera estado.
- Lojista recebe transacao local consistente.
- Mocks continuam explicitamente rotulados.

Comandos de validacao:

- Lint, typecheck, build.
- `NEEDS_DECISION` Criar suite de teste antes ou durante este milestone.

Riscos:

- Estado em memoria e `localStorage` competem como fontes de verdade.

Dependencias:

- Decisao sobre suite de testes.

Definicao de pronto:

- Contrato documentado, coberto por testes ou checklist de smoke manual, e sem regressao visual evidente.

## Milestone 04 - Separacao Mock vs Provider Real [x]

Objetivo: impedir que simulacoes sejam confundidas com pagamentos, KYC, DID ou blockchain reais.

Arquivos provaveis:

- `src/contexts/MockContext.tsx`
- `src/lib/storage.ts`
- `src/integrations/supabase/*`
- `docs/architecture.md`
- `docs/source-registry.md`

Critérios de aceite:

- Providers mockados nomeados explicitamente.
- UI/docs nao prometem recursos reais sem fonte.
- Supabase fica documentado como configurado, nao funcional, ate uso real existir.

Comandos de validacao:

- Lint, typecheck, build.

Riscos:

- Mudanca de nomes pode tocar muitas telas.

Dependencias:

- Decidir se Supabase sera backend principal.

Definicao de pronto:

- Cada feature sensivel sabe apontar para mock, local storage ou provider real.

## Milestone 05 - Modelo Offline Com Limite De Risco [x]

Objetivo: especificar e, depois, implementar uma versao minima de offline payment sem overclaim.

Arquivos provaveis:

- `docs/spec.md`
- `docs/architecture.md`
- `src/pages/customer/Offline.tsx`
- `src/components/DIDHandshake.tsx`
- Novo modulo de dominio a decidir.

Critérios de aceite:

- `NEEDS_DECISION` Definir allowance, validade, limite por transacao, contador, device identity e merchant identity.
- `NEEDS_SOURCE` Confirmar postura legal/regulatoria antes de claims publicas.
- Fluxo offline continua descrito como simulado ate assinatura/liquidacao real existir.

Comandos de validacao:

- Lint, typecheck, build, testes do modulo offline quando criados.

Riscos:

- Risco financeiro/regulatorio se linguagem prometer liquidacao real.

Dependencias:

- Produto, engenharia, juridico/regulatorio.

Definicao de pronto:

- Modelo documentado, limites claros e nenhuma claim sem fonte.

## Milestone 06 - Backend E Dados [ ]

Objetivo: definir e implementar a primeira fonte persistente real.

Arquivos provaveis:

- `src/integrations/supabase/*`
- `supabase/*`
- `docs/architecture.md`
- `docs/operations.md`

Critérios de aceite:

- `NEEDS_DECISION` Backend escolhido.
- Schema minimo documentado.
- Auth real ou explicitamente fora de escopo.
- Politica de dados, backup e incidentes definida.

Comandos de validacao:

- Lint, typecheck, build, testes de integracao quando disponiveis.

Riscos:

- Dados financeiros e pessoais exigem controles de seguranca e privacidade.

Dependencias:

- Decisao de arquitetura, secrets, ambiente Supabase/API.

Definicao de pronto:

- Fluxo real pequeno substitui mock sem quebrar docs.

## Milestone 07 - Produto E Negocio Validado [ ]

Objetivo: transformar hipoteses de negocio em decisoes rastreadas.

Arquivos provaveis:

- `docs/business-model.md`
- `docs/spec.md`
- `docs/plans.md`

Critérios de aceite:

- Cliente, usuario, comprador, pricing e canal definidos ou marcados como pendentes.
- Concorrentes e benchmarks com fontes.
- Claims de parceiros removidas, anonimizadas ou documentadas.

Comandos de validacao:

- Revisao documental.
- Checklist de claims `NEEDS_SOURCE`.

Riscos:

- Produto tentar vender superapp amplo antes de provar pagamento/aceitacao.

Dependencias:

- Pesquisa de mercado, decisao executiva e validacao com usuarios.

Definicao de pronto:

- Business model deixa de ser hipotese generica e vira estrategia testavel.

## Milestone 08 - Baseline LGPD [x]

Objetivo: dar ao produto demo os minimos de privacidade que um SaaS B2C/B2B precisa: consentimento, transparencia e direitos do titular.

Arquivos provaveis:

- `src/lib/privacy.ts`
- `src/pages/legal/Legal.tsx` (`/privacidade`, `/termos`)
- `src/pages/Onboarding.tsx`
- `src/pages/customer/Profile.tsx`
- `src/pages/Landing.tsx`

Criterios de aceite:

- [x] Consentimento registrado com versao/timestamp antes de dados de uso.
- [x] Exportar dados locais em JSON portavel.
- [x] Apagar todos os dados locais com confirmacao e registro de revogacao.
- [x] Politica de privacidade e termos publicos (rascunho) linkados em Landing, Onboarding e Perfil.
- [ ] `NEEDS_SOURCE` Revisao juridica dos textos, DPO/canal real, RIPD e base legal para rails reais.

Comandos de validacao: lint, typecheck, build, testes.

Riscos: textos de rascunho serem tratados como definitivos.

Definicao de pronto: fluxo de consentimento + direitos do titular funcionais sobre dados locais; pendencias juridicas marcadas.

## Milestone 09 - Portal Admin/Backoffice Demo [x]

Objetivo: operacao interna minima (PRD §5.5) para suporte/risco sobre os dados demo, com trilha de auditoria.

Arquivos provaveis:

- `src/pages/admin/Admin.tsx` (rota `/admin`)
- `src/lib/adminStore.ts`
- `src/domain/audit.ts` + testes

Criterios de aceite:

- [x] Entrada de operador demo com papel (support/risk/admin) e regras de permissao por papel.
- [x] Busca por usuarios, lojistas e transacoes (mock + localStorage).
- [x] Acoes de suporte registradas em trilha append-only persistida.
- [x] Bloqueio como override local explicito, sem afetar pagamentos.
- [ ] `NEEDS_DECISION` Auth real, RBAC de servidor, auditoria imutavel e backend.

Comandos de validacao: lint, typecheck, build, testes.

Riscos: portal demo ser confundido com ferramenta de producao.

Definicao de pronto: operador consegue buscar, agir e auditar localmente; limites documentados.

## Milestone 10 - QR Pix Real, Biometria Do Dispositivo E Limpeza Visual [x]

Objetivo: substituir graficos fake por elementos reais e integrar o que e possivel sem provedor externo: BR Code Pix pagavel (com chave propria) e confirmacao por biometria nativa via WebAuthn.

Arquivos provaveis:

- `src/domain/brcode.ts` + testes
- `src/lib/pixConfig.ts`, `src/lib/webauthn.ts`
- `src/components/shimo/ShimoQrCode.tsx`
- `src/pages/customer/QR.tsx`, `src/pages/customer/Scanner.tsx`
- `src/pages/merchant/Dashboard.tsx`, `src/pages/admin/Admin.tsx`
- `src/pages/Onboarding.tsx` (remocao das cenas fake)

Criterios de aceite:

- [x] Componente de QR renderiza matriz REAL escaneavel (lib `qrcode`), sem quadrados decorativos.
- [x] `buildPixPayload` gera BR Code EMV valido com CRC16-CCITT-FALSE (vetor "123456789" -> 29B1 pinado em teste).
- [x] Chave Pix placeholder configuravel no portal `/admin`; badge indica se o QR e pagavel ou demo.
- [x] Confirmacao de pagamento com FaceID/digital/PIN nativo (WebAuthn platform authenticator, UV required); fallback PIN demo onde nao suportado.
- [x] Cenas SVG/div feias removidas dos slides; arte limpa com simbolos existentes.
- [ ] `NEEDS_DECISION` Cobranca Pix com txid/confirmação por webhook exige provedor (Efí/Mercado Pago/Asaas) + backend (Edge Functions).
- [ ] `NEEDS_SOURCE` Liveness certificado (FaceTec/similar) e validacao de documentos exigem contrato/licenca de provedor KYC.

Comandos de validacao: lint, typecheck, testes (`npm test`), build.

Riscos: QR com chave placeholder ser confundido com cobranca real; WebAuthn indisponivel fora de contexto seguro (fallback ja implementado).

Definicao de pronto: QR escanea de verdade; com chave real paga em qualquer banco; biometria nativa confirma pagamento onde suportada.

## Implementation Notes

- 2026-06-05: Base documental criada a partir de codigo, README, docs existentes, configs, package files e verificacao local.
- 2026-06-07: PRD v1 criado para transicao MVP -> produto implementavel, cobrindo mobile, web/mobile lojista e admin/backoffice.
- 2026-08-21: M03 concluido — dominio puro `src/domain/ledger.ts` (pay/receive/fidelidade, imutabilidade e centavos normalizados) extraido do `MockContext` sem mudar API das telas; suite Vitest adicionada (`npm test`, 24 testes: ledger, offline, auditoria).
- 2026-08-21: M04 concluido — mapa "Mock vs Real" em `docs/architecture.md`; `MockContext` explicitamente rotulado como provider mock e delegando ao dominio; Supabase segue configurado-nao-funcional.
- 2026-08-21: M05 concluido — `src/domain/offline.ts` modela allowance com identidades, teto total, limite por transacao, maximo de vouchers e validade; vouchers fora dos limites sao rejeitados com motivo e allowance inalterada. Continua simulacao (sem assinatura/liquidacao real).
- 2026-08-21: M08 concluido — consentimento LGPD no onboarding, exportar/apagar dados locais no perfil, paginas `/privacidade` e `/termos` (rascunho marcado) linkadas na Landing/Onboarding/Perfil.
- 2026-08-21: M09 concluido — portal `/admin` com operador demo por papel, busca de usuarios/lojistas/transacoes, acoes (bloquear, incidente, ajustar limite) e trilha de auditoria append-only em `localStorage`.
- Smoke local sugerido (rotas): `/onboarding` (consentimento obrigatorio no fim) → `/auth` → `/customer/home` (pagar/receber) → `/customer/history` → `/customer/profile` → Privacidade (exportar/apagar) → `/admin` (operador demo) → `/privacidade` e `/termos`.
- 2026-08-23: criado `docs/progress.md` (arquivo de progresso consolidado por milestone); revalidacao completa verde — lint (0 erros), typecheck, 24/24 testes, build.
- 2026-08-24: M10 concluido — dominio `brcode.ts` (BR Code Pix EMV + CRC16 testado), componente `ShimoQrCode` com matriz real, chave Pix placeholder configuravel no `/admin`, WebAuthn (biometria nativa) na confirmacao do Scanner com fallback PIN, remocao das cenas fake do onboarding e dos QRs decorativos do cliente/lojista.
