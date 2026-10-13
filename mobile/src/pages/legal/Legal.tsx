import {Link} from 'react-router-dom';
import type {ReactNode} from 'react';
import {ProductHeader} from '@/pages/payments/ProductHeader';
import '@/pages/payments/design310.css';
function LegalLayout({title,children}:{title:string;children:ReactNode}){return <main className="payment-screen experience310 legal-page"><ProductHeader/><Link className="text-button" to="/">← Início</Link><h1>{title}</h1><p className="legal-version">Atualizado em 13 de outubro de 2026 · Ambiente Sandbox</p><div className="legal-sections">{children}</div><footer><a href="mailto:shimopay@pm.me">shimopay@pm.me</a><LegalIndexCard/></footer></main>;}
function Section({heading,children}:{heading:string;children:ReactNode}){return <section><h2>{heading}</h2>{children}</section>;}
export const PrivacyPolicy=()=> <LegalLayout title="Privacidade">
<Section heading="Dados utilizados"><p>O ShimoPay utiliza endereços de carteira, autorizações de pagamento, valores e identificadores de transações para operar e acompanhar pagamentos. Quando o login está configurado, a autenticação utiliza seu email e sua sessão.</p></Section>
<Section heading="Onde os dados ficam"><p>Preferências, histórico local, cotações e metadados de sessão ficam no navegador. A chave da sessão offline é armazenada criptografada. Solicitações de pagamento e consultas passam pelo backend; transações confirmadas na Solana Devnet são públicas. Pix e cartão são processados no ambiente de teste do Mercado Pago.</p></Section>
<Section heading="Câmera e localização"><p>A câmera é solicitada para ler QR Codes. A localização é solicitada quando você aciona esse recurso. Você pode negar ou revogar essas permissões nas configurações do navegador.</p></Section>
<Section heading="Controle dos seus dados"><p>Para solicitar acesso, correção ou exclusão de dados, entre em contato pelo email abaixo. Limpar o armazenamento do navegador remove registros e chaves locais, mas não apaga registros públicos da blockchain ou dados mantidos pelos provedores. Antes de limpar, liquide autorizações pendentes e encerre sessões offline.</p></Section>
<Section heading="Contato"><p>Dúvidas sobre privacidade e solicitações: <a href="mailto:shimopay@pm.me">shimopay@pm.me</a>.</p></Section>
</LegalLayout>;
export const TermsOfUse=()=> <LegalLayout title="Termos de uso">
<Section heading="Uso do ShimoPay"><p>Esta versão opera em Ambiente Sandbox: USDC e SOL na Solana Devnet, Pix e cartão no ambiente de teste do Mercado Pago. Utilize somente contas e ativos de teste.</p></Section>
<Section heading="Pagamentos offline"><p>Autorizações offline são assinadas localmente com uma chave de sessão limitada e respaldadas por uma reserva on-chain. A aceitação permanece pendente até a liquidação. Limites e validade reduzem o risco; não eliminam conflitos entre pagamentos aceitos por lojistas desconectados.</p></Section>
<Section heading="Contas e registros"><p>As carteiras de desenvolvimento são compartilhadas. Uma sessão de login não comprova a propriedade dessas carteiras. Comprovantes exibem os dados disponíveis da rede ou do provedor; registros manuais de dinheiro são identificados separadamente.</p></Section>
<Section heading="Serviços e integrações"><p>As ferramentas disponíveis aparecem nos miniapps de cada perfil. Referências a provedores identificam as tecnologias utilizadas e não representam endosso ou parceria comercial. Conversão de USDC para reais e payout bancário não estão disponíveis nesta versão.</p></Section>
<Section heading="Disponibilidade e contato"><p>O ambiente pode passar por manutenção e alterações. Em caso de dúvida ou inconsistência, envie o identificador da operação para <a href="mailto:shimopay@pm.me">shimopay@pm.me</a>. Não envie senhas ou chaves privadas.</p></Section>
</LegalLayout>;
export const LegalIndexCard=()=> <nav className="legal-links"><Link to="/privacidade">Privacidade</Link><Link to="/termos">Termos de uso</Link></nav>;
