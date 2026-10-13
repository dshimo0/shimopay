import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { BikeSampaApp } from "@/components/miniapps/BikeSampaApp";
import { McDonaldsApp } from "@/components/miniapps/McDonaldsApp";
import { SplitBillApp } from "@/components/miniapps/SplitBillApp";
import { UberApp } from "@/components/miniapps/UberApp";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";
import { ShimoBottomNav } from "@/components/shimo/ShimoShell";
import { Transaction, useMock } from "@/contexts/MockContext";

type MiniAppId = "uber" | "food" | "bike" | "split";

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const CustomerHome = () => {
  const { user, transactions, receive, pay } = useMock();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [transferContact, setTransferContact] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeMiniApp, setActiveMiniApp] = useState<MiniAppId | null>(null);
  const [miniAppOpen, setMiniAppOpen] = useState(false);
  const [streetMode, setStreetMode] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const openMiniApp = (app: MiniAppId) => {
    setActiveMiniApp(app);
    setMiniAppOpen(true);
  };

  const toggleStreetMode = () => {
    const nextState = !streetMode;
    setStreetMode(nextState);

    if (nextState) {
      toast.warning("Modo Rua ativado", {
        description: "Simulação visual; não altera limites ou segurança reais.",
      });
    } else {
      toast.success("Modo Rua desativado", {
        description: "Limites principais restaurados.",
      });
    }
  };

  const handleAddMoney = () => {
    const parsedAmount = Number(amount);
    if (!parsedAmount) return;

    receive(parsedAmount, "Depósito via PIX");
    setAddMoneyOpen(false);
    setAmount("");
    toast.success(`${formatBRL(parsedAmount)} adicionados ao saldo.`);
  };

  const handleTransfer = () => {
    const parsedAmount = Number(amount);
    if (!parsedAmount || !transferContact) return;

    const success = pay(parsedAmount, transferContact);
    setTransferOpen(false);
    setAmount("");
    setTransferContact("");

    if (success) {
      toast.success(`Transferência enviada para ${transferContact}.`);
    } else {
      toast.error("Saldo insuficiente para essa transferência.");
    }
  };

  const openTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const lastTransactions = transactions.slice(0, 4);

  return (
    <div className="customer-home min-h-screen pb-24">
      <header className="px-5 pb-5 pt-6">
        <div className="app-brand-bar">
          <Link to="/" className="brand-lockup" aria-label="ShimoPay — apresentação"><ShimoMark /><span>ShimoPay</span></Link>
          <div className="flex items-center gap-2"><span className="demo-pill">Demonstração</span><Link to="/customer/profile" aria-label="Meu perfil" className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50"><ShimoSymbol name="profile" tone="plain" /></Link></div>
        </div>
        <div className="app-greeting"><h1>Olá, {user.name.split(" ")[0]}!</h1><p>Que bom te ver por aqui.</p></div>
        <section className="balance-panel" aria-label="Carteira demonstrativa">
          <div className="flex items-center justify-between"><span className="balance-label">Saldo demo</span><Link to="/customer/wallet" aria-label="Abrir carteira"><ShimoSymbol name="wallet" tone="plain" className="h-7 w-7" /></Link></div>
          <p className="balance-amount">{formatBRL(user.balance)}</p>
          <div className="balance-actions"><Link to="/customer/scanner"><ShimoSymbol name="pay" tone="plain" className="h-5 w-5 text-white" />Pagar</Link><Link to="/customer/qr"><ShimoSymbol name="receive" tone="plain" className="h-5 w-5" />Receber</Link></div>
        </section>
      </header>
      <main className="space-y-5 px-5">
        <section className="home-services">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold">Miniapps do seu dia a dia</h2><Link to="/customer/stores" className="text-xs font-semibold text-primary py-2">Ver todos</Link></div>
          <div className="grid grid-cols-4 gap-2">
            <ServiceButton symbol="food" label="Comida" onClick={() => openMiniApp("food")} />
            <ServiceButton symbol="ride" label="Mobilidade" onClick={() => openMiniApp("uber")} />
            <ServiceButton symbol="split" label="Dividir conta" onClick={() => openMiniApp("split")} />
            <Link to="/customer/stores" className="home-service"><ShimoSymbol name="store" tone="amber" className="h-14 w-14 rounded-2xl" /><span className="service-label">Lojas</span></Link>
          </div>
        </section>
        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">Atividade recente</h2>
            <Link to="/customer/history" className="text-sm font-semibold text-blue-900">
              Ver tudo
            </Link>
          </div>

          <div className="space-y-1">
            {lastTransactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">Nenhuma atividade recente.</div>
            ) : (
              lastTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={() => openTransactionDetails(transaction)}
                  className="flex w-full items-center justify-between rounded-2xl px-1 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ShimoSymbol
                      name={transaction.type === "sent" ? "pay" : "receive"}
                      tone={transaction.type === "sent" ? "rose" : "green"}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{transaction.name}</p>
                      <p className="text-xs text-slate-500">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${transaction.type === "sent" ? "text-rose-600" : "text-blue-700"}`}>
                    {transaction.type === "sent" ? "-" : "+"}
                    {formatBRL(Math.abs(transaction.amount))}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>
        <section className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
          <ActionTile symbol="add" title="Adicionar saldo" description="Simulação local" onClick={() => setAddMoneyOpen(true)} />
          <ActionTile symbol="send" title="Transferir" description="Entre contatos demo" onClick={() => setTransferOpen(true)} />
        </section>
        <details className="rounded-2xl bg-blue-50 p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Mais da sua carteira</summary>
          <div className="mt-4 space-y-3 text-xs leading-6 text-slate-600">
            <Link to="/customer/wallet" className="block text-primary underline">Conhecer o modo visitante</Link>
            <Link to="/customer/offline" className="block text-primary underline">Reserva offline simulada</Link>
            <button onClick={toggleStreetMode} aria-pressed={streetMode} className="block text-primary underline">{streetMode ? "Desativar" : "Explorar"} Modo Rua (demo)</button>
            <Link to="/customer/notifications" className="block text-primary underline">Notificações</Link>
            <button onClick={() => openMiniApp("bike")} className="block text-primary underline">Abrir miniapp de bike</button>
            <p>Os saldos e registros ficam neste navegador. Conversão, reserva offline e pagamentos são simulados.</p>
          </div>
        </details>
      </main>

      <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-6 pb-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <ShimoSymbol
                name="receipt"
                tone={selectedTransaction?.type === "sent" ? "rose" : "green"}
                className="mb-4 h-14 w-14 rounded-2xl"
              />
              <h3 className="text-[28px] font-semibold tracking-normal">
                {selectedTransaction?.type === "sent" ? "-" : "+"}
                {formatBRL(Math.abs(selectedTransaction?.amount || 0))}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedTransaction?.type === "sent" ? "Pagamento enviado" : "Pagamento recebido"}
              </p>
            </div>

            <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
              <ReceiptRow label={selectedTransaction?.type === "sent" ? "Para" : "De"} value={selectedTransaction?.name || "-"} />
              <ReceiptRow label="Data" value={selectedTransaction?.date || "-"} />
              <ReceiptRow label="Método" value={selectedTransaction?.method || "Saldo ShimoPay"} />
              <ReceiptRow label="ID" value={`SHIMO-${selectedTransaction?.id || "000"}-TX`} mono />
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-3xl border border-blue-900/10 bg-blue-50 p-4 text-blue-900">
              <ShimoSymbol name="check" className="h-8 w-8 rounded-xl bg-blue-100" />
              <div>
                <p className="text-sm font-semibold">Comprovante protegido</p>
                <p className="text-xs text-blue-800/70">Assinado no aparelho e sincronizado com a rede ShimoPay.</p>
              </div>
            </div>

            <Button className="mt-5 h-12 w-full rounded-2xl" onClick={() => toast.success("Comprovante pronto para compartilhar.")}>
              Compartilhar comprovante
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-5 pb-8">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle>Adicionar dinheiro</DrawerTitle>
              <DrawerDescription>Adicione um valor fictício à carteira deste navegador.</DrawerDescription>
            </DrawerHeader>
            <MoneyInput amount={amount} setAmount={setAmount} />
            <Button onClick={handleAddMoney} disabled={!amount} className="mt-5 h-12 w-full rounded-2xl">
              Adicionar saldo demo
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={transferOpen} onOpenChange={setTransferOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-5 pb-8">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle>Transferir</DrawerTitle>
              <DrawerDescription>Simule uma transferência no histórico local.</DrawerDescription>
            </DrawerHeader>
            <div className="space-y-4">
              <MoneyInput amount={amount} setAmount={setAmount} />
              <Input
                aria-label="Contato demo"
                placeholder="Nome do contato demo"
                value={transferContact}
                onChange={(event) => setTransferContact(event.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>
            <Button onClick={handleTransfer} disabled={!amount || !transferContact} className="mt-5 h-12 w-full rounded-2xl">
              Confirmar transferência
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={miniAppOpen} onOpenChange={setMiniAppOpen}>
        <DrawerContent className="h-[90vh] rounded-t-[24px]">
          <DrawerHeader className="sr-only"><DrawerTitle>Miniapp ShimoPay</DrawerTitle><DrawerDescription>Experiência demonstrativa, sem pedido externo.</DrawerDescription></DrawerHeader>
          {activeMiniApp === "uber" && <UberApp />}
          {activeMiniApp === "food" && <McDonaldsApp />}
          {activeMiniApp === "bike" && <BikeSampaApp />}
          {activeMiniApp === "split" && <SplitBillApp />}
        </DrawerContent>
      </Drawer>

      <ShimoBottomNav active="home" />
    </div>
  );
};

const ActionTile = ({
  symbol,
  title,
  description,
  onClick,
}: {
  symbol: ShimoSymbolName;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="rounded-3xl bg-white p-4 text-left shadow-sm transition active:scale-[0.98]">
    <ShimoSymbol name={symbol} tone="muted" className="mb-4" />
    <p className="text-sm font-semibold">{title}</p>
    <p className="mt-1 text-xs text-slate-500">{description}</p>
  </button>
);

const ServiceButton = ({ symbol, label, onClick }: { symbol: ShimoSymbolName; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="home-service">
    <ShimoSymbol name={symbol} tone={symbol === "food" ? "amber" : "blue"} className="h-14 w-14 rounded-2xl" />
    <span className="service-label">{label}</span>
  </button>
);

const MoneyInput = ({ amount, setAmount }: { amount: string; setAmount: (value: string) => void }) => (
  <div className="flex items-center justify-center gap-2 rounded-3xl bg-slate-50 px-4 py-5">
    <span className="text-xl font-semibold text-slate-400">R$</span>
    <Input
      aria-label="Valor em reais"
      type="number"
      placeholder="0,00"
      className="h-14 w-44 border-none bg-transparent p-0 text-center text-[30px] font-semibold shadow-none focus-visible:ring-0"
      autoFocus
      value={amount}
      onChange={(event) => setAmount(event.target.value)}
    />
  </div>
);

const ReceiptRow = ({ label, value, mono = false }: { label?: string; value: string; mono?: boolean }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className={`truncate text-right font-medium text-slate-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
  </div>
);

export default CustomerHome;
