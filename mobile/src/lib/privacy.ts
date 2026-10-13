// Direitos do titular (LGPD) sobre os dados locais do app demo.
// Hoje os dados vivem apenas em localStorage; exportar e apagar aqui sao
// operacoes REAIS sobre esses dados. Base legal, DPO, retencao em backend e
// relatorio de impacto continuam NEEDS_SOURCE/NEEDS_DECISION (docs/prd.md §7).
// Textos legais em src/pages/legal/* sao rascunho pendente de revisao juridica.

export const CONSENT_VERSION = "2026-08-21";

const CONSENT_KEY = "shimo_privacy_consent";
const DATA_PREFIX = "shimo"; // shimo_user, shimo_onboarded, shimopay_*

export interface ConsentRecord {
  accepted: boolean;
  version: string;
  at: string; // ISO
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

export function getConsent(): ConsentRecord | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentRecord) : null;
  } catch {
    return null;
  }
}

export function setConsent(accepted: boolean, at = new Date().toISOString()): ConsentRecord {
  const record: ConsentRecord = { accepted, version: CONSENT_VERSION, at };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // sem storage: consentimento vale so para a sessao atual.
  }
  return record;
}

function isShimoKey(key: string): boolean {
  return key.startsWith(DATA_PREFIX);
}

// Coleta todos os dados locais do titular (chaves shimo*).
export function collectLocalData(): Record<string, unknown> {
  const storage = safeStorage();
  const data: Record<string, unknown> = {};
  if (!storage) return data;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !isShimoKey(key)) continue;
    try {
      const raw = storage.getItem(key);
      data[key] = raw ? JSON.parse(raw) : null;
    } catch {
      data[key] = storage.getItem(key);
    }
  }
  return data;
}

// Exportacao portavel (LGPD art. 18, II/V): JSON com todos os dados locais.
export function exportLocalData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      consent: getConsent(),
      data: collectLocalData(),
    },
    null,
    2
  );
}

// Apaga TODOS os dados locais do titular (LGPD art. 18, VI) e devolve as
// chaves removidas. O consentimento e regravado como revogado.
export function deleteLocalData(at = new Date().toISOString()): string[] {
  const storage = safeStorage();
  const removed: string[] = [];
  if (!storage) return removed;
  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i);
    if (!key || !isShimoKey(key)) continue;
    storage.removeItem(key);
    removed.push(key);
  }
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, version: CONSENT_VERSION, at }));
  } catch {
    // storage indisponivel: nada a persistir.
  }
  return removed;
}
