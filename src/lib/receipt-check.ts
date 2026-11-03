import { currencies, type Currency } from "./products";

/** Order total expressed in the currency written on the receipt. */
export function expectedInCurrency(totalSar: number, currency: string | null | undefined): number {
  const c = (currency ?? "YER").toUpperCase() as Currency;
  const rate = currencies[c]?.rate ?? currencies.YER.rate;
  return totalSar * rate;
}

/**
 * A receipt matches when its amount is within 1 unit of the order total
 * in the receipt's currency. Missing amount counts as a mismatch.
 */
export function isAmountMismatch(totalSar: number, amount: number | null | undefined, currency: string | null | undefined): boolean {
  if (amount == null || Number.isNaN(amount)) return true;
  return Math.abs(amount - expectedInCurrency(totalSar, currency)) > 1;
}
