import { describe, expect, it } from "vitest";

import { appendEvent, type AuditEvent } from "../audit";

const NOW = "2026-08-21T12:00:00.000Z";

// Nota: com strictNullChecks desligado (tsconfig do projeto), o TS nao estreita
// uniao discriminada por truthiness (`if (!r.ok)`). Usamos type guards com `===`.
function isFailure<T extends { ok: boolean }>(r: T): r is Extract<T, { ok: false }> {
  return r.ok === false;
}

function event(overrides: Partial<AuditEvent> = {}): AuditEvent {
  return {
    id: 1,
    at: NOW,
    actorId: "op-1",
    actorRole: "support",
    action: "user_blocked",
    targetType: "user",
    targetId: "user-9",
    ...overrides,
  };
}

describe("appendEvent", () => {
  it("anexa na frente sem mutar o log original", () => {
    const previous: AuditEvent[] = [
      { id: 0, at: NOW, actorId: "op-1", actorRole: "admin", action: "incident_flagged", targetType: "transaction", targetId: "tx-1" },
    ];
    const result = appendEvent(previous, event());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.log).toHaveLength(2);
    expect(result.log[0].action).toBe("user_blocked");
    expect(result.log[1].id).toBe(0);
    // imutabilidade
    expect(previous).toHaveLength(1);
  });

  it("normaliza nota vazia para undefined", () => {
    const result = appendEvent([], event({ note: "   " }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.log[0].note).toBeUndefined();
  });

  it("rejeita evento invalido mantendo o log intacto", () => {
    const log: AuditEvent[] = [];
    const cases: Array<[AuditEvent, string]> = [
      [event({ actorId: "" }), "invalid_actor"],
      [event({ actorRole: "hacker" as AuditEvent["actorRole"] }), "invalid_actor"],
      [event({ targetId: "" }), "invalid_target"],
      [event({ targetType: "planet" as AuditEvent["targetType"] }), "invalid_target"],
      [event({ action: "self_enrich" as AuditEvent["action"] }), "invalid_action"],
      [event({ at: "ontem" }), "invalid_at"],
    ];
    for (const [bad, reason] of cases) {
      const result = appendEvent(log, bad);
      expect(result.ok).toBe(false);
      if (isFailure(result)) {
        expect(result.reason).toBe(reason);
        expect(result.log).toBe(log);
      }
    }
  });
});
