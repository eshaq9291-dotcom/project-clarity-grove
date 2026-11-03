import type { Currency } from "./products";
import { ratesFor, type StoreSettings } from "./settings";

type Rates = Pick<StoreSettings, "yer_per_sar" | "yer_per_usd">;

/** Order total expressed in the currency written on the receipt. */
export function expectedInCurrency(totalSar: number, currency: string | null | undefined, s: Rates): number {
  const r = ratesFor(s);
  const c = (currency ?? "YER").toUpperCase() as Currency;
  return totalSar * (r[c] ?? r.YER);
}

/**
 * A receipt matches when its amount is within 1 unit of the order total
 * in the receipt's currency. Missing amount counts as a mismatch.
 */
export function isAmountMismatch(totalSar: number, amount: number | null | undefined, currency: string | null | undefined, s: Rates): boolean {
  if (amount == null || Number.isNaN(amount)) return true;
  return Math.abs(amount - expectedInCurrency(totalSar, currency, s)) > 1;
}
