// Configuracao do recebedor Pix para gerar BR Codes reais.
// PLACEHOLDER configuravel no portal /admin: enquanto a chave nao for
// substituida por uma chave Pix verdadeira, o QR escaneia mas NAO e pagavel.
// Cobranca com confirmacao automatica exige provedor + backend
// (docs/plans.md Milestone 06, NEEDS_DECISION).

import { buildPixPayload } from "@/domain/brcode";

const PIX_CONFIG_KEY = "shimopay_pix_config";

export interface PixConfig {
  key: string;
  merchantName: string;
  merchantCity: string;
}

export const DEFAULT_PIX_CONFIG: PixConfig = {
  key: "pix@shimopay.exemplo",
  merchantName: "SHIMOPAY DEMO",
  merchantCity: "SAO PAULO",
};

export function getPixConfig(): PixConfig {
  try {
    const raw = localStorage.getItem(PIX_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_PIX_CONFIG };
    const parsed = JSON.parse(raw) as Partial<PixConfig>;
    return {
      key: parsed.key?.trim() || DEFAULT_PIX_CONFIG.key,
      merchantName: parsed.merchantName?.trim() || DEFAULT_PIX_CONFIG.merchantName,
      merchantCity: parsed.merchantCity?.trim() || DEFAULT_PIX_CONFIG.merchantCity,
    };
  } catch {
    return { ...DEFAULT_PIX_CONFIG };
  }
}

export function setPixConfig(config: PixConfig): void {
  try {
    localStorage.setItem(PIX_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // sem storage: config vale so nesta sessao.
  }
}

export function isPlaceholderKey(config: PixConfig): boolean {
  return config.key === DEFAULT_PIX_CONFIG.key;
}

// Payload BR Code pronto para virar QR; null se a config for invalida.
export function buildCurrentPixPayload(amount?: number): string | null {
  const result = buildPixPayload({ ...getPixConfig(), amount });
  return result.ok ? result.payload : null;
}
