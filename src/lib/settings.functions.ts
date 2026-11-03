import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { StoreSettings } from "./settings";

/** Validates owner-entered settings; throws an Arabic message on bad input. */
export function validateSettings(d: StoreSettings): StoreSettings {
  const num = (v: unknown) => Number(v);
  if (!(num(d.yer_per_sar) > 0) || !(num(d.yer_per_usd) > 0)) throw new Error("أسعار الصرف يجب أن تكون أكبر من صفر");
  if (!Array.isArray(d.wallets) || !Array.isArray(d.zones) || d.zones.length === 0) throw new Error("أضف منطقة توصيل واحدة على الأقل");
  const wallets = d.wallets.map((w) => ({ id: String(w.id), name: String(w.name).trim(), account: String(w.account ?? "").trim() }));
  const zones = d.zones.map((z) => ({ id: String(z.id), name: String(z.name).trim(), feeYER: num(z.feeYER) }));
  if (zones.some((z) => !z.name || !(z.feeYER >= 0))) throw new Error("كل منطقة تحتاج اسماً ورسوماً صحيحة");
  if (wallets.some((w) => !w.name || w.account.length > 40)) throw new Error("بيانات محفظة غير صحيحة");
  return { yer_per_sar: num(d.yer_per_sar), yer_per_usd: num(d.yer_per_usd), wallets, zones };
}

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: StoreSettings) => validateSettings(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("غير مصرح");
    const { error } = await context.supabase
      .from("store_settings")
      .update({ ...data, updated_at: new Date().toISOString(), updated_by: context.userId })
      .eq("id", 1);
    if (error) throw new Error("تعذر الحفظ");
    return { ok: true };
  });
