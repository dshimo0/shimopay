"""Generate 16:9 PT/EN pitch slides. Requires reportlab and DejaVu Sans fonts."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[1]
FONT=Path('/usr/share/fonts/truetype/dejavu')
for name,file in [('Body','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(FONT/file)))
W,H=1280,720
INK='#101C40';BLUE='#293DFF';MUTED='#596989';BG='#FFFDF9';SOFT='#ECF1FF'
PROOF='https://explorer.solana.com/tx/3H5KGjwctHH4bcU2ePEo8g8RZYRbo9AMUM1pDNxcSoeFNdr2Hv5QW2MneG3j5Q1HHJKfYfmHMGYCAtxMJ4LwB47p?cluster=devnet'
slides=[
('ShimoPay','A conexão cai.\nO pagamento continua.','Autorize em moeda local. Liquide em USDC na Solana quando a conexão voltar.',['Identidade','Autorização offline','Liquidação on-chain'], 'Payments that don’t stop\nwhen the network does.','Authorize in local currency. Settle in USDC on Solana once connectivity returns.',['Identity','Offline authorization','On-chain settlement']),
('01 · Problema','Uma pequena compra não deveria\nparar por falta de sinal.','Pagamentos que dependem de autorização online deixam clientes e lojistas esperando quando a rede falha.',['Cliente sem conexão','Compra interrompida','Lojista esperando'],'A small purchase should not\nstop when connectivity does.','Payments that require online authorization leave customers and merchants waiting when the network fails.',['Customer disconnected','Purchase interrupted','Merchant waiting']),
('02 · Solução','Separe autorização\nde liquidação.','Uma reserva on-chain limita a chave de sessão. O cliente assina no aparelho; o lojista verifica localmente e liquida quando estiver online.',['Reserve online','Autorize offline','Liquide online'],'Separate authorization\nfrom settlement.','An on-chain reserve bounds the session key. The customer signs locally; the merchant verifies locally and settles when online.',['Reserve online','Authorize offline','Settle online']),
('03 · Experiência','R$ 25 no caixa.\nUSDC na liquidação.','O valor em USDC fica definido antes da assinatura, usando a cotação válida em cache. O cliente vê a moeda da compra.',['Cobrança: R$ 25,00','Câmbio: R$ 5,50 / USDC','Liquidação: 4,545455 USDC'],'R$25 at checkout.\nUSDC at settlement.','The USDC amount is fixed before signing using a valid cached FX quote. The customer sees the local purchase currency.',['Charge: R$25.00','FX: R$5.50 / USDC','Settlement: 4.545455 USDC']),
('04 · Offline','Basta um lado\nrecuperar a conexão.','O lojista pode transmitir o intent e receber USDC enquanto o cliente permanece offline. Nenhuma chamada à blockchain ocorre durante a autorização local.',['Cliente assina offline','Lojista verifica','Lojista reconecta e liquida'],'Only one side needs\nto reconnect.','The merchant can submit the intent and receive USDC while the customer stays offline. Local authorization makes no blockchain call.',['Customer signs offline','Merchant verifies','Merchant reconnects']),
('05 · Protocolo','A sessão é o centro\ndo ShimoPay.','Identidade + chave do aparelho + escrow + política + FX em cache + intent assinado. O adapter conecta essa autorização ao trilho de liquidação.',['OfflineSession','Payment Intent','Settlement Adapter'],'The session is at\nthe heart of ShimoPay.','Identity + device key + escrow + policy + cached FX + signed intent. The adapter connects authorization to the settlement rail.',['OfflineSession','Payment Intent','Settlement Adapter']),
('06 · Prova','4,545455 USDC.\nComprovante verificável.','Uma compra de R$25 foi autorizada offline e liquidada com Circle USDC na Solana Devnet. Abra a transação histórica no Explorer.',['Circle USDC de teste','Solana Devnet','Transação verificável'],'4.545455 USDC.\nA verifiable receipt.','A R$25 purchase was authorized offline and settled with Circle USDC on Solana Devnet. Open the historical transaction in Explorer.',['Circle test USDC','Solana Devnet','Verifiable transaction']),
('07 · Risco','Limites claros.\nRisco limitado.','Reserva, prazo, assinatura, destinatário e nonce são verificados. Lojistas isolados ainda podem aceitar intents conflitantes; aceitar offline não é liquidação final.',['Limite por sessão','Expiração + replay','Saldo validado on-chain'],'Clear limits.\nBounded risk.','Reserve, expiry, signature, recipient and nonce are checked. Isolated merchants can still accept conflicting intents; offline acceptance is not final settlement.',['Session allowance','Expiry + replay','On-chain balance checks']),
('08 · Meios de pagamento','Uma experiência.\nMeios diferentes.','USDC liquida na Solana. Pix e cartão usam Mercado Pago Sandbox online. Conversão para reais e repasse bancário ainda não estão disponíveis.',['USDC · Solana Devnet','Pix · Sandbox online','Cartão · Sandbox online'],'One experience.\nDifferent payment methods.','USDC settles on Solana. Pix and cards use Mercado Pago Sandbox online. Conversion to reais and bank payouts are not yet available.',['USDC · Solana Devnet','Pix · Online sandbox','Card · Online sandbox']),
('09 · Execução','Experiência em identidade\ne segurança.','Trajetória informada pelo fundador: 25 anos em segurança, mais de duas dezenas de projetos IAM e mais de 2 milhões de identidades gerenciadas.',['25 anos em segurança','24+ projetos IAM','2M+ identidades'],'Experience in identity\nand security.','Founder-reported background: 25 years in security, more than two dozen IAM projects and over 2 million managed identities.',['25 years in security','24+ IAM projects','2M+ identities']),
('10 · Próximo marco','Da prova técnica\nao uso por lojistas.','Validar o uso com pequenos lojistas e estruturar contas individuais. Pilotos e receita ainda não foram declarados.',['Validar com lojistas','Contas individuais','Fortalecer segurança'],'From technical proof\nto merchant adoption.','Validate the product with small merchants and establish individual accounts. No pilot or revenue has been declared.',['Merchant validation','Individual accounts','Security hardening']),
('ShimoPay','Payments that don’t stop\nwhen the network does.','Experimente o app. Consulte o código. Veja a prova on-chain.',['shimopay-mobile.vercel.app','github.com/dshimo0/shimopay','shimopay@pm.me'],'Payments that don’t stop\nwhen the network does.','Try the app. Review the source. Verify the on-chain proof.',['shimopay-mobile.vercel.app','github.com/dshimo0/shimopay','shimopay@pm.me'])]
def paragraph(c,text,x,y,width,size=24,bold=False,color=INK):
 style=ParagraphStyle('p',fontName='Bold' if bold else 'Body',fontSize=size,leading=size*1.28,textColor=HexColor(color))
 p=Paragraph(escape(text).replace('\n','<br/>'),style);_,height=p.wrap(width,H)
 p.drawOn(c,x,y-height);return height
for lang in ['pt-br','en-us']:
 out=ROOT/'public'/f'shimopay-pitch-{lang}.pdf';c=canvas.Canvas(str(out),pagesize=(W,H))
 c.setTitle('ShimoPay — Pitch Deck — '+lang.upper());c.setAuthor('ShimoPay');c.setSubject('Offline authorization. Solana settlement.')
 for i,s in enumerate(slides):
  label,pttitle,ptbody,ptcards,entitle,enbody,encards=s;title,body,cards=(pttitle,ptbody,ptcards) if lang=='pt-br' else (entitle,enbody,encards)
  c.setFillColor(HexColor(BG));c.rect(0,0,W,H,fill=1,stroke=0)
  c.drawImage(str(ROOT/'public/brand/app-icon.png'),56,632,56,56,mask='auto')
  paragraph(c,'ShimoPay',126,676,340,24,True)
  c.setStrokeColor(HexColor('#DFE5F1'));c.line(64,622,1216,622)
  paragraph(c,label if lang=='pt-br' else ('SHIMOPAY' if label=='ShimoPay' else f'{i:02d} · SHIMOPAY'),64,590,1100,14,True,MUTED)
  paragraph(c,title,64,548,1148,48,True)
  paragraph(c,body,64,388,1100,23,False,MUTED)
  for n,card in enumerate(cards):
   x=64+n*390;c.setFillColor(HexColor(SOFT));c.roundRect(x,134,372,104,18,fill=1,stroke=0)
   paragraph(c,card,x+22,199,328,18,True,BLUE)
  if i==6:
   paragraph(c,'Abrir transação no Explorer' if lang=='pt-br' else 'Open transaction in Explorer',64,110,800,16,True,BLUE);c.linkURL(PROOF,(64,86,600,116),relative=0)
  if i==11:
   for n,url in enumerate(['https://shimopay-mobile.vercel.app','https://github.com/dshimo0/shimopay','mailto:shimopay@pm.me']):c.linkURL(url,(64+n*390,134,436+n*390,238),relative=0)
  paragraph(c,'Ambiente Sandbox · shimopay@pm.me' if lang=='pt-br' else 'Sandbox environment · shimopay@pm.me',64,50,1050,12,False,MUTED)
  paragraph(c,f'{i+1:02d} / {len(slides):02d}',1136,50,110,12,False,MUTED);c.showPage()
 c.save();print(out)
