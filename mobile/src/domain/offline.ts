// Modelo de risco da reserva offline (ESPECIFICACAO + SIMULACAO).
// Nao ha assinatura criptografica real nem liquidacao offline: os vouchers sao
// estruturas validadas por regras puras. Claims de DID/assinatura/liquidacao
// continuam marcadas NEEDS_SOURCE/NEEDS_DECISION em docs/spec.md e docs/prd.md.
// Fontes do modelo: docs/spec.md (reserva offline), docs/plans.md Milestone 05.

import { isValidAmount, roundToCents } from "./ledger";

export interface OfflineAllowance {
  id: string;
  userDid: string; // did:shimo:user:<id>
  deviceDid: string; // did:shimo:device:<id>
  totalLimit: number; // teto acumulado em BRL
  perTransactionLimit: number; // teto por voucher em BRL
  maxTransactions: number; // teto de vouchers emitidos
  issuedAt: string; // ISO
  expiresAt: string; // ISO
  usedAmount: number; // BRL ja reservado
  usageCount: number; // vouchers ja emitidos
}

export interface OfflineVoucher {
  id: string;
  allowanceId: string;
  sequence: number; // 1..maxTransactions
  amount: number; // BRL
  merchantDid: string; // did:shimo:merchant:<id>
  issuedAt: string; // ISO
}

export type IssueAllowanceFailure =
  | "invalid_identity"
  | "invalid_total_limit"
  | "invalid_per_tx_limit"
  | "invalid_max_transactions"
  | "per_tx_above_total"
  | "invalid_expiry";

export type VoucherFailure =
  | "invalid_amount"
  | "expired"
  | "over_per_tx"
  | "over_remaining"
  | "over_count";

export interface AllowanceInput {
  id: string;
  userDid: string;
  deviceDid: string;
  totalLimit: number;
  perTransactionLimit: number;
  maxTransactions: number;
  now: string; // ISO
  validityMs: number; // validade a partir de now
}

export type IssueAllowanceResult =
  | { ok: true; allowance: OfflineAllowance }
  | { ok: false; reason: IssueAllowanceFailure };

function isValidDid(did: string): boolean {
  return typeof did === "string" && did.trim().length > 0;
}

// Cria uma allowance offline dentro dos limites de risco definidos.
// Regras: limites positivos, por-transacao <= teto total, validade no futuro.
export function issueAllowance(input: AllowanceInput): IssueAllowanceResult {
  if (!isValidDid(input.id) || !isValidDid(input.userDid) || !isValidDid(input.deviceDid)) {
    return { ok: false, reason: "invalid_identity" };
  }
  if (!isValidAmount(input.totalLimit)) return { ok: false, reason: "invalid_total_limit" };
  if (!isValidAmount(input.perTransactionLimit)) return { ok: false, reason: "invalid_per_tx_limit" };
  if (!Number.isInteger(input.maxTransactions) || input.maxTransactions < 1) {
    return { ok: false, reason: "invalid_max_transactions" };
  }
  if (roundToCents(input.perTransactionLimit) > roundToCents(input.totalLimit)) {
    return { ok: false, reason: "per_tx_above_total" };
  }
  if (!Number.isFinite(input.validityMs) || input.validityMs <= 0) {
    return { ok: false, reason: "invalid_expiry" };
  }

  const issuedAtMs = new Date(input.now).getTime();
  if (!Number.isFinite(issuedAtMs)) return { ok: false, reason: "invalid_expiry" };

  const allowance: OfflineAllowance = {
    id: input.id,
    userDid: input.userDid,
    deviceDid: input.deviceDid,
    totalLimit: roundToCents(input.totalLimit),
    perTransactionLimit: roundToCents(input.perTransactionLimit),
    maxTransactions: input.maxTransactions,
    issuedAt: input.now,
    expiresAt: new Date(issuedAtMs + input.validityMs).toISOString(),
    usedAmount: 0,
    usageCount: 0,
  };
  return { ok: true, allowance };
}

export function remainingAmount(allowance: OfflineAllowance): number {
  return roundToCents(allowance.totalLimit - allowance.usedAmount);
}

export function remainingTransactions(allowance: OfflineAllowance): number {
  return Math.max(0, allowance.maxTransactions - allowance.usageCount);
}

export function isExpired(allowance: OfflineAllowance, now: string): boolean {
  const nowMs = new Date(now).getTime();
  const expiresMs = new Date(allowance.expiresAt).getTime();
  return nowMs >= expiresMs;
}

export interface VoucherCommand {
  amount: number;
  merchantDid: string;
  voucherId: string;
  now: string; // ISO
}

export type VoucherResult =
  | { ok: true; voucher: OfflineVoucher; allowance: OfflineAllowance }
  | { ok: false; reason: VoucherFailure; allowance: OfflineAllowance };

// Emite um voucher offline somente dentro dos limites da allowance:
// dentro da validade, <= limite por transacao, <= restante e < maxTransactions.
// Fora dos limites a allowance volta inalterada.
export function issueVoucher(allowance: OfflineAllowance, cmd: VoucherCommand): VoucherResult {
  if (!isValidAmount(cmd.amount) || !isValidDid(cmd.voucherId) || !isValidDid(cmd.merchantDid)) {
    return { ok: false, reason: "invalid_amount", allowance };
  }
  if (isExpired(allowance, cmd.now)) {
    return { ok: false, reason: "expired", allowance };
  }

  const amount = roundToCents(cmd.amount);
  if (amount > roundToCents(allowance.perTransactionLimit)) {
    return { ok: false, reason: "over_per_tx", allowance };
  }
  if (amount > remainingAmount(allowance)) {
    return { ok: false, reason: "over_remaining", allowance };
  }
  if (remainingTransactions(allowance) < 1) {
    return { ok: false, reason: "over_count", allowance };
  }

  const usageCount = allowance.usageCount + 1;
  const voucher: OfflineVoucher = {
    id: cmd.voucherId,
    allowanceId: allowance.id,
    sequence: usageCount,
    amount,
    merchantDid: cmd.merchantDid,
    issuedAt: cmd.now,
  };
  const updated: OfflineAllowance = {
    ...allowance,
    usedAmount: roundToCents(allowance.usedAmount + amount),
    usageCount,
  };
  return { ok: true, voucher, allowance: updated };
}
