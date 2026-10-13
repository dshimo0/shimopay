import { useEffect, useState } from "react";

import { Progress } from "@/components/ui/progress";
import { ShimoSymbol } from "@/components/shimo/ShimoSymbols";

interface DIDHandshakeProps {
  onComplete: () => void;
}

const steps = [
  { msg: "Abrindo canal offline seguro...", delay: 500 },
  { msg: "Trocando chaves offline do aparelho...", delay: 650 },
  { msg: "Verificando prova local...", delay: 700 },
  { msg: "Assinando recibo no aparelho...", delay: 650 },
  { msg: "Transação pronta para sincronizar.", delay: 500 },
];

export const DIDHandshake = ({ onComplete }: DIDHandshakeProps) => {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let currentStep = 0;
    let timeout: number | undefined;

    const runStep = () => {
      if (currentStep >= steps.length) {
        timeout = window.setTimeout(onComplete, 600);
        return;
      }

      const current = steps[currentStep];
      timeout = window.setTimeout(() => {
        setLogs((prev) => [...prev, `> ${current.msg}`]);
        setStep(((currentStep + 1) / steps.length) * 100);
        currentStep += 1;
        runStep();
      }, current.delay);
    };

    runStep();
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6">
      <div className="relative flex h-24 w-full max-w-[220px] items-center justify-between">
        <div className="relative z-10 rounded-full border-2 border-slate-100 bg-white p-3 shadow-sm">
          <ShimoSymbol name="device" className="h-8 w-8 rounded-none bg-transparent text-slate-700" />
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        </div>

        <div className="absolute inset-x-9 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${step}%` }} />
        </div>
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow-sm">
          <ShimoSymbol name="lock" className="h-5 w-5 rounded-none bg-transparent text-emerald-700" />
        </div>

        <div className="relative z-10 rounded-full border-2 border-slate-100 bg-white p-3 shadow-sm">
          <ShimoSymbol name="device" className="h-8 w-8 rounded-none bg-transparent text-slate-700" />
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-sky-500" />
        </div>
      </div>

      <div className="flex min-h-[140px] w-full flex-col justify-end rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-300 shadow-inner">
        {logs.map((log) => (
          <div key={log} className="animate-in slide-in-from-left-2 fade-in duration-200">
            {log}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>

      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <ShimoSymbol name="security" className="h-4 w-4 rounded-none bg-transparent text-emerald-700" />
            Assinatura segura
          </span>
          <span>{Math.round(step)}%</span>
        </div>
        <Progress value={step} className="h-2" indicatorClassName="bg-emerald-500" />
      </div>
    </div>
  );
};
