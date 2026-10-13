# Auditoria de capacidades do app

12/10/2026 · aplicação: ShimoPay Mobile · contrato: [SPEC.md](../SPEC.md).

Esta auditoria registrou o baseline; execução posterior em 12/10 preparou auth e implementou câmera/GPS, caixa local e checkout cartão. Estados atuais no SPEC 2.4 e progress; a tabela abaixo preserva o diagnóstico inicial. Evidência browser em [mobile-capability-audit.json](evidence/mobile-capability-audit.json), junto às evidências históricas citadas abaixo.

| Função | Encontrado | Prova ou bloqueio |
| --- | --- | --- |
| Login | Acesso demo local | Auth.tsx usa useMock/login; handleSubmit anuncia sucesso sem consultar senha no servidor. Supabase client existe, mas não é chamado nesse fluxo. Vercel Mobile sem envs de produção; conexão Supabase lista zero projetos e get_project do ref eqliiqvebzekmencdhqc retorna permission denied. Não é autenticação real. |
| Logo | Marca SVG existente | public/brand/mark.svg e ProductHeader compartilhado; carregamento conferido no browser. Não foi gerado outro logo nesta auditoria. |
| Pix | Sandbox integrado | mobile-pix-lifecycle.json: QR→approved/accredited da mesma ordem, USDC inalterado. Consulta atual do provider também registrada na auditoria. Payout/conversão continuam simulados. |
| QR gerado | Invoice/intent real | MobilePayments usa qrcode para o payload; geração de invoice conferida no browser; protocol tests validam payload/assinatura. |
| Câmera/leitura QR | Ausente | /customer/scanner abre Payments/pay; há import por textarea, sem getUserMedia/decoder. Scanner legado usa timer mock. QR gerado não comprova leitura pela câmera. |
| Geolocalização | Ausente | Nenhum uso de navigator.geolocation no caminho financeiro atual. Catálogo não comprova busca por localização real. |
| Pagamento offline | Verificado Devnet | mobile-live-full.json, E2E PWA e merchant-only reconnect; assinatura Ed25519 com chave criptografada. |
| Dinheiro | Ausente | Não há rail de caixa/espécie nem confirmação manual auditada. Escolher uma opção no mock não movimenta dinheiro. |
| Cartão | Ausente | Adapter Mercado Pago atual é Pix Orders API. Nenhum checkout/tokenização cartão no caminho financeiro. O provedor é Mercado Pago, a plataforma de pagamentos do ecossistema Mercado Livre. |

## Entrega necessária

1. Disponibilizar projeto Supabase acessível e configurar VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY na Vercel Mobile. Implementar autenticação e autorização server-side/ownership; frontend login sozinho não isola as contas compartilhadas atuais.
2. Implementar leitor com permissão explícita, encerramento de streams e fallback para navegadores sem BarcodeDetector. Assets do decoder devem estar disponíveis offline. Leitura importa payload para revisão/validação existente.
3. Geolocalização sob ação do usuário, com precisão/time e tratamento de negativa/timeout. Não persistir coordenadas sem necessidade.
4. Dinheiro como rail manual identificado, registro e comprovante próprios; nenhum crédito fictício em USDC ou confirmação bancária.
5. Cartão pelo checkout/tokenização Mercado Pago. Credencial secreta fica no backend; tokenização não usa armazenamento de PAN/CVV. Testar aprovação e recusa com cartões/usuários de teste, status autenticado e idempotência. Credenciais Pix existentes não comprovam este fluxo.

Permissões de câmera/GPS dependem do usuário no celular. Teste de browser em cloud pode verificar APIs e frames simulados, mas não comprova hardware, foco/autofoco e UX do permission prompt em Android/iOS. Nenhum desses fluxos será rotulado VERIFIED sem a evidência específica.

## Execução posterior

- Auth.tsx agora chama Supabase e /api/auth-session; falso sucesso removido. Ativação externa e ownership individual bloqueados; não houve login real no projeto sem acesso. Gateway preparado para allowlist de operadores, com teste de signup que não concede autoridade financeira.
- QrReader: câmera traseira, decoder local, import por imagem, tracks encerradas, revisão do payload. Testes usam frames QR reais em stream simulado no browser offline; celular físico ainda precisa validação.
- LocationAccess: API de geolocalização por clique, denied/timeout e remoção; somente memória, mapa por ação do usuário. Coordenadas simuladas nos testes, sem alegar fix GPS físico.
- CashRegister: valor efetivamente informado/confirmado pelo operador, persistência, anulação e download do registro local; zero alteração de tokens. Autenticação/trilha centralizada pendentes.
- CardCheckout: URL hospedada sandbox criada por seller test verificado; consulta/reconciliação segura. [Preferência real](evidence/mobile-card-provider.json); aprovação real de cartão ainda pendente. Nenhum PAN/CVV no ShimoPay.
