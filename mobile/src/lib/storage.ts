export interface StoreItem {
  id: string;
  name: string;
  category?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

const STORES_KEY = "shimopay_stores";
const TRANSACTIONS_KEY = "shimopay_transactions";

function readFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeToLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStores(): StoreItem[] {
  return readFromLocalStorage<StoreItem[]>(STORES_KEY, []);
}

export function saveStores(items: StoreItem[]): void {
  writeToLocalStorage(STORES_KEY, items);
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function addStore(partial: Omit<StoreItem, "id" | "createdAt" | "updatedAt">): StoreItem {
  const items = getStores();
  const now = new Date().toISOString();
  const item: StoreItem = {
    id: generateId(),
    name: partial.name,
    category: partial.category,
    address: partial.address,
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(item);
  saveStores(items);
  return item;
}

export function updateStore(id: string, updates: Partial<Omit<StoreItem, "id" | "createdAt">>): StoreItem | null {
  const items = getStores();
  const idx = items.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const updated: StoreItem = {
    ...items[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = updated;
  saveStores(items);
  return updated;
}

export function deleteStore(id: string): boolean {
  const items = getStores();
  const next = items.filter((s) => s.id !== id);
  const changed = next.length !== items.length;
  if (changed) saveStores(next);
  return changed;
}

// -------------------------------
// Transactions (Customer) Storage
// -------------------------------
export type TransactionType = "sent" | "received";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface TransactionItem {
  id: string;
  type: TransactionType;
  counterpartyName: string;
  amount: number;
  note?: string;
  status: TransactionStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export function getTransactions(): TransactionItem[] {
  return readFromLocalStorage<TransactionItem[]>(TRANSACTIONS_KEY, []);
}

export function saveTransactions(items: TransactionItem[]): void {
  writeToLocalStorage(TRANSACTIONS_KEY, items);
}

export function addTransaction(partial: Omit<TransactionItem, "id" | "createdAt" | "updatedAt" | "status"> & { status?: TransactionStatus }): TransactionItem {
  const items = getTransactions();
  const now = new Date().toISOString();
  const item: TransactionItem = {
    id: generateId(),
    type: partial.type,
    counterpartyName: partial.counterpartyName,
    amount: partial.amount,
    note: partial.note,
    status: partial.status ?? "completed",
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(item);
  saveTransactions(items);
  return item;
}

export function updateTransaction(id: string, updates: Partial<Omit<TransactionItem, "id" | "createdAt">>): TransactionItem | null {
  const items = getTransactions();
  const idx = items.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const updated: TransactionItem = {
    ...items[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = updated;
  saveTransactions(items);
  return updated;
}

export function deleteTransaction(id: string): boolean {
  const items = getTransactions();
  const next = items.filter((t) => t.id !== id);
  const changed = next.length !== items.length;
  if (changed) saveTransactions(next);
  return changed;
}
