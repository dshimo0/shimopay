import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ShimoMark, ShimoSymbol, type ShimoSymbolName } from "@/components/shimo/ShimoSymbols";

interface NetworkTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
}

const Network = () => {
  const [transactions, setTransactions] = useState<NetworkTransaction[]>([]);
  const [blockHeight, setBlockHeight] = useState(8291023);
  const [tps, setTps] = useState(4500);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const newTx: NetworkTransaction = {
        hash: `0x${Math.random().toString(16).slice(2, 42)}`,
        from: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
        to: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
        amount: (Math.random() * 1000).toFixed(2),
        timestamp: new Date().toLocaleTimeString(),
      };

      setTransactions((prev) => [newTx, ...prev].slice(0, 10));
      setBlockHeight((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
      setTps(Math.floor(4500 + Math.random() * 500 - 250));
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-primary text-slate-200">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-primary/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShimoMark className="bg-white text-slate-950" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">Shimo Scan</h1>
              <p className="text-xs font-semibold text-blue-300">Simulador de rede</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-white/10 hover:text-white" asChild><Link to="/">
              App
            </Link></Button>
        </div>
      </header>

      <main className="space-y-8 px-5 py-6">
        <p className="rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">Demonstração: blocos, hashes e métricas são gerados localmente. Não representam uma blockchain ativa, desempenho medido ou conexão com Solana.</p>
        <section className="grid grid-cols-2 gap-3">
          <StatCard symbol="signal" label="TPS" value={tps.toLocaleString()} subvalue="+12,5% em 24h" tone="amber" />
          <StatCard symbol="package" label="Bloco" value={`#${blockHeight.toLocaleString()}`} subvalue="~2,1s" tone="blue" />
          <StatCard symbol="users" label="Nós ativos" value="1.240" subvalue="Distribuição global" tone="green" />
          <StatCard symbol="cash" label="Taxa" value="0.00001" subvalue="< US$ 0,0001" tone="muted" />
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-white">
            <ShimoSymbol name="package" className="h-6 w-6 rounded-none bg-transparent text-blue-300" />
            Blocos recentes
          </h2>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <ShimoSymbol name="package" className="h-9 w-9 rounded-xl bg-white/10 text-slate-200" />
                  <div>
                    <p className="text-sm font-semibold text-blue-300">#{blockHeight - index}</p>
                    <p className="text-xs text-slate-500">{index * 2 + 2}s atrás</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-300">Validator 0x8a...</p>
                  <p className="text-xs text-slate-500">154 txns</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-white">
            <ShimoSymbol name="receipt" className="h-6 w-6 rounded-none bg-transparent text-blue-300" />
            Transações ao vivo
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-slate-400">
                  <tr>
                    <th className="p-4 font-medium">Hash</th>
                    <th className="p-4 font-medium">De</th>
                    <th className="p-4 font-medium">Para</th>
                    <th className="p-4 text-right font-medium">Valor</th>
                    <th className="p-4 text-right font-medium">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactions.map((tx) => (
                    <tr key={`${tx.hash}-${tx.timestamp}`} className="animate-in fade-in slide-in-from-right-4">
                      <td className="max-w-[140px] truncate p-4 font-mono text-blue-300">{tx.hash}</td>
                      <td className="max-w-[110px] truncate p-4 font-mono text-slate-400">{tx.from}</td>
                      <td className="max-w-[110px] truncate p-4 font-mono text-slate-400">{tx.to}</td>
                      <td className="p-4 text-right font-semibold text-white">{tx.amount}</td>
                      <td className="p-4 text-right text-xs text-slate-500">{tx.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({
  symbol,
  label,
  value,
  subvalue,
  tone,
}: {
  symbol: ShimoSymbolName;
  label: string;
  value: string;
  subvalue: string;
  tone: "green" | "blue" | "amber" | "muted";
}) => (
  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
    <div className="mb-4 flex items-center justify-between">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <ShimoSymbol name={symbol} tone={tone} className="h-8 w-8 rounded-xl" />
    </div>
    <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
    <p className="mt-1 text-xs text-slate-500">{subvalue}</p>
  </div>
);

export default Network;
