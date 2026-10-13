# ShimoPay Development Guide

Guia vivo para desenvolver, validar e evoluir o projeto sem depender de conhecimento implicito.

## Requisitos

- Node.js instalado.
- Dependencias npm do repo.
- Ambiente Windows atual validado com Node em `C:\Program Files\nodejs`.

## Setup

```powershell
npm install
npm run dev
```

Se o `npm` global falhar com erro de modulo ausente em `AppData\Roaming\npm`, use:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' install
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run lint
```

## Comandos

| Comando | Status | Uso |
| --- | --- | --- |
| `npm run dev` | `CONFIRMED` | Inicia Vite. |
| `npm run build` | `CONFIRMED` | Build de producao. |
| `npm run build:dev` | `CONFIRMED` | Build em modo development. |
| `npm run lint` | `CONFIRMED` | ESLint. |
| `npm run preview` | `CONFIRMED` | Preview Vite. |
| `npm run start` | `CONFIRMED` | Preview em `8080` com host aberto. |
| `npm test` | `UNKNOWN/NOT_IMPLEMENTED` | Nao existe script `test` em `package.json`. |

## Validacao Recomendada

No ambiente atual:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run lint
& 'C:\Program Files\nodejs\node.exe' '.\node_modules\typescript\bin\tsc' -b --pretty false
& 'C:\Program Files\nodejs\node.exe' '.\node_modules\vite\bin\vite.js' build
```

Resultado registrado em 2026-06-05:

- Lint: passa com 8 avisos `react-refresh/only-export-components`.
- Typecheck: passa.
- Build: passa com aviso de Browserslist desatualizado e chunk maior que 500 kB.

## Fluxo De Contribuicao Spec-Driven

1. Antes de codar, atualize `docs/spec.md` ou `docs/plans.md` com o comportamento pretendido.
2. Classifique cada claim como `CONFIRMED`, `INFERRED`, `NEEDS_SOURCE` ou `NEEDS_DECISION`.
3. Se for mock, nomeie como mock na UI/docs/codigo.
4. Adicione ou atualize teste quando houver suite disponivel.
5. Rode lint, typecheck e build.
6. Atualize `.project/spec-status.md` com o novo estado.

## Padroes Do Projeto

- React function components.
- Imports com alias `@/*`.
- UI baseada em Tailwind, Shadcn/Radix e `src/components/shimo`.
- Experiencias mobile-first com root max-width em `src/index.css`.
- Evitar claims de pagamento real quando a tela usa `MockContext` ou estado local.

## Troubleshooting

- `Cannot find module ... npm-cli.js`: usar npm via `C:\Program Files\nodejs`.
- `tsc -b` cria `tsconfig.*.tsbuildinfo`: remover se aparecerem no worktree; sao artefatos de validacao.
- Build com warning de chunk: considerar code splitting quando a superficie runtime estabilizar.
- Build com Browserslist stale: atualizar caniuse-lite quando houver manutencao de dependencias.
- Supabase undefined: conferir `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`; o fluxo atual nao depende funcionalmente do client.

## Lacunas Tecnicas

- `NEEDS_DECISION` Suite de testes: Vitest/RTL, Playwright ou combinacao.
- `NEEDS_DECISION` Separacao entre mocks e providers reais.
- `NEEDS_DECISION` Modelo de dominio e dados.
- `NEEDS_SOURCE` Politicas reais de seguranca, KYC, pagamentos e compliance.
