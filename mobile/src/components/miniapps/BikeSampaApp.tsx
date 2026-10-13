import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ShimoSymbol } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";

export const BikeSampaApp = () => {
  const { pay } = useMock();
  const [unlocked, setUnlocked] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!unlocked) return;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [unlocked]);

  const handleUnlock = () => {
    const success = pay(3.5, "Bike Sampa", "Saldo ShimoPay");
    if (success) {
      toast.success("Bicicleta desbloqueada.");
      setUnlocked(true);
    } else {
      toast.error("Saldo insuficiente para desbloqueio.");
    }
  };

  const handleReturn = () => {
    setUnlocked(false);
    setSeconds(0);
    toast.success("Bicicleta devolvida.");
  };

  const timer = new Date(seconds * 1000).toISOString().substring(11, 19);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="absolute inset-0 bg-amber-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a10_1px,transparent_1px),linear-gradient(to_bottom,#0f172a10_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute left-0 top-1/4 h-24 w-full -skew-y-6 bg-blue-100/60" />
        <div className="absolute bottom-1/3 right-0 h-full w-2/3 skew-x-12 bg-white/50" />
        <Station left="25%" top="33%" label="Estação 12" />
        <Station left="66%" top="50%" label="Você está aqui" active />
        <Station left="34%" top="72%" label="Sem bikes" muted />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg">
            <ShimoSymbol name="bike" tone="amber" />
            <div>
              <h2 className="text-sm font-semibold">Bike Sampa</h2>
              <p className="text-xs text-slate-500">Mobilidade pública</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-lg">
            <ShimoSymbol name="map" className="h-6 w-6 rounded-none bg-transparent text-blue-700" />
          </div>
        </header>

        <section className="rounded-[30px] bg-white p-5 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]">
          {unlocked ? (
            <div className="space-y-4 text-center">
              <ShimoSymbol name="clock" tone="green" className="mx-auto h-16 w-16 rounded-[24px]" />
              <div>
                <h3 className="text-xl font-semibold text-blue-800">Em uso</h3>
                <p className="text-sm text-slate-500">Aproveite o passeio.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 py-3 font-mono text-2xl font-semibold text-slate-700">{timer}</div>
              <Button className="h-12 w-full rounded-2xl bg-rose-600 hover:bg-rose-700" onClick={handleReturn}>
                Devolver bike
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Estação Paulista</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">Av. Paulista, 1500</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-amber-700">8</span>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Bikes disp.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PlanCard title="Avulso" price="R$ 3,50" detail="15 min" active />
                <PlanCard title="Diário" price="R$ 12,90" detail="24h" />
              </div>

              <Button className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90" onClick={handleUnlock}>
                Desbloquear
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const Station = ({ left, top, label, active = false, muted = false }: { left: string; top: string; label: string; active?: boolean; muted?: boolean }) => (
  <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left, top }}>
    <div className="mb-1 rounded-full bg-white p-1 shadow-md">
      <div className={`rounded-full p-2 text-white ${active ? "bg-blue-600" : muted ? "bg-slate-400" : "bg-amber-600"}`}>
        <ShimoSymbol name="bike" className="h-4 w-4 rounded-none bg-transparent text-white" />
      </div>
    </div>
    <div className={`rounded bg-white px-2 py-1 text-[10px] font-semibold shadow ${active ? "text-blue-700" : "text-slate-600"}`}>{label}</div>
  </div>
);

const PlanCard = ({ title, price, detail, active = false }: { title: string; price: string; detail: string; active?: boolean }) => (
  <div className={`rounded-2xl border p-3 text-center ${active ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white"}`}>
    <span className={`block text-xs font-bold ${active ? "text-amber-700" : "text-slate-400"}`}>{title}</span>
    <span className="mt-1 block text-lg font-semibold text-slate-900">{price}</span>
    <span className="block text-[10px] text-slate-500">{detail}</span>
  </div>
);
