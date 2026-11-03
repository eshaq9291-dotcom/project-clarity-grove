import { describe, expect, it } from "vitest";
import { DISCOUNT_CODE, DISCOUNT_RATE } from "@/lib/products";
import { fallbackSettings, ratesFor, yerToSar } from "@/lib/settings";
import { validateSettings } from "@/lib/settings.functions";

const s = { yer_per_sar: 140, yer_per_usd: 530 };

describe("pricing rules", () => {
  it("launch code JOOD2024 gives 25% off", () => {
    expect(DISCOUNT_CODE).toBe("JOOD2024");
    expect(DISCOUNT_RATE).toBe(0.25);
  });
  it("1 SAR = 140 YER", () => expect(100 * ratesFor(s).YER).toBe(14000));
  it("1 USD = 530 YER", () => expect((530 / 140) * ratesFor(s).USD).toBeCloseTo(1));
  it("YER fee converts to SAR with saved rate", () => expect(yerToSar(s, 1400)).toBe(10));
  it("wallet numbers start unset", () => expect(fallbackSettings.wallets.every((w) => w.account === "")).toBe(true));
  it("rejects zero exchange rate", () =>
    expect(() => validateSettings({ ...fallbackSettings, yer_per_sar: 0, zones: [{ id: "a", name: "حدة", feeYER: 1000 }] })).toThrow());
});
