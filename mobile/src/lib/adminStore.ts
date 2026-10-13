// Persistencia local do backoffice demo (portal /admin).
// Tudo em localStorage/sessionStorage: NAO e backend real nem auth real.
// RBAC de verdade, servidor e auditoria imutavel continuam pendentes
// (docs/prd.md §5.5, docs/plans.md Milestone 06).

import { appendEvent, type AuditActionKind, type AuditEvent, type AuditRole, type AuditTargetType } from "@/domain/audit";

const AUDIT_KEY = "shimopay_audit_log";
const USER_STATUS_KEY = "shimopay_admin_user_status";
const OPERATOR_KEY = "shimo_admin_operator";

export interface Operator {
  id: string;
  name: string;
  role: AuditRole;
}

export type UserStatus = "active" | "blocked";

function safeRead<T>(storage: Storage | null, key: string, fallback: T): T {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ---- Operador da sessao (sessionStorage: morre ao fechar a aba) ----

export function getOperator(): Operator | null {
  try {
    const raw = sessionStorage.getItem(OPERATOR_KEY);
    return raw ? (JSON.parse(raw) as Operator) : null;
  } catch {
    return null;
  }
}

export function setOperator(operator: Operator): void {
  try {
    sessionStorage.setItem(OPERATOR_KEY, JSON.stringify(operator));
  } catch {
    // sessao sem storage: operador vive apenas em memoria.
  }
}

export function clearOperator(): void {
  try {
    sessionStorage.removeItem(OPERATOR_KEY);
  } catch {
    // nada a fazer sem storage.
  }
}

// ---- Trilha de auditoria (append-only via dominio) ----

export function getAuditLog(): AuditEvent[] {
  try {
    return safeRead<AuditEvent[]>(localStorage, AUDIT_KEY, []);
  } catch {
    return [];
  }
}

export function recordAudit(input: {
  actorId: string;
  actorRole: AuditRole;
  action: AuditActionKind;
  targetType: AuditTargetType;
  targetId: string;
  note?: string;
}): AuditEvent | null {
  const log = getAuditLog();
  const nextId = Math.max(0, ...log.map((event) => event.id)) + 1;
  const result = appendEvent(log, {
    id: nextId,
    at: new Date().toISOString(),
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    note: input.note,
  });
  if (!result.ok) return null;
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(result.log));
  } catch {
    // log segue apenas em memoria neste ciclo.
  }
  return result.log[0];
}

// ---- Status de usuarios (overrides locais do suporte) ----

export function getUserStatuses(): Record<string, UserStatus> {
  try {
    return safeRead<Record<string, UserStatus>>(localStorage, USER_STATUS_KEY, {});
  } catch {
    return {};
  }
}

export function setUserStatus(userId: string, status: UserStatus): void {
  const statuses = getUserStatuses();
  statuses[userId] = status;
  try {
    localStorage.setItem(USER_STATUS_KEY, JSON.stringify(statuses));
  } catch {
    // override vale so para a sessao atual.
  }
}
