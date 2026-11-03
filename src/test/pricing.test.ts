import { describe, expect, it } from "vitest";
import { currencies, DISCOUNT_CODE, DISCOUNT_RATE } from "@/lib/products";

describe("pricing rules", () => {
  it("launch code JOOD2024 gives 25% off", () => {
    expect(DISCOUNT_CODE).toBe("JOOD2024");
    expect(DISCOUNT_RATE).toBe(0.25);
  });
  it("USD uses 3.75 SAR per dollar", () => {
    expect(1875 * currencies.USD.rate).toBeCloseTo(500);
  });
});
