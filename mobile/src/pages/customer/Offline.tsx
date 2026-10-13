import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";

const pendingPayments = [
  { id: "OFF-7291", merchant: "Padaria São José", amount: 18.5, status: "Aguardando sinal" },
  { id: "OFF-7288", merchant: "Bike Sampa", amount: 3.5, status: "Sincronizado" },
];

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const Offline = () => {
  const [reserveActive, setReserveActive] = useState(true);
  const [handshakeState, setHandshakeState] = useState<"idle" | "signing" | "done">("idle");

  const startHandshake = () => {
    setHandshakeState("signing");
    toast.info("Gerando comprovante offline...");

    window.setTimeout(() => {
      setHandshakeState("done");
      toast.success("Comprovante assinado no aparelho.");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-background pb-8 text-slate-950">
      <header className="px-5 pb-4 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <Link to="/customer/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Voltar">
              <ShimoSymbol name="back" className="h-5 w-5 rounded-none bg-transparent text-slate-800" />
            </Link>
          <div>
            <p className="text-xs font-medium text-slate-500">Pagamentos sem sinal</p>
            <h1 className="text-xl font-semibold tracking-tight">Reserva offline</h1>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
          <div className="absolute right-[-54px] top-[-42px] h-40 w-40 rounded-full border border-white/10" />
          <div className="relative mb-6 flex items-start justify-between gap-4">
            <div>
              <ShimoSymbol name="offline" className="mb-3 bg-blue-400 text-slate-950" />
              <p className="text-sm font-medium text-white/60">Disponível para pagar sem internet</p>
              <h2 className="mt-1 text-[30px] font-semibold leading-none tracking-normal">R$ 180,00</h2>
            </div>
            <button
              onClick={() => setReserveActive((value) => !value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                reserveActive ? "bg-blue-400 text-slate-950" : "bg-white/10 text-white"
              }`}
            >
              {reserveActive ? "Ativa" : "Pausada"}
            </button>
          </div>

          <div className="relative space-y-2">
            <div className="flex justify-between text-xs font-medium text-white/60">
              <span>Uso hoje</span>
              <span>R$ 22,00 de R$ 180,00</span>
            </div>
            <Progress value={12} className="h-2 bg-white/10" indicatorClassName="bg-blue-400" />
          </div>
        </section>
      </header>

      <main className="space-y-5 px-5">
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <ShimoSymbol name="security" tone="muted" />
            <div>
              <h2 className="text-base font-semibold tracking-tight">Como funciona</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                O app cria uma reserva com limite baixo. Na hora de pagar, o celular assina um comprovante e o lojista sincroniza depois.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <OfflineStep symbol="profile" label="Valida" />
            <OfflineStep symbol="receipt" label="Assina" />
            <OfflineStep symbol="sync" label="Sincroniza" />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Teste de pagamento</h2>
              <p className="text-sm text-slate-500">Simule um pagamento offline de R$ 18,50.</p>
            </div>
            <ShimoSymbol name="offline" tone="muted" />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShimoSymbol name="services" className="bg-white text-slate-800 shadow-sm" />
                <div>
                  <p className="text-sm font-semibold">Padaria São José</p>
                  <p className="text-xs text-slate-500">Terminal autorizado</p>
                </div>
              </div>
              <p className="text-sm font-semibold">R$ 18,50</p>
            </div>

            <Button
              onClick={startHandshake}
              disabled={!reserveActive || handshakeState === "signing"}
              className="mt-4 h-12 w-full rounded-2xl"
            >
              {handshakeState === "signing" && <ShimoSymbol name="sync" className="mr-2 h-5 w-5 animate-spin rounded-none bg-transparent" />}
              {handshakeState === "done" && <ShimoSymbol name="check" className="mr-2 h-5 w-5 rounded-none bg-transparent" />}
              {handshakeState === "idle" && "Assinar comprovante offline"}
              {handshakeState === "signing" && "Assinando no aparelho"}
              {handshakeState === "done" && "Comprovante pronto"}
            </Button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold tracking-tight">Fila de sincronização</h2>
          <div className="space-y-2">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold">{payment.merchant}</p>
                  <p className="text-xs text-slate-500">{payment.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatBRL(payment.amount)}</p>
                  <p className="text-xs text-slate-500">{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <div className="flex gap-3">
            <ShimoSymbol name="security" tone="amber" className="mt-0.5 h-8 w-8 rounded-xl" />
            <div>
              <h2 className="text-sm font-semibold">Limites protegem a conta</h2>
              <p className="mt-1 text-sm leading-5 text-amber-900/75">
                Pagamento offline é feito para valores pequenos. Para compras maiores, o app pede internet ou biometria reforçada.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center text-xs font-medium text-slate-400">
          Reserva expira em 6h e renova quando o app voltar online.
        </div>
      </main>
    </div>
  );
};

const OfflineStep = ({ symbol, label }: { symbol: ShimoSymbolName; label: string }) => (
  <div className="rounded-2xl bg-slate-50 p-3 text-center">
    <ShimoSymbol name={symbol} className="mx-auto mb-2 bg-white text-slate-800 shadow-sm" />
    <p className="text-xs font-semibold text-slate-700">{label}</p>
  </div>
);

export default Offline;
