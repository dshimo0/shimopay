// Contrato puro do ledger do MVP ShimoPay (MOCK).
// Sem React, sem localStorage, sem IO: transicoes de estado sao funcoes puras
// para serem testaveis. Isto NAO e um rail de pagamento real.
// Fontes do contrato: docs/spec.md (contrato do MVP de pagamento),
// docs/plans.md Milestone 03.

export type AccountType = "customer" | "merchant";
export type LoyaltyLevel = "Bronze" | "Prata" | "Ouro";
export type EntryType = "sent" | "received";

export interface LedgerAccount {
  name: string;
  email: string;
  type: AccountType;
  balance: number; // BRL
  points: number;
  level: LoyaltyLevel;
}

export interface LedgerEntry {
  id: number;
  type: EntryType;
  counterparty: string;
  amount: number; // BRL, com sinal a partir da perspectiva da conta
  method?: string;
  occurredAt: string; // ISO
}

export interface LedgerState {
  account: LedgerAccount | null;
  entries: LedgerEntry[]; // mais recente primeiro
}

// Regras de fidelidade, pinadas por teste.
export const LOYALTY_TIERS: ReadonlyArray<{ level: LoyaltyLevel; minPoints: number }> = [
  { level: "Bronze", minPoints: 0 },
  { level: "Prata", minPoints: 1000 },
  { level: "Ouro", minPoints: 3000 },
];

// Contas iniciais de demonstracao (MOCK). Nao sao saldos reais.
export const DEMO_ACCOUNTS: Record<AccountType, { name: string; balance: number; points: number }> = {
  customer: { name: "João Silva", balance: 1234.56, points: 350 },
  merchant: { name: "Padaria Central", balance: 5430.0, points: 0 },
};

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isValidAmount(amount: number): boolean {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
}

export function levelForPoints(points: number): LoyaltyLevel {
  let current: LoyaltyLevel = LOYALTY_TIERS[0].level;
  for (const tier of LOYALTY_TIERS) {
    if (points >= tier.minPoints) current = tier.level;
  }
  return current;
}

export function createAccount(email: string, type: AccountType): LedgerAccount {
  const demo = DEMO_ACCOUNTS[type];
  const account: LedgerAccount = {
    name: demo.name,
    email,
    type,
    balance: demo.balance,
    points: demo.points,
    level: levelForPoints(demo.points),
  };
  return account;
}

export interface LedgerCommand {
  amount: number;
  counterparty: string;
  method?: string;
  id: number;
  occurredAt: string; // ISO
}

export type PayFailureReason = "no_account" | "invalid_amount" | "insufficient_balance";

export type PayResult =
  | { ok: true; state: LedgerState }
  | { ok: false; reason: PayFailureReason; state: LedgerState };

function toEntry(cmd: LedgerCommand, type: EntryType): LedgerEntry {
  return {
    id: cmd.id,
    type,
    counterparty: cmd.counterparty,
    amount: type === "sent" ? -roundToCents(cmd.amount) : roundToCents(cmd.amount),
    method: cmd.method,
    occurredAt: cmd.occurredAt,
  };
}

// Contrato: pagar com saldo suficiente altera saldo e historico de forma
// previsivel. Saldo insuficiente ou comando invalido NAO altera estado.
export function pay(state: LedgerState, cmd: LedgerCommand): PayResult {
  if (!state.account) return { ok: false, reason: "no_account", state };
  if (!isValidAmount(cmd.amount)) return { ok: false, reason: "invalid_amount", state };

  const balance = roundToCents(state.account.balance);
  const amount = roundToCents(cmd.amount);
  if (balance < amount) return { ok: false, reason: "insufficient_balance", state };

  const points = state.account.points + Math.floor(amount);
  const account: LedgerAccount = {
    ...state.account,
    balance: roundToCents(balance - amount),
    points,
    level: levelForPoints(points),
  };
  const entry = toEntry(cmd, "sent");
  return { ok: true, state: { account, entries: [entry, ...state.entries] } };
}

// Contrato: recebimento credita saldo e registra historico consistente.
// Comando invalido ou conta ausente devolve o estado inalterado.
export function receive(state: LedgerState, cmd: LedgerCommand): LedgerState {
  if (!state.account || !isValidAmount(cmd.amount)) return state;

  const amount = roundToCents(cmd.amount);
  const account: LedgerAccount = {
    ...state.account,
    balance: roundToCents(state.account.balance + amount),
  };
  const entry = toEntry({ ...cmd, amount }, "received");
  return { account, entries: [entry, ...state.entries] };
}
