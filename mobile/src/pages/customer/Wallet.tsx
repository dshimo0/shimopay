import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const Wallet = () => {
  const { user } = useMock();
  const [hideValues, setHideValues] = useState(false);
  const [autoConvert, setAutoConvert] = useState(true);

  const assets: Array<{
    id: string;
    name: string;
    detail: string;
    value: string;
    symbol: ShimoSymbolName;
    tone: "green" | "blue" | "amber";
  }> = [
    {
      id: "brl",
      name: "Saldo Brasil",
      detail: "PIX, QR, aproximação e offline",
      value: formatBRL(user?.balance || 0),
      symbol: "cash",
      tone: "green",
    },
    {
      id: "global",
      name: "Saldo de viagem",
      detail: "USDC/USDT para visitante",
      value: "US$ 245.50",
      symbol: "global",
      tone: "blue",
    },
    {
      id: "benefits",
      name: "Benefícios",
      detail: "Cashback e créditos de parceiros",
      value: formatBRL(127.8),
      symbol: "check",
      tone: "amber",
    },
  ];

  const cards = [
    { id: 1, name: "Cartão ShimoPay", last4: "8829", status: "Ativo" },
    { id: 2, name: "Virtual para apps", last4: "1234", status: "Online" },
  ];

  const handleAutoConvertToggle = (checked: boolean) => {
    setAutoConvert(checked);
    toast.success(checked ? "Conversão no pagamento ativada." : "Conversão no pagamento pausada.");
  };

  return (
    <div className="min-h-screen bg-background pb-8 text-slate-950">
      <header className="sticky top-0 z-10 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/customer/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Voltar">
                <ShimoSymbol name="back" className="h-5 w-5 rounded-none bg-transparent text-slate-800" />
              </Link>
            <div>
              <p className="text-xs font-medium text-slate-500">Dinheiro e métodos</p>
              <h1 className="text-xl font-semibold tracking-tight">Carteira</h1>
            </div>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
            onClick={() => setHideValues((value) => !value)}
            aria-label="Alternar visibilidade dos valores"
          >
            <ShimoSymbol name="wallet" className="h-6 w-6 rounded-none bg-transparent text-slate-800" />
          </button>
        </div>

        <section className="relative overflow-hidden rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
          <div className="absolute right-[-48px] top-[-52px] h-40 w-40 rounded-full border border-white/10" />
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/50">Total demonstrativo</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-none tracking-normal">{hideValues ? "R$ •••••" : "R$ 4.230,45"}</h2>
            </div>
            <ShimoMark className="bg-white/10" />
          </div>
          <div className="relative grid grid-cols-3 gap-2">
            <WalletAction symbol="add" label="Entrar" />
            <WalletAction symbol="send" label="Enviar" />
            <WalletAction symbol="sync" label="Trocar" />
          </div>
        </section>
      </header>

      <main className="space-y-5 px-5">
        <section className="rounded-3xl border border-sky-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <ShimoSymbol name="global" tone="blue" />
              <div>
                <h2 className="text-base font-semibold tracking-tight">Modo visitante</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Conceito em validação: usar stablecoins e receber em reais no comércio. Cotação e saldos simulados, sem conversão, transferência ou integração Solana ativa.
                </p>
              </div>
            </div>
            <Switch checked={autoConvert} onCheckedChange={handleAutoConvertToggle} />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <RateRow label="Cotação simulada" value="1 USDC = R$ 5,08" />
            <RateRow label="Limite inicial" value="R$ 1.500,00 por dia" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold tracking-tight">Saldos</h2>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <ShimoSymbol name={asset.symbol} tone={asset.tone} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{asset.name}</p>
                    <p className="truncate text-xs text-slate-500">{asset.detail}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{hideValues ? "••••" : asset.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShimoSymbol name="security" tone="green" className="h-8 w-8 rounded-xl" />
            <h2 className="text-base font-semibold tracking-tight">Segurança da carteira</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SecurityItem title="Offline" value="R$ 180" />
            <SecurityItem title="Modo Rua" value="R$ 150" />
            <SecurityItem title="Biometria" value="Ativa" />
            <SecurityItem title="Dispositivo" value="Confiável" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold tracking-tight">Cartões</h2>
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="relative overflow-hidden rounded-3xl bg-primary p-5 text-white shadow-sm">
                <div className="absolute right-[-32px] top-[-32px] h-28 w-28 rounded-full border border-white/10" />
                <div className="relative mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{card.name}</p>
                    <p className="mt-1 text-xs text-white/50">{card.status}</p>
                  </div>
                  <ShimoSymbol name="card" className="bg-white/10 text-white" />
                </div>
                <p className="relative font-mono text-lg tracking-widest">•••• •••• •••• {card.last4}</p>
              </div>
            ))}
            <Button variant="outline" className="h-12 w-full rounded-2xl border-dashed bg-white">
              Adicionar método
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

const WalletAction = ({ symbol, label }: { symbol: ShimoSymbolName; label: string }) => (
  <Button className="h-11 rounded-2xl bg-white/10 text-white hover:bg-white/15">
    <ShimoSymbol name={symbol} className="mr-1.5 h-5 w-5 rounded-none bg-transparent" />
    {label}
  </Button>
);

const RateRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const SecurityItem = ({ title, value }: { title: string; value: string }) => (
  <div className="rounded-2xl bg-slate-50 p-3">
    <p className="text-xs font-medium text-slate-500">{title}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export default Wallet;
