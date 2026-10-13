import { describe, expect, it } from "vitest";

import {
  DEMO_ACCOUNTS,
  createAccount,
  isValidAmount,
  levelForPoints,
  pay,
  receive,
  roundToCents,
  type LedgerState,
} from "../ledger";

const NOW = "2026-08-21T12:00:00.000Z";

// Nota: com strictNullChecks desligado (tsconfig do projeto), o TS nao estreita
// uniao discriminada por truthiness (`if (!r.ok)`). Usamos type guards com `===`.
function isFailure<T extends { ok: boolean }>(
  r: T
): r is Extract<T, { ok: false }> {
  return r.ok === false;
}

function emptyState(): LedgerState {
  return { account: null, entries: [] };
}

function customerState(balance = DEMO_ACCOUNTS.customer.balance): LedgerState {
  return {
    account: { ...createAccount("joao@example.com", "customer"), balance },
    entries: [],
  };
}

function payCmd(overrides: Partial<Parameters<typeof pay>[1]> = {}): Parameters<typeof pay>[1] {
  return { amount: 10, counterparty: "Padaria São José", id: 1, occurredAt: NOW, ...overrides };
}

describe("levelForPoints", () => {
  it("mantem Bronze abaixo de 1000 pontos", () => {
    expect(levelForPoints(0)).toBe("Bronze");
    expect(levelForPoints(999)).toBe("Bronze");
  });

  it("sobe para Prata em 1000 e Ouro em 3000", () => {
    expect(levelForPoints(1000)).toBe("Prata");
    expect(levelForPoints(2999)).toBe("Prata");
    expect(levelForPoints(3000)).toBe("Ouro");
  });
});

describe("pay", () => {
  it("com saldo suficiente altera saldo e historico de forma previsivel", () => {
    const initial = customerState(100);
    const result = pay(initial, payCmd({ amount: 12.5 }));

    expect(result.ok).toBe(true);
    if (result.ok !== true) return;
    expect(result.state.account.balance).toBe(87.5);
    expect(result.state.entries).toHaveLength(1);
    expect(result.state.entries[0]).toMatchObject({
      type: "sent",
      counterparty: "Padaria São José",
      amount: -12.5,
      occurredAt: NOW,
    });
    // estado original permanece intacto (imutabilidade)
    expect(initial.account.balance).toBe(100);
    expect(initial.entries).toHaveLength(0);
  });

  it("acumula pontos e sobe de nivel por valor pago", () => {
    const result = pay(customerState(5000), payCmd({ amount: 700 }));
    expect(result.ok).toBe(true);
    if (result.ok !== true) return;
    expect(result.state.account.points).toBe(DEMO_ACCOUNTS.customer.points + 700);
    expect(result.state.account.level).toBe("Prata");
  });

  it("rejeita saldo insuficiente sem alterar estado", () => {
    const initial = customerState(10);
    const result = pay(initial, payCmd({ amount: 10.01 }));

    expect(result.ok).toBe(false);
    if (!isFailure(result)) return;
    expect(result.reason).toBe("insufficient_balance");
    expect(result.state).toBe(initial);
    expect(initial.account.balance).toBe(10);
    expect(initial.entries).toHaveLength(0);
  });

  it("rejeita valores invalidos sem alterar estado", () => {
    for (const amount of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const initial = customerState(100);
      const result = pay(initial, payCmd({ amount }));
      expect(result.ok).toBe(false);
      if (isFailure(result)) expect(result.reason).toBe("invalid_amount");
      expect(result.state).toBe(initial);
    }
  });

  it("rejeita pagamento sem conta", () => {
    const result = pay(emptyState(), payCmd());
    expect(result.ok).toBe(false);
    if (isFailure(result)) expect(result.reason).toBe("no_account");
  });

  it("normaliza centavos evitando deriva de ponto flutuante", () => {
    const result = pay(customerState(1234.56), payCmd({ amount: 0.1 }));
    expect(result.ok).toBe(true);
    if (result.ok !== true) return;
    expect(result.state.account.balance).toBe(roundToCents(1234.56 - 0.1));
    expect(Number.isInteger(result.state.account.balance * 100)).toBe(true);
  });
});

describe("receive", () => {
  it("credita saldo e registra entrada no historico", () => {
    const initial = customerState(100);
    const next = receive(initial, { amount: 50, counterparty: "Maria Silva", id: 2, occurredAt: NOW });

    expect(next.account.balance).toBe(150);
    expect(next.entries[0]).toMatchObject({
      type: "received",
      counterparty: "Maria Silva",
      amount: 50,
    });
  });

  it("ignora comando invalido mantendo estado identico", () => {
    const initial = customerState(100);
    const noAccount = emptyState();
    expect(receive(initial, { amount: -1, counterparty: "X", id: 3, occurredAt: NOW })).toBe(initial);
    expect(receive(noAccount, { amount: 10, counterparty: "X", id: 4, occurredAt: NOW })).toBe(noAccount);
  });
});

describe("createAccount", () => {
  it("usa dados demo rotulados por tipo de conta", () => {
    const customer = createAccount("a@b.c", "customer");
    expect(customer.name).toBe(DEMO_ACCOUNTS.customer.name);
    expect(customer.level).toBe("Bronze");

    const merchant = createAccount("m@b.c", "merchant");
    expect(merchant.type).toBe("merchant");
    expect(merchant.balance).toBe(DEMO_ACCOUNTS.merchant.balance);
  });
});

describe("isValidAmount/roundToCents", () => {
  it("valida apenas numeros finitos positivos", () => {
    expect(isValidAmount(0.01)).toBe(true);
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-1)).toBe(false);
    expect(isValidAmount(Number.NaN)).toBe(false);
  });

  it("arredonda para centavos", () => {
    expect(roundToCents(10.105)).toBe(10.11);
    expect(roundToCents(0.1 + 0.2)).toBe(0.3);
  });
});
