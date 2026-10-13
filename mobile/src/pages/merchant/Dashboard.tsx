import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DIDHandshake } from "@/components/DIDHandshake";
import { ResellerCatalogApp } from "@/components/miniapps/ResellerCatalogApp";
import { ShimoQrCode } from "@/components/shimo/ShimoQrCode";
import { ShimoQrMark, ShimoScreen } from "@/components/shimo/ShimoShell";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";
import { Transaction, useMock } from "@/contexts/MockContext";
import { buildCurrentPixPayload, getPixConfig, isPlaceholderKey } from "@/lib/pixConfig";

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const MerchantDashboard = () => {
  const { user, transactions, receive } = useMock();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [showHandshake, setShowHandshake] = useState(false);
  const [qrGenOpen, setQrGenOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState([5]);
  const [reportPeriod, setReportPeriod] = useState("today");

  const recentSales = transactions.filter((transaction) => transaction.type === "received");
  const totalSales = recentSales.reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0);
  const salesCount = recentSales.length;
  const ticket = salesCount ? totalSales / salesCount : 0;

  const reportData = useMemo(() => {
    switch (reportPeriod) {
      case "7days":
        return { sales: 89210.5, ticket: 42.1, count: 2118 };
      case "30days":
        return { sales: 345890, ticket: 44.5, count: 7772 };
      default:
        return { sales: Math.max(totalSales, 15430), ticket: Math.max(ticket, 45), count: Math.max(salesCount, 342) };
    }
  }, [reportPeriod, salesCount, ticket, totalSales]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleReceive = () => {
    if (!amount) return;
    setShowHandshake(true);
  };

  const completeReceive = () => {
    receive(Number(amount), "Cliente offline", "Offline assinado");
    setShowHandshake(false);
    setChargeOpen(false);
    setAmount("");
    toast.success("Pagamento offline recebido e sincronizado.");
  };

  const handleGenerateQr = () => {
    if (!amount) return;
    setGeneratedQr(amount);
    toast.success("QR de cobrança gerado.");
  };

  // BR Code Pix real com valor; null quando a chave configurada e invalida.
  const chargePayload = generatedQr ? buildCurrentPixPayload(Number(generatedQr)) : null;

  const openTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const stats: Array<{ label: string; value: string; symbol: ShimoSymbolName; trend: string; action: () => void }> = [
    { label: "Vendas hoje", value: formatBRL(totalSales), symbol: "cash", trend: "+12,5%", action: () => setReportsOpen(true) },
    { label: "Transações", value: String(salesCount), symbol: "receipt", trend: "+8,3%", action: () => setTransactionsOpen(true) },
    { label: "Clientes", value: "127", symbol: "users", trend: "+5,2%", action: () => setCatalogOpen(true) },
    { label: "Ticket médio", value: formatBRL(ticket || 66.22), symbol: "chart", trend: "+3,1%", action: () => setReportsOpen(true) },
  ];

  const quickActions: Array<{ label: string; symbol: ShimoSymbolName; tone: "green" | "blue" | "amber" | "muted"; action: () => void }> = [
    { label: "Gerar QR", symbol: "receive", tone: "green", action: () => setQrGenOpen(true) },
    { label: "Receber offline", symbol: "offline", tone: "amber", action: () => setChargeOpen(true) },
    { label: "Relatórios", symbol: "report", tone: "blue", action: () => setReportsOpen(true) },
    { label: "Catálogo", symbol: "package", tone: "muted", action: () => setCatalogOpen(true) },
  ];

  return (
    <ShimoScreen className="pb-24">
      <header className="px-5 pb-5 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShimoMark />
            <div>
              <p className="text-xs font-medium text-slate-500">Painel do lojista</p>
              <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" onClick={() => setSettingsOpen(true)} aria-label="Ajustes">
            <ShimoSymbol name="settings" className="h-6 w-6 rounded-none bg-transparent text-slate-800" />
          </button>
        </div>

        <section className="relative overflow-hidden rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
          <div className="absolute right-[-56px] top-[-48px] h-40 w-40 rounded-full border border-white/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200/75">Recebimento</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-none tracking-normal">{formatBRL(totalSales)}</h2>
              <p className="mt-2 text-sm text-white/55">Vendas recentes com QR, saldo Shimo e offline.</p>
            </div>
            <ShimoQrMark className="h-24 w-24 shrink-0 rounded-[24px] p-2" />
          </div>
        </section>
      </header>

      <main className="space-y-6 px-5">
        <section className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <button key={stat.label} className="rounded-3xl bg-white p-4 text-left shadow-sm active:scale-[0.99]" onClick={stat.action}>
              <div className="mb-4 flex items-start justify-between">
                <ShimoSymbol name={stat.symbol} tone="green" />
                <span className="text-xs font-semibold text-blue-700">{stat.trend}</span>
              </div>
              <p className="truncate text-xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
            </button>
          ))}
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">Ações rápidas</h2>
            <span className="text-xs font-semibold text-slate-500">Caixa</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button key={action.label} className="rounded-2xl bg-slate-50 p-4 text-left active:scale-[0.99]" onClick={action.action}>
                <ShimoSymbol name={action.symbol} tone={action.tone} className="mb-3" />
                <span className="text-sm font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">Vendas recentes</h2>
            <button className="text-sm font-semibold text-blue-900" onClick={() => setTransactionsOpen(true)}>
              Ver tudo
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Nenhuma venda hoje.</div>
          ) : (
            <div className="space-y-1">
              {recentSales.slice(0, 5).map((sale) => (
                <button key={sale.id} className="flex w-full items-center justify-between rounded-2xl px-1 py-3 text-left hover:bg-slate-50" onClick={() => openTransactionDetails(sale)}>
                  <div className="flex min-w-0 items-center gap-3">
                    <ShimoSymbol name="receive" tone="green" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{sale.name}</p>
                      <p className="text-xs text-slate-500">{sale.date}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-blue-700">+{formatBRL(Math.abs(sale.amount))}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <ReceiptDrawer open={detailsOpen} onOpenChange={setDetailsOpen} transaction={selectedTransaction} />

      <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receber offline</DialogTitle>
            <DialogDescription>Digite o valor e confirme a assinatura offline com o aparelho do cliente.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {showHandshake ? (
              <DIDHandshake onComplete={completeReceive} />
            ) : (
              <MoneyInput amount={amount} setAmount={setAmount} />
            )}
          </div>
          <DialogFooter>{!showHandshake && <Button onClick={handleReceive} disabled={!amount} className="w-full rounded-2xl">Confirmar recebimento</Button>}</DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer
        open={qrGenOpen}
        onOpenChange={(open) => {
          setQrGenOpen(open);
          if (!open) setGeneratedQr(null);
        }}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-5 pb-8">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle>Cobrar com QR</DrawerTitle>
              <DrawerDescription>Valor fixo para balcão, mesa ou link rápido.</DrawerDescription>
            </DrawerHeader>

            {!generatedQr ? (
              <div className="space-y-5">
                <MoneyInput amount={amount} setAmount={setAmount} />
                <Button onClick={handleGenerateQr} disabled={!amount} className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90">
                  Gerar QR
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                {chargePayload ? (
                  <>
                    <ShimoQrCode
                      value={chargePayload}
                      label="QR Code Pix de cobrança com valor"
                      className="mb-5 aspect-square w-56"
                    />
                    <Badge
                      variant="outline"
                      className={`rounded-full ${
                        isPlaceholderKey(getPixConfig())
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                      }`}
                    >
                      {isPlaceholderKey(getPixConfig()) ? "Demonstrativo (chave Pix placeholder)" : "Pix pagável com valor"}
                    </Badge>
                  </>
                ) : (
                  <ShimoQrMark className="mb-5 h-40 w-40 rounded-[34px]" />
                )}
                <p className="text-[28px] font-semibold tracking-normal">{formatBRL(Number(generatedQr))}</p>
                <p className="mt-2 text-sm text-slate-500">Cliente escaneia e paga pelo banco dele.</p>
                <Button
                  className="mt-6 h-12 w-full rounded-2xl bg-primary hover:bg-primary/90"
                  onClick={async () => {
                    if (!chargePayload) {
                      toast.error("Configure a chave Pix no portal admin.");
                      return;
                    }
                    try {
                      await navigator.clipboard.writeText(chargePayload);
                      toast.success("Pix copia-e-cola copiado.");
                    } catch {
                      toast.error("Não foi possível copiar neste navegador.");
                    }
                  }}
                >
                  Copiar Pix copia-e-cola
                </Button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={reportsOpen} onOpenChange={setReportsOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md p-5 pb-8">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle>Relatórios</DrawerTitle>
              <DrawerDescription>Desempenho do negócio por período.</DrawerDescription>
            </DrawerHeader>

            <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
              {[
                ["today", "Hoje"],
                ["7days", "7 dias"],
                ["30days", "30 dias"],
              ].map(([id, label]) => (
                <button key={id} className={`rounded-xl py-2 text-xs font-semibold ${reportPeriod === id ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`} onClick={() => setReportPeriod(id)}>
                  {label}
                </button>
              ))}
            </div>

            <section className="rounded-[30px] bg-primary p-5 text-white">
              <p className="text-sm text-white/55">Faturamento</p>
              <p className="mt-2 text-[30px] font-semibold leading-none tracking-normal">{formatBRL(reportData.sales)}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <ReportMini label="Ticket" value={formatBRL(reportData.ticket)} />
                <ReportMini label="Vendas" value={String(reportData.count)} />
              </div>
            </section>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button className="h-12 rounded-2xl bg-primary hover:bg-primary/90" onClick={() => toast.success("Relatório PDF enviado.")}>PDF</Button>
              <Button variant="outline" className="h-12 rounded-2xl bg-white" onClick={() => toast.success("CSV pronto.")}>CSV</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={transactionsOpen} onOpenChange={setTransactionsOpen}>
        <DrawerContent className="h-[72vh]">
          <div className="mx-auto flex h-full w-full max-w-md flex-col p-5">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle>Transações</DrawerTitle>
            </DrawerHeader>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-8">
              {transactions.map((transaction) => (
                <button key={transaction.id} className="flex w-full items-center justify-between rounded-3xl bg-white p-4 text-left shadow-sm" onClick={() => openTransactionDetails(transaction)}>
                  <div className="flex min-w-0 items-center gap-3">
                    <ShimoSymbol name={transaction.type === "sent" ? "pay" : "receive"} tone={transaction.type === "sent" ? "rose" : "green"} />
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
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DrawerContent className="h-[86vh]">
          <div className="mx-auto flex h-full w-full max-w-md flex-col p-5">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle>Ajustes do lojista</DrawerTitle>
              <DrawerDescription>Conta, recebimentos e loja integrada.</DrawerDescription>
            </DrawerHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-8">
              <section className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <ShimoSymbol name="merchant" tone="amber" />
                  <div>
                    <h3 className="text-sm font-semibold">Padaria Central</h3>
                    <p className="text-xs text-slate-500">Alimentação · aberta</p>
                  </div>
                </div>
                <Input className="h-12 rounded-2xl" defaultValue="Padaria Central" />
              </section>

              <section className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShimoSymbol name="gift" tone="green" />
                    <span className="text-sm font-semibold">Cashback automático</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Retorno ao cliente</span>
                  <span className="text-xl font-semibold">{loyaltyPoints[0]}%</span>
                </div>
                <Slider value={loyaltyPoints} max={20} step={1} onValueChange={setLoyaltyPoints} />
              </section>

              <section className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <ShimoSymbol name="security" tone="green" />
                  <div>
                    <h3 className="text-sm font-semibold">Segurança do caixa</h3>
                    <p className="text-xs text-slate-500">PIN, biometria e impressora.</p>
                  </div>
                </div>
                <SettingRow label="Biometria no recebimento" checked />
                <SettingRow label="Impressora Bluetooth" />
                <SettingRow label="Som de confirmação" checked />
              </section>

              <Button variant="outline" className="h-12 w-full rounded-2xl bg-white" onClick={() => setCatalogOpen(true)}>
                Abrir catálogo integrado
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DrawerContent className="h-[95vh]">
          <ResellerCatalogApp onBack={() => setCatalogOpen(false)} />
        </DrawerContent>
      </Drawer>

      <MerchantNav
        onReceive={() => setChargeOpen(true)}
        onReports={() => setReportsOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />
    </ShimoScreen>
  );
};

const MoneyInput = ({ amount, setAmount }: { amount: string; setAmount: (value: string) => void }) => (
  <div className="flex items-center justify-center gap-2 rounded-3xl bg-slate-50 px-4 py-5">
    <span className="text-xl font-semibold text-slate-400">R$</span>
    <Input
      type="number"
      placeholder="0,00"
      className="h-14 w-44 border-none bg-transparent p-0 text-center text-[30px] font-semibold shadow-none focus-visible:ring-0"
      autoFocus
      value={amount}
      onChange={(event) => setAmount(event.target.value)}
    />
  </div>
);

const ReportMini = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-white/10 p-3">
    <p className="text-xs text-white/55">{label}</p>
    <p className="mt-1 text-sm font-semibold">{value}</p>
  </div>
);

const SettingRow = ({ label, checked = false }: { label: string; checked?: boolean }) => (
  <div className="flex items-center justify-between border-t border-slate-100 py-3 first:border-t-0">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <Switch defaultChecked={checked} />
  </div>
);

const ReceiptDrawer = ({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent>
      <div className="mx-auto w-full max-w-sm p-6 pb-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <ShimoSymbol name="receipt" tone="green" className="mb-4 h-14 w-14 rounded-2xl" />
          <h3 className="text-[28px] font-semibold tracking-normal">{formatBRL(Math.abs(transaction?.amount || 0))}</h3>
          <p className="mt-1 text-sm text-blue-700">Pagamento confirmado</p>
        </div>

        <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
          <ReceiptRow label="Cliente" value={transaction?.name || "-"} />
          <ReceiptRow label="Data" value={transaction?.date || "-"} />
          <ReceiptRow label="Método" value={transaction?.method || "ShimoPay QR"} />
          <ReceiptRow label="ID" value={`SHIMO-${transaction?.id || "000"}-MER`} mono />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-3xl border border-blue-900/10 bg-blue-50 p-4 text-blue-900">
          <ShimoSymbol name="check" className="h-8 w-8 rounded-xl bg-blue-100" />
          <div>
            <p className="text-sm font-semibold">Recibo assinado</p>
            <p className="text-xs text-blue-800/70">Pronto para compartilhar ou imprimir.</p>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
);

const ReceiptRow = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className={`truncate text-right font-medium text-slate-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
  </div>
);

const MerchantNav = ({
  onReceive,
  onReports,
  onSettings,
}: {
  onReceive: () => void;
  onReports: () => void;
  onSettings: () => void;
}) => {
  const items: Array<{ label: string; symbol: ShimoSymbolName; active?: boolean; onClick?: () => void }> = [
    { label: "Início", symbol: "chart", active: true },
    { label: "Receber", symbol: "receive", onClick: onReceive },
    { label: "Relatórios", symbol: "report", onClick: onReports },
    { label: "Ajustes", symbol: "settings", onClick: onSettings },
  ];

  return (
    <nav className="fixed bottom-0 z-50 w-full max-w-[430px] border-t border-slate-200 bg-white/95 px-5 pb-5 pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-center justify-between">
        {items.map((item) => (
          <button key={item.label} className={`flex w-20 flex-col items-center gap-1 ${item.active ? "text-slate-950" : "text-slate-400"}`} onClick={item.onClick}>
            <ShimoSymbol name={item.symbol} className={`h-8 w-8 rounded-xl ${item.active ? "bg-blue-100 text-blue-900" : "bg-transparent"}`} />
            <span className="text-[11px] font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MerchantDashboard;
