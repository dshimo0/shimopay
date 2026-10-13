import { useMemo, useState } from "react";

import { ShimoBottomNav, ShimoScreen, ShimoTopBar } from "@/components/shimo/ShimoShell";
import { ShimoSymbol } from "@/components/shimo/ShimoSymbols";
import { useMock } from "@/contexts/MockContext";

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const History = () => {
  const { transactions } = useMock();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((transaction) =>
      [transaction.name, transaction.method].filter(Boolean).some((value) => (value || "").toLowerCase().includes(q)),
    );
  }, [transactions, query]);

  const sent = filtered.filter((transaction) => transaction.type === "sent").reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const received = filtered.filter((transaction) => transaction.type === "received").reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  return (
    <ShimoScreen withBottomNav>
      <ShimoTopBar title="Atividade" eyebrow="Transações" backTo="/customer/home" />

      <main className="space-y-6 px-5">
        <section className="relative overflow-hidden rounded-[30px] bg-primary p-5 text-white shadow-xl shadow-slate-900/10">
          <div className="absolute right-[-54px] top-[-44px] h-36 w-36 rounded-full border border-white/10" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200/75">Resumo filtrado</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-white/55">Enviado</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrencyBRL(sent)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-white/55">Recebido</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrencyBRL(received)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-slate-950">
            <ShimoSymbol name="search" className="h-7 w-7 rounded-xl bg-slate-100 text-slate-600" />
            <input
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
              placeholder="Buscar por nome ou método"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <ShimoSymbol name="search" tone="muted" className="mx-auto mb-4 h-14 w-14 rounded-[22px]" />
              <p className="text-sm font-semibold text-slate-700">Nenhuma transação encontrada</p>
              <p className="mt-1 text-xs text-slate-500">Tente outro nome, método ou parceiro.</p>
            </div>
          ) : (
            filtered.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <ShimoSymbol name={transaction.type === "sent" ? "pay" : "receive"} tone={transaction.type === "sent" ? "rose" : "green"} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{transaction.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {transaction.date}
                      {transaction.method ? ` · ${transaction.method}` : ""}
                    </p>
                  </div>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${transaction.type === "sent" ? "text-rose-600" : "text-blue-700"}`}>
                  {transaction.type === "sent" ? "-" : "+"}
                  {formatCurrencyBRL(Math.abs(transaction.amount))}
                </p>
              </div>
            ))
          )}
        </section>
      </main>

      <ShimoBottomNav active="home" />
    </ShimoScreen>
  );
};

export default History;
