import React, { createContext, useContext, useMemo, useState } from "react";

import {
  createAccount,
  pay as payLedger,
  receive as receiveLedger,
  roundToCents,
  type AccountType,
  type LedgerEntry,
  type LedgerState,
} from "@/domain/ledger";

// Provider explicitamente MOCK: estado local + localStorage, sem backend real.
// As regras de saldo/transacao/fidelidade vivem em src/domain/ledger.ts (puras
// e testadas); este provider so faz binding com React e persistencia demo.
// Fontes: docs/spec.md (contrato do MVP), docs/architecture.md (mapa mock vs real).

type UserType = AccountType;

interface User {
  name: string;
  email: string;
  type: UserType;
  balance: number;
  points: number;
  level: "Bronze" | "Prata" | "Ouro";
}

// View model consumido pelas telas. `date` e rotulo de exibicao derivado de occurredAt.
export interface Transaction {
  id: number;
  type: "sent" | "received";
  name: string;
  amount: number;
  date: string;
  method?: string;
}

interface MockContextType {
  user: User | null;
  transactions: Transaction[];
  login: (email: string, type: UserType) => void;
  logout: () => void;
  pay: (amount: number, receiverName: string, method?: string) => boolean;
  receive: (amount: number, senderName: string, method?: string) => void;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

const USER_KEY = "shimo_user";

function dayKey(date: Date): number {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
}

function labelFor(occurredAt: string): string {
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const diffMs = now.getTime() - date.getTime();
  if (diffMs >= 0 && diffMs < 60_000) return "Agora";
  if (dayKey(date) === dayKey(now)) return `Hoje, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(yesterday)) return `Ontem, ${time}`;
  return `${date.toLocaleDateString("pt-BR")} ${time}`;
}

function toView(entry: LedgerEntry): Transaction {
  return {
    id: entry.id,
    type: entry.type,
    name: entry.counterparty,
    amount: entry.amount,
    date: labelFor(entry.occurredAt),
    method: entry.method,
  };
}

function seedEntries(): LedgerEntry[] {
  // Historico inicial de demonstracao (MOCK). Timestamps relativos ao load
  // para os rotulos Hoje/Ontem refletirem a data real.
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
  const yesterday = new Date(now - 24 * 3_600_000);
  yesterday.setHours(18, 45, 0, 0);
  return [
    { id: 1, type: "sent", counterparty: "Padaria São José", amount: -12.5, occurredAt: hoursAgo(4) },
    { id: 2, type: "received", counterparty: "Maria Silva", amount: 50, method: "Depósito", occurredAt: hoursAgo(6) },
    { id: 3, type: "sent", counterparty: "Supermercado Central", amount: -85.9, occurredAt: yesterday.toISOString() },
  ];
}

function initialState(): LedgerState {
  let account: LedgerState["account"] = null;
  try {
    const savedUser = localStorage.getItem(USER_KEY);
    account = savedUser ? (JSON.parse(savedUser) as NonNullable<LedgerState["account"]>) : null;
  } catch {
    account = null;
  }
  return { account, entries: seedEntries() };
}

function nextId(state: LedgerState): number {
  return Math.max(0, ...state.entries.map((entry) => entry.id)) + 1;
}

export const MockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LedgerState>(initialState);

  const user: User | null = useMemo(
    () =>
      state.account
        ? {
            name: state.account.name,
            email: state.account.email,
            type: state.account.type,
            balance: roundToCents(state.account.balance),
            points: state.account.points,
            level: state.account.level,
          }
        : null,
    [state.account]
  );

  React.useEffect(() => {
    try {
      if (state.account) {
        localStorage.setItem(USER_KEY, JSON.stringify(state.account));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      // localStorage indisponivel: sessao segue apenas em memoria.
    }
  }, [state.account]);

  const transactions = useMemo(() => state.entries.map(toView), [state.entries]);

  const login = (email: string, type: UserType) => {
    setState((prev) => ({ ...prev, account: createAccount(email, type) }));
  };

  const logout = () => {
    setState((prev) => ({ ...prev, account: null }));
  };

  const pay = (amount: number, receiverName: string, method: string = "Saldo ShimoPay") => {
    const result = payLedger(state, {
      amount,
      counterparty: receiverName,
      method,
      id: nextId(state),
      occurredAt: new Date().toISOString(),
    });
    setState(result.state);
    return result.ok;
  };

  const receive = (amount: number, senderName: string, method: string = "Depósito") => {
    setState(
      receiveLedger(state, {
        amount,
        counterparty: senderName,
        method,
        id: nextId(state),
        occurredAt: new Date().toISOString(),
      })
    );
  };

  return (
    <MockContext.Provider value={{ user, transactions, login, logout, pay, receive }}>
      {children}
    </MockContext.Provider>
  );
};

export const useMock = () => {
  const context = useContext(MockContext);
  if (context === undefined) {
    throw new Error("useMock must be used within a MockProvider");
  }
  return context;
};
