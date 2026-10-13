# Localnet engineering demonstration (two minutes)

This first walkthrough uses local development tokens, a 30 USDC allowance and a real local validator. The real-rails walkthrough below uses official Circle Devnet USDC and a 50 USDC allowance only after external funding and deployment proof.

0–15s: “Payments normally fail when connectivity fails.” Open `/demo`; point to the cluster badge and Solana Proof panel.

15–35s: Fund wallet: mint 100 development SPL tokens and reserve 50 on-chain. Show reserve signature. Enter an offline password, enable the 30 USDC / 24-hour allowance and show its PDA/signature.

35–65s: Simulate offline. “This user has previously reserved funds on Solana and provisioned a limited device key.” Create a R$25 charge. Pay offline; receive and validate the payload. Show **OFFLINE VERIFIED**, **Network blocked: TRUE**, and zero application RPC calls.

65–85s: “Nothing touched the blockchain here. The payment was authorized locally using a limited session key.” Merchant shows payment accepted, pending settlement. Explain that isolated offline acceptance retains bounded counterparty risk until settlement.

85–110s: Restore connectivity and settle. “Once connectivity returns, the signed intent is reconciled against the Solana reserve.” Show **SETTLED ON SOLANA**, 4.545455 tokens, merchant balance, confirmed signature and Explorer link. Run Test replay and Test tamper.

110–120s: “ShimoPay separates authorization from settlement, allowing money to keep moving even when the network doesn’t.” Final tagline: **Payments that don’t stop when the network does.**

For real offline verification: visit once online, establish allowance, disconnect browser networking, reload the PWA, unlock, sign and accept. Network is needed only to provision and later settle. Do not claim Solana runs offline.

### Transaction history

After settlement, click **Transaction history** on the merchant side. Show the confirmed transaction signature, slot and timestamp. On Devnet, open **View transaction in Devnet Explorer** and **Reserve history in Devnet Explorer**. Open the demo in another browser to demonstrate retrieval from the on-chain reserve instead of the prior device's payment queue. While offline, show the cached history and disabled refresh button. Localnet has no publicly accessible Devnet transactions.

## Real-rails 90-second script / Roteiro de 90 segundos

Prerequisite: use the displayed cluster honestly. Public Circle proof requires a funded Devnet deployment; localnet is engineering evidence only. Choose Português/English in the header. Enter a 10+ character password before **Start 90-second demo / Iniciar demo de 90 segundos**; this button provisions funds/allowance only when needed and prepares R$25. The password is never generated invisibly or published as a production secret.

| Time | pt-BR | en-US |
|---|---|---|
| 0–15s | “Pagamentos normalmente falham quando a conexão cai.” Mostre saldo e reserva confirmada. | “Payments normally fail when connectivity fails.” Show balance and confirmed reserve. |
| 15–30s | “A chave deste dispositivo só pode gastar o valor reservado, por tempo limitado.” Mostre limite e cotação assinada. | “This device key has limited authority over reserved funds.” Show allowance and signed cached quote. |
| 30–50s | Simule offline, cobre R$25 e pague. “Nenhuma chamada à blockchain ocorreu.” Valide localmente. | Go offline, charge R$25 and pay. “Nothing touched the blockchain here.” Verify locally. |
| 50–65s | “Autorizado offline. Liquidação pendente.” Mostre histórico com horário de autorização. | “Authorized offline. Pending settlement.” Show recorded authorization time. |
| 65–85s | Conecte somente o merchant e liquide. “Basta um lado recuperar a conexão.” Mostre delta USDC e assinatura. | Connect only the merchant and settle. “Only one side needs connectivity.” Show USDC delta and signature. |
| 85–90s | Na Devnet, abra a transação pública. “ShimoPay separa autorização e liquidação.” | On Devnet, open the public transaction. “ShimoPay separates authorization from settlement.” |

Separate Pix demonstration: expand Add money/Pix sandbox, create R$100 provider request, show actual provider QR and poll status. If not configured or provider refuses test Pix, show that limitation. Never mark it paid manually. This does not fund the USDC wallet; conversion is simulated/not implemented as a transfer.

## Online payment — 20 seconds / Pagamento online — 20 segundos

After test funding, set merchant amount to R$25. Click **Pay online on-chain / Pagar online on-chain**. Show pending then confirmed, transaction signature and merchant balance +4.545455 USDC. Open Transactions: the direct transfer appears in online receipts and wallet token-account history. Show that escrow and offline allowance did not change. Then demonstrate the separate offline authorization/escrow settlement flow. This is a real SPL transfer on the displayed test network; Localnet is not public Devnet evidence.
