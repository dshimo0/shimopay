import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShimoSymbol } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";

export const UberApp = () => {
  const { pay } = useMock();
  const [step, setStep] = useState<"search" | "ride_select" | "searching" | "arrived">("search");
  const [destination, setDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState<string | null>(null);

  const rides = [
    { id: "x", name: "Compacto", price: 14.9, time: "4 min" },
    { id: "black", name: "Executivo", price: 22.5, time: "6 min" },
    { id: "flash", name: "Entrega rápida", price: 12, time: "3 min" },
  ];

  useEffect(() => {
    if (step !== "searching") return;
    const timeout = window.setTimeout(() => {
      setStep("arrived");
      toast.success("Motorista Carlos chegou.");
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, [step]);

  const handleRequest = () => {
    if (!selectedRide) return;
    const ride = rides.find((item) => item.id === selectedRide);
    if (!ride) return;

    const success = pay(ride.price, "Corridas", "Saldo ShimoPay");
    if (success) {
      setStep("searching");
      toast.success("Pagamento autorizado. Buscando motorista.");
    } else {
      toast.error("Saldo insuficiente.");
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[#edf3ec]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a12_1px,transparent_1px),linear-gradient(to_bottom,#0f172a12_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute left-[-20%] top-1/4 h-12 w-[140%] -rotate-12 rounded-full bg-white/70" />
        <div className="absolute right-[-10%] top-1/2 h-10 w-[120%] rotate-12 rounded-full bg-white/70" />
        <div className="absolute left-[55%] top-[38%] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
          <ShimoSymbol name="ride" className="h-6 w-6 rounded-none bg-transparent text-white" />
        </div>
        <div className="absolute left-[35%] top-[62%] h-4 w-4 rounded-full border-4 border-white bg-blue-500 shadow" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end">
        {step === "search" && (
          <section className="rounded-t-[30px] bg-white p-5 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-semibold tracking-tight">Para onde vamos?</h2>
            <div className="mt-4 space-y-3">
              <RouteRow label="Local atual" value="Av. Paulista, 1000" active />
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="h-3 w-3 rounded-sm bg-primary" />
                <Input
                  placeholder="Digite o destino"
                  className="h-auto border-none bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                />
              </div>
              <Button className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90" onClick={() => setStep("ride_select")} disabled={!destination}>
                Buscar
              </Button>
            </div>
          </section>
        )}

        {step === "ride_select" && (
          <section className="rounded-t-[30px] bg-white p-5 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]">
            <h3 className="text-lg font-semibold tracking-tight">Escolha a viagem</h3>
            <div className="mb-5 mt-3 space-y-2">
              {rides.map((ride) => (
                <button
                  key={ride.id}
                  className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left ${
                    selectedRide === ride.id ? "border-slate-950 bg-slate-50" : "border-transparent hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedRide(ride.id)}
                >
                  <div className="flex items-center gap-3">
                    <ShimoSymbol name={ride.id === "flash" ? "package" : "ride"} tone="muted" />
                    <div>
                      <p className="text-sm font-semibold">{ride.name}</p>
                      <p className="text-xs text-slate-500">{ride.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">R$ {ride.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-50 p-3 text-xs font-semibold text-blue-900">
              <span>ShimoPay selecionado</span>
              <span>5% cashback</span>
            </div>
            <Button className="h-12 w-full rounded-2xl bg-primary hover:bg-primary/90" onClick={handleRequest} disabled={!selectedRide}>
              Confirmar corrida
            </Button>
          </section>
        )}

        {(step === "searching" || step === "arrived") && (
          <section className="rounded-t-[30px] bg-white p-5 text-center shadow-[0_-8px_30px_rgba(15,23,42,0.12)]">
            {step === "searching" ? (
              <div className="py-8">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-slate-950 border-t-transparent" />
                <h3 className="text-lg font-semibold tracking-tight">Buscando motorista</h3>
                <p className="mt-1 text-sm text-slate-500">Próximo a você</p>
              </div>
            ) : (
              <div className="py-2">
                <div className="mb-6 flex items-center justify-between text-left">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">Chegando em 2 min</h3>
                    <p className="text-sm text-slate-500">Carlos · 4.9</p>
                  </div>
                  <div className="text-right">
                    <p className="rounded-xl bg-slate-100 px-2 py-1 font-mono text-sm font-bold">ABC-1234</p>
                    <p className="mt-1 text-xs text-slate-500">Fiat Argo Branco</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-2xl">Mensagem</Button>
                  <Button
                    variant="destructive"
                    className="rounded-2xl"
                    onClick={() => {
                      setStep("search");
                      setDestination("");
                      setSelectedRide(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const RouteRow = ({ label, value, active = false }: { label: string; value: string; active?: boolean }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
    <span className={`h-3 w-3 rounded-full ${active ? "bg-blue-500" : "bg-primary"}`} />
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  </div>
);
