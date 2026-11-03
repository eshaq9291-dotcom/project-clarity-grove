import { describe, expect, it } from "vitest";
import { isAmountMismatch } from "@/lib/receipt-check";

const R = { yer_per_sar: 140, yer_per_usd: 530 };
describe("receipt amount check", () => {
  // order total 1000 SAR = 140,000 YER
  it("matching YER amount is not flagged", () => expect(isAmountMismatch(1000, 140000, "YER", R)).toBe(false));
  it("short YER amount is flagged", () => expect(isAmountMismatch(1000, 130000, "YER", R)).toBe(true));
  it("SAR receipt compared in SAR", () => expect(isAmountMismatch(1000, 1000, "SAR", R)).toBe(false));
  it("missing amount is flagged", () => expect(isAmountMismatch(1000, null, "YER", R)).toBe(true));
});
