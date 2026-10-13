import { describe, expect, it } from "vitest";

import {
  issueAllowance,
  issueVoucher,
  isExpired,
  remainingAmount,
  remainingTransactions,
  type OfflineAllowance,
} from "../offline";

const NOW = "2026-08-21T12:00:00.000Z";
const ONE_HOUR = 60 * 60 * 1000;

// Nota: com strictNullChecks desligado (tsconfig do projeto), o TS nao estreita
// uniao discriminada por truthiness (`if (!r.ok)`). Usamos type guards com `===`.
function isFailure<T extends { ok: boolean }>(
  r: T
): r is Extract<T, { ok: false }> {
  return r.ok === false;
}

function allowanceInput(overrides: Partial<Parameters<typeof issueAllowance>[0]> = {}) {
  return {
    id: "allowance-1",
    userDid: "did:shimo:user:123",
    deviceDid: "did:shimo:device:abc",
    totalLimit: 200,
    perTransactionLimit: 50,
    maxTransactions: 3,
    now: NOW,
    validityMs: ONE_HOUR,
    ...overrides,
  };
}

function activeAllowance(): OfflineAllowance {
  const result = issueAllowance(allowanceInput());
  if (isFailure(result)) throw new Error("allowance de teste deveria ser valida");
  return result.allowance;
}

describe("issueAllowance", () => {
  it("cria allowance ativa com limites e validade definidos", () => {
    const allowance = activeAllowance();
    expect(allowance.totalLimit).toBe(200);
    expect(allowance.perTransactionLimit).toBe(50);
    expect(allowance.maxTransactions).toBe(3);
    expect(allowance.usedAmount).toBe(0);
    expect(allowance.usageCount).toBe(0);
    expect(new Date(allowance.expiresAt).getTime()).toBe(new Date(NOW).getTime() + ONE_HOUR);
    expect(isExpired(allowance, NOW)).toBe(false);
  });

  it("rejeita configuracoes fora da politica de risco", () => {
    const cases: Array<[Parameters<typeof issueAllowance>[0], string]> = [
      [allowanceInput({ userDid: "" }), "invalid_identity"],
      [allowanceInput({ totalLimit: 0 }), "invalid_total_limit"],
      [allowanceInput({ perTransactionLimit: -1 }), "invalid_per_tx_limit"],
      [allowanceInput({ maxTransactions: 0 }), "invalid_max_transactions"],
      [allowanceInput({ perTransactionLimit: 201 }), "per_tx_above_total"],
      [allowanceInput({ validityMs: 0 }), "invalid_expiry"],
      [allowanceInput({ now: "not-a-date" }), "invalid_expiry"],
    ];
    for (const [input, reason] of cases) {
      const result = issueAllowance(input);
      expect(result.ok).toBe(false);
      if (isFailure(result)) expect(result.reason).toBe(reason);
    }
  });
});

describe("issueVoucher", () => {
  it("emite voucher dentro dos limites e consome allowance", () => {
    const allowance = activeAllowance();
    const result = issueVoucher(allowance, {
      amount: 50,
      merchantDid: "did:shimo:merchant:x",
      voucherId: "v-1",
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (result.ok !== true) return;
    expect(result.voucher).toMatchObject({
      id: "v-1",
      allowanceId: "allowance-1",
      sequence: 1,
      amount: 50,
    });
    expect(result.allowance.usedAmount).toBe(50);
    expect(result.allowance.usageCount).toBe(1);
    expect(remainingAmount(result.allowance)).toBe(150);
    expect(remainingTransactions(result.allowance)).toBe(2);
    // allowance original intacta
    expect(allowance.usedAmount).toBe(0);
  });

  it("rejeita valor acima do limite por transacao sem alterar allowance", () => {
    const allowance = activeAllowance();
    const result = issueVoucher(allowance, {
      amount: 50.01,
      merchantDid: "did:shimo:merchant:x",
      voucherId: "v-2",
      now: NOW,
    });

    expect(result.ok).toBe(false);
    if (!isFailure(result)) return;
    expect(result.reason).toBe("over_per_tx");
    expect(result.allowance).toBe(allowance);
  });

  it("rejeita valor acima do restante acumulado", () => {
    let allowance = activeAllowance();
    for (let i = 1; i <= 3; i++) {
      const result = issueVoucher(allowance, {
        amount: 50,
        merchantDid: "did:shimo:merchant:x",
        voucherId: `v-${i}`,
        now: NOW,
      });
      expect(result.ok).toBe(true);
      if (result.ok !== true) return;
      allowance = result.allowance;
    }
    // 3 x 50 = 150 usados; restam 50 do teto, mas limite por transacao e 50.
    // Esgota por contagem antes de esgotar por valor:
    expect(remainingAmount(allowance)).toBe(50);
    const overCount = issueVoucher(allowance, {
      amount: 50,
      merchantDid: "did:shimo:merchant:x",
      voucherId: "v-4",
      now: NOW,
    });
    expect(overCount.ok).toBe(false);
    if (isFailure(overCount)) expect(overCount.reason).toBe("over_count");

    // Restante insuficiente tambem e coberto quando o valor passa do saldo:
    const partial = issueAllowance(
      allowanceInput({ totalLimit: 100, perTransactionLimit: 60, maxTransactions: 5 })
    );
    expect(partial.ok).toBe(true);
    if (partial.ok !== true) return;
    const first = issueVoucher(partial.allowance, { amount: 60, merchantDid: "m", voucherId: "a", now: NOW });
    expect(first.ok).toBe(true);
    if (first.ok !== true) return;
    const second = issueVoucher(first.allowance, { amount: 60, merchantDid: "m", voucherId: "b", now: NOW });
    expect(second.ok).toBe(false);
    if (isFailure(second)) expect(second.reason).toBe("over_remaining");
  });

  it("rejeita voucher expirado", () => {
    const allowance = activeAllowance();
    const later = new Date(new Date(NOW).getTime() + ONE_HOUR + 1).toISOString();
    const result = issueVoucher(allowance, {
      amount: 10,
      merchantDid: "m",
      voucherId: "v-late",
      now: later,
    });
    expect(result.ok).toBe(false);
    if (isFailure(result)) expect(result.reason).toBe("expired");
    expect(isExpired(allowance, later)).toBe(true);
  });

  it("rejeita valores invalidos", () => {
    const allowance = activeAllowance();
    for (const amount of [0, -10, Number.NaN]) {
      const result = issueVoucher(allowance, { amount, merchantDid: "m", voucherId: "v", now: NOW });
      expect(result.ok).toBe(false);
      if (isFailure(result)) expect(result.reason).toBe("invalid_amount");
    }
  });

  it("aceita exatamente o restante na ultima transacao permitida", () => {
    const created = issueAllowance(allowanceInput({ totalLimit: 90, perTransactionLimit: 30, maxTransactions: 3 }));
    expect(created.ok).toBe(true);
    if (created.ok !== true) return;
    let allowance = created.allowance;
    for (let i = 1; i <= 3; i++) {
      const result = issueVoucher(allowance, { amount: 30, merchantDid: "m", voucherId: `v-${i}`, now: NOW });
      expect(result.ok).toBe(true);
      if (!isFailure(result)) allowance = result.allowance;
    }
    expect(remainingAmount(allowance)).toBe(0);
    expect(remainingTransactions(allowance)).toBe(0);
  });
});
