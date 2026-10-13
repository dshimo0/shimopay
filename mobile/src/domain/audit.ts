// Trilha de auditoria append-only para acoes de suporte/backoffice (DEMO).
// O log e imutavel por construcao: appendEvent devolve um novo array e nunca
// muta entradas anteriores. Persistencia fica em localStorage (src/lib),
// backend real permanece NEEDS_DECISION em docs/plans.md Milestone 06.

export type AuditRole = "support" | "risk" | "admin";

export type AuditTargetType = "user" | "merchant" | "transaction" | "allowance";

export type AuditActionKind =
  | "user_blocked"
  | "user_unblocked"
  | "incident_flagged"
  | "limit_adjusted"
  | "data_export_requested"
  | "data_delete_requested"
  | "consent_recorded";

export interface AuditEvent {
  id: number;
  at: string; // ISO
  actorId: string;
  actorRole: AuditRole;
  action: AuditActionKind;
  targetType: AuditTargetType;
  targetId: string;
  note?: string;
}

export type AppendAuditFailure = "invalid_actor" | "invalid_target" | "invalid_action" | "invalid_at";

export type AppendAuditResult =
  | { ok: true; log: AuditEvent[] }
  | { ok: false; reason: AppendAuditFailure; log: AuditEvent[] };

const KNOWN_ACTIONS: ReadonlySet<string> = new Set<string>([
  "user_blocked",
  "user_unblocked",
  "incident_flagged",
  "limit_adjusted",
  "data_export_requested",
  "data_delete_requested",
  "consent_recorded",
]);

const KNOWN_TARGETS: ReadonlySet<string> = new Set<string>([
  "user",
  "merchant",
  "transaction",
  "allowance",
]);

const ROLES: ReadonlySet<string> = new Set<string>(["support", "risk", "admin"]);

function isValidIsoDate(value: string): boolean {
  return Number.isFinite(new Date(value).getTime());
}

// Anexa um evento na frente do log (mais recente primeiro) sem mutar o array
// de entrada. Eventos com campos obrigatorios vazios sao rejeitados e o log
// volta inalterado: falha de auditoria nunca corrompe o historico.
export function appendEvent(log: AuditEvent[], event: AuditEvent): AppendAuditResult {
  if (!event.actorId.trim() || !ROLES.has(event.actorRole)) {
    return { ok: false, reason: "invalid_actor", log };
  }
  if (!event.targetId.trim() || !KNOWN_TARGETS.has(event.targetType)) {
    return { ok: false, reason: "invalid_target", log };
  }
  if (!KNOWN_ACTIONS.has(event.action)) {
    return { ok: false, reason: "invalid_action", log };
  }
  if (!isValidIsoDate(event.at)) {
    return { ok: false, reason: "invalid_at", log };
  }

  const entry: AuditEvent = { ...event, note: event.note?.trim() || undefined };
  return { ok: true, log: [entry, ...log] };
}
