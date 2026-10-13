# Design QA — ShimoPay azul

final result: passed

Escopo: implementação da direção concept-1 aprovada pelo usuário, com adaptação responsiva e conteúdo demonstrativo real do projeto.

## Evidências
- Comparação lado a lado em docs/qa/blue-comparison.png: identidade, composição café/hero, hierarquia, paleta azul/marfim/damasco e cartões mantidos.
- Capturas: blue-desktop.png, blue-landing-768.png, blue-landing-390.png, blue-landing-320.png, blue-home-390.png.
- Landing conferida em 1440, 768, 390 e 320; medidas DOM sem overflow horizontal nos três tamanhos menores.
- Home conferida em 390 e 320, sem overflow horizontal. Nenhum botão dentro de link ou link dentro de botão na home.
- Fluxo observado: LP → acesso → cliente demo → home → miniapp comida → Escape → home → Receber, com QR visível.
- Navegação inferior com quatro destinos. Conteúdo adicional disponível por expansão.

## Diferenças intencionais
- Ilustração própria derivada da referência, sem lettering raster.
- Textos e transações usam dados demonstrativos existentes; não foram copiadas métricas da prancha.
- LP inclui explicação de estágio/piloto e links legais além do hero da referência.
- Home mantém recursos existentes abaixo da atividade e em disclosure.

## Validação técnica
- Build de produção concluído; chunk principal reduzido de cerca de 652 KB para 348 KB, rotas carregadas sob demanda.
- 32 testes passaram; TypeScript passou; lint sem erros (8 avisos existentes de Fast Refresh).
- npm ci concluído; auditoria após atualizações e instalação da fonte: zero vulnerabilidades reportadas.

Sem P0/P1/P2 visual identificado nesta revisão. Não é auditoria completa de acessibilidade: leitor de tela, forced colors e zoom manual permanecem fora da validação realizada. Pagamentos e pedidos continuam simulados; sem deploy ou envio de candidatura.
