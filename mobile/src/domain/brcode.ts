// Gerador de BR Code Pix estatico (padrao EMV QRCPS-MPM do Banco Central).
// O payload gerado e REAL: com uma chave Pix valida, qualquer app bancario
// escaneia e paga. Nao envolve nosso backend nem confirma a baixa — para
// cobranca com txid/webhook ver docs/plans.md Milestone 06 (provedor).
// Fontes da especificacao: BCB "Padroes para iniciacao de pagamento via QR Code".

export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

export interface PixPayloadInput {
  key: string; // chave Pix do recebedor
  merchantName: string; // nome exibido (max 25 caracteres efetivos)
  merchantCity: string; // cidade (max 15 caracteres efetivos)
  amount?: number; // valor em BRL (opcional em QR estatico)
  txid?: string; // identificador (max 25 alfanumerico; padrao "***")
}

export type PixPayloadFailure =
  | "invalid_key"
  | "invalid_name"
  | "invalid_city"
  | "invalid_amount"
  | "invalid_txid";

const MAX_NAME = 25;
const MAX_CITY = 15;
const MAX_TXID = 25;

// Remove marcas diacriticas (U+0300-U+036F) e mantem apenas ASCII imprimivel:
// o padrao EMV usado pelo Pix trabalha melhor com ASCII e os nomes continuam
// legiveis nos apps bancarios.
function sanitize(value: string): string {
  let ascii = "";
  for (const ch of value.normalize("NFD")) {
    const code = ch.codePointAt(0) ?? 0;
    const isCombiningMark = code >= 0x0300 && code <= 0x036f;
    const isPrintableAscii = code >= 0x20 && code <= 0x7e;
    if (!isCombiningMark && isPrintableAscii) ascii += ch;
  }
  return ascii.trim();
}


// CRC16/CCITT-FALSE: poly 0x1021, init 0xFFFF, sem reflect, xorout 0x0000.
// Vetor conhecido: crc16("123456789") === 0x29B1.
export function crc16CcittFalse(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function emv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${tag}${len}${value}`;
}

// Monta campo 26 (merchant account information) com o GUI do Pix e a chave.
function pixAccountField(key: string): string {
  const gui = emv("00", "br.gov.bcb.pix");
  const keyField = emv("01", key);
  return emv("26", `${gui}${keyField}`);
}

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

// Gera o payload EMV completo terminando com "6304" + CRC16.
// Falha de validacao devolve motivo sem payload parcial.
export function buildPixPayload(
  input: PixPayloadInput
): { ok: true; payload: string } | { ok: false; reason: PixPayloadFailure } {
  const key = input.key.trim();
  if (!key || key.length > 77) return { ok: false, reason: "invalid_key" };

  const name = sanitize(input.merchantName).slice(0, MAX_NAME);
  if (!name) return { ok: false, reason: "invalid_name" };

  const city = sanitize(input.merchantCity).slice(0, MAX_CITY);
  if (!city) return { ok: false, reason: "invalid_city" };

  let amountValue = "";
  if (input.amount !== undefined) {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { ok: false, reason: "invalid_amount" };
    }
    amountValue = roundToCents(input.amount).toFixed(2);
  }

  let txid = input.txid?.trim() ?? "";
  if (txid && !/^[a-zA-Z0-9]{1,25}$/.test(txid)) {
    return { ok: false, reason: "invalid_txid" };
  }
  if (!txid) txid = "***";

  let payload =
    emv("00", "01") +
    pixAccountField(key) +
    emv("52", "0000") +
    emv("53", "986") +
    (amountValue ? emv("54", amountValue) : "") +
    emv("58", "BR") +
    emv("59", name) +
    emv("60", city) +
    emv("62", emv("05", txid));

  payload += "6304";
  return { ok: true, payload: payload + crc16CcittFalse(payload) };
}

// Valida estrutura basica de um payload BR Code (tags obrigatorias + CRC).
export function isValidPixPayload(payload: string): boolean {
  if (!payload.startsWith("000201")) return false;
  if (!payload.includes("br.gov.bcb.pix")) return false;
  if (!/6304[0-9A-F]{4}$/.test(payload)) return false;
  const body = payload.slice(0, -4);
  const crc = payload.slice(-4);
  return crc16CcittFalse(body) === crc;
}
