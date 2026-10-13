# Verificação da preparação ICM Lab — 14/09/2026

- Build Vite: passou. Avisos de Browserslist antigo e bundle acima de 500 kB.
- TypeScript: passou.
- Vitest: 32 testes passaram em 4 arquivos. Duas expectativas antigas do teste BR Code foram corrigidas: remoção de acento preserva caixa, e 12.50 ocupa 5 caracteres. A checagem explícita `ok === false` corrige o narrowing na configuração atual. Gerador financeiro não foi alterado.
- ESLint: zero erros, 8 avisos de Fast Refresh existentes.
- Navegador: raiz abre LP; CTA abre auth; cliente demo abre carteira; Serviços abre catálogo; Rachar Conta abre miniapp; lojista demo abre painel.
- LP inspecionada em 1440 px e 320 px, sem overflow horizontal. Capturas: `landing-desktop.png` e `landing-mobile.png`.
- Dependências qrcode e @types/qrcode instaladas e registradas no lockfile.
- npm informou 19 vulnerabilidades (1 baixa, 3 moderadas, 15 altas) na árvore instalada. Não foi feita análise de explorabilidade ou atualização ampla das dependências; pendência para antes de publicar.
- Não houve teste de liquidação, transação externa, integração Solana, KYC ou piloto real. Não houve publicação nem envio de candidatura.
- Revisão visual não certifica conformidade integral de acessibilidade.


## Correção de dependências — 14/09/2026

Atualizações compatíveis via npm audit fix, seguidas de react-router-dom 7.18.3 para resolver os dois alertas restantes. Vite instalado 7.3.6. npm ci completou com zero vulnerabilidades na auditoria da árvore instalada. Build, TypeScript e 32 testes passaram; lint zero erros, oito avisos existentes. Navegação do build de produção LP → auth → cliente conferida no navegador. Aviso de bundle acima de 500 kB permanece; divisão de carregamento faz parte da próxima etapa. Identidade visual aguarda escolha entre as três propostas em docs/brand.
