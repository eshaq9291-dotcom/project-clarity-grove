import type { Currency } from "./products";

export type Wallet = { id: string; name: string; account: string };
export type Zone = { id: string; name: string; feeYER: number };
export type StoreSettings = {
  yer_per_sar: number;
  yer_per_usd: number;
  wallets: Wallet[];
  zones: Zone[];
};

/** Used only until the saved settings load. Wallet numbers stay empty. */
export const fallbackSettings: StoreSettings = {
  yer_per_sar: 140,
  yer_per_usd: 530,
  wallets: [
    { id: "kuraimi", name: "الكريمي جوال كاش", account: "" },
    { id: "floosak", name: "فلوسك", account: "" },
    { id: "onecash", name: "ون كاش", account: "" },
    { id: "jaib", name: "جيب", account: "" },
  ],
  zones: [],
};

export function normalizeSettings(row: { yer_per_sar: unknown; yer_per_usd: unknown; wallets: unknown; zones: unknown } | null): StoreSettings {
  if (!row) return fallbackSettings;
  return {
    yer_per_sar: Number(row.yer_per_sar) || fallbackSettings.yer_per_sar,
    yer_per_usd: Number(row.yer_per_usd) || fallbackSettings.yer_per_usd,
    wallets: Array.isArray(row.wallets) ? (row.wallets as Wallet[]) : [],
    zones: Array.isArray(row.zones) ? (row.zones as Zone[]) : [],
  };
}

/** How many units of each currency one Saudi riyal (the catalog base) buys. */
export function ratesFor(s: Pick<StoreSettings, "yer_per_sar" | "yer_per_usd">): Record<Currency, number> {
  return { SAR: 1, YER: s.yer_per_sar, USD: s.yer_per_sar / s.yer_per_usd };
}

export const yerToSar = (s: Pick<StoreSettings, "yer_per_sar">, yer: number) => yer / s.yer_per_sar;
