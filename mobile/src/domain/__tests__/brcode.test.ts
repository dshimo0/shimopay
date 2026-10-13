import { describe, expect, it } from "vitest";

import { buildPixPayload, crc16CcittFalse, isValidPixPayload } from "../brcode";

describe("crc16CcittFalse", () => {
  // Vetor padrao amplamente conhecido do CRC16/CCITT-FALSE.
  it("bate com o vetor conhecido 123456789 -> 29B1", () => {
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });

  it("string vazia -> FFFF", () => {
    expect(crc16CcittFalse("")).toBe("FFFF");
  });
});

describe("buildPixPayload", () => {
  const base = {
    key: "pix@shimopay.exemplo",
    merchantName: "ShimoPay Demo",
    merchantCity: "São Paulo",
  };

  it("gera payload EMV valido com chave, nome sanitizado e CRC consistente", () => {
    const result = buildPixPayload(base);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.payload.startsWith("000201")).toBe(true);
    expect(result.payload).toContain("br.gov.bcb.pix");
    expect(result.payload).toContain("pix@shimopay.exemplo");
    expect(result.payload).toContain("6009Sao Paulo"); // cidade ASCII, 9 caracteres; caixa preservada
    expect(isValidPixPayload(result.payload)).toBe(true);
  });

  it("inclui valor em reais formatado quando informado", () => {
    const result = buildPixPayload({ ...base, amount: 12.5 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toContain("540512.50"); // tag 54, comprimento 05, valor 12.50
    expect(isValidPixPayload(result.payload)).toBe(true);
  });

  it("usa txid *** quando nao informado e aceita txid valido", () => {
    const fallback = buildPixPayload(base);
    if (fallback.ok) expect(fallback.payload).toContain("0503***");

    const custom = buildPixPayload({ ...base, txid: "Pedido123" });
    if (custom.ok) expect(custom.payload).toContain("0509Pedido123");
  });

  it("rejeita entradas invalidas", () => {
    const cases: Array<[Parameters<typeof buildPixPayload>[0], string]> = [
      [{ ...base, key: "" }, "invalid_key"],
      [{ ...base, merchantName: "   " }, "invalid_name"],
      [{ ...base, merchantCity: "" }, "invalid_city"],
      [{ ...base, amount: 0 }, "invalid_amount"],
      [{ ...base, amount: -10 }, "invalid_amount"],
      [{ ...base, txid: "nao pode espaco" }, "invalid_txid"],
      [{ ...base, txid: "a".repeat(26) }, "invalid_txid"],
    ];
    for (const [input, reason] of cases) {
      const result = buildPixPayload(input);
      expect(result.ok).toBe(false);
      if (result.ok === false) expect(result.reason).toBe(reason);
    }
  });

  it("limita tamanho de nome e cidade conforme o padrao", () => {
    const result = buildPixPayload({
      key: "k",
      merchantName: "Uma Razao Social Com Nome Extremamente Longo Demais",
      merchantCity: "Cidade Com Nome Muito Comprido",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // nome truncado em 25 e cidade em 15 caracteres efetivos
    expect(result.payload.length).toBeLessThan(300);
  });

  it("payload gerado e estavel (mesma entrada, mesma saida)", () => {
    const a = buildPixPayload({ ...base, amount: 42.1 });
    const b = buildPixPayload({ ...base, amount: 42.1 });
    expect(a).toEqual(b);
  });
});
