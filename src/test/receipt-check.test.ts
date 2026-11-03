import { describe, expect, it } from "vitest";
import { isAmountMismatch } from "@/lib/receipt-check";

describe("receipt amount check", () => {
  // order total 1000 SAR = 140,000 YER
  it("matching YER amount is not flagged", () => expect(isAmountMismatch(1000, 140000, "YER")).toBe(false));
  it("short YER amount is flagged", () => expect(isAmountMismatch(1000, 130000, "YER")).toBe(true));
  it("SAR receipt compared in SAR", () => expect(isAmountMismatch(1000, 1000, "SAR")).toBe(false));
  it("missing amount is flagged", () => expect(isAmountMismatch(1000, null, "YER")).toBe(true));
});
