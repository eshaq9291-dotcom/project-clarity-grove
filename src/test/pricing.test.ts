import { describe, expect, it } from "vitest";
import { currencies, DISCOUNT_CODE, DISCOUNT_RATE, sanaaZones, yerToSar } from "@/lib/products";

const fee = (name: string) => sanaaZones.find((z) => z.name.startsWith(name))?.feeYER;

describe("pricing rules", () => {
  it("launch code JOOD2024 gives 25% off", () => {
    expect(DISCOUNT_CODE).toBe("JOOD2024");
    expect(DISCOUNT_RATE).toBe(0.25);
  });
  it("1 SAR = 140 YER", () => expect(100 * currencies.YER.rate).toBe(14000));
  it("1 USD = 530 YER", () => expect((530 / 140) * currencies.USD.rate).toBeCloseTo(1));
  it("Sanaa zone fees", () => {
    expect(fee("حدة")).toBe(1000);
    expect(fee("التحرير")).toBe(1500);
    expect(fee("شعوب")).toBe(2000);
    expect(fee("سعوان")).toBe(2500);
    expect(yerToSar(1400)).toBe(10);
  });
});
