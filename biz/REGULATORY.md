# Regulatory reality

Não é parecer jurídico. A aplicação depende de funções concretas, jurisdição, controle e contratos; software e smart contract não implicam isenção automática.

## Protótipo

MockUSDC, contas locais, nenhum funding/payout bancário, sem fundos reais, sem KYC. DID não prova pessoa e não substitui AML. Não lançar a demo como serviço financeiro real.

## Produção — mapa de questões

| Area | Question / risk | Required next step |
| --- | --- | --- |
| Custody | Quem controla master/session, pausas, recoveries e escrow? | Counsel descreve custódia/authority e operação, não só código |
| Money transmission/payment institution | Quem recebe/manda recursos de terceiros e cobra merchant? | Definir licenças ou PSP parceiro por atividade |
| KYC/AML | Funding, payout, sanctions e wallet screening | Identificação adequada e controles proporcionais por parceiro |
| Stablecoins | Issuer/reserves/freeze/depeg, PSAV perímetro | Elegibilidade de asset, disclosures e contrato |
| FX | BRL display não é conversão real; cross-border pode integrar câmbio | Consultoria específica e instituição autorizada |
| Consumer protection | Expiry, cancellation, refunds, pending e losses | Termos claros, disputa, suporte e consentimento ao risco |
| Brazil | BCB Resoluções 519/520/521 e atualizações 2026 | Rever texto vigente e transição com counsel antes de piloto live |
| Cross-border | País payer/merchant/provider/asset e transfer restrictions | Limitar geografia e parceiro até parecer |
| Privacy/LGPD | DID + on-chain transfers são correlacionáveis | Minimização, bases legais, retenção e direitos; evitar PII on-chain |
| Risk guarantees | Prêmio/indenização pode criar obrigações adicionais | Counsel avalia estrutura antes de prometer garantia |

Fontes atuais: [BCB nota de regulamentação](https://www.bcb.gov.br/detalhenoticia/20918/nota?s=08), [Res.520](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=resolu%C3%A7%C3%A3o+bcb), [FAQ BC](https://www.bcb.gov.br/meubc/faqs/p/guarda-e-negociacao-de-moedas-virtuais). Consultadas 11 outubro 2026. Não presumir que versão/cronograma de 2025 dispensa verificar alterações de 2026.

Pitch: “The prototype uses only demo assets. A commercial pilot depends on licensed funding and payout partners, legal review, and explicit offline-risk allocation.”
