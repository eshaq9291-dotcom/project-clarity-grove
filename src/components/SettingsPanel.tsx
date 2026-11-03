import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { saveSettings } from "@/lib/settings.functions";
import type { StoreSettings } from "@/lib/settings";
import { useStore } from "@/lib/store";

const field = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

export function SettingsPanel() {
  const { settings, reloadSettings } = useStore();
  const save = useServerFn(saveSettings);
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => setDraft(settings), [settings]);

  const setWallet = (i: number, account: string) =>
    setDraft((d) => ({ ...d, wallets: d.wallets.map((w, j) => (j === i ? { ...w, account } : w)) }));
  const setZone = (i: number, patch: Partial<StoreSettings["zones"][number]>) =>
    setDraft((d) => ({ ...d, zones: d.zones.map((z, j) => (j === i ? { ...z, ...patch } : z)) }));

  return (
    <section className="mt-6 space-y-5 rounded-xl border bg-card p-4">
      <h2 className="text-xl font-bold">إعدادات المتجر</h2>

      <div>
        <h3 className="mb-2 font-semibold">أسعار الصرف</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">1 ريال سعودي = ? ريال يمني
            <input type="number" min="0" step="any" className={field} value={draft.yer_per_sar}
              onChange={(e) => setDraft({ ...draft, yer_per_sar: Number(e.target.value) })} />
          </label>
          <label className="text-sm">1 دولار = ? ريال يمني
            <input type="number" min="0" step="any" className={field} value={draft.yer_per_usd}
              onChange={(e) => setDraft({ ...draft, yer_per_usd: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">أرقام المحافظ</h3>
        <p className="mb-2 text-xs text-muted-foreground">المحفظة بدون رقم لا تظهر للزبائن.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {draft.wallets.map((w, i) => (
            <label key={w.id} className="text-sm">{w.name}
              <input dir="ltr" inputMode="numeric" placeholder="غير محدد" className={field} value={w.account}
                onChange={(e) => setWallet(i, e.target.value)} />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">رسوم التوصيل داخل صنعاء (ريال يمني)</h3>
        <div className="space-y-2">
          {draft.zones.map((z, i) => (
            <div key={z.id} className="flex gap-2">
              <input aria-label="اسم المنطقة" className={field} value={z.name} onChange={(e) => setZone(i, { name: e.target.value })} />
              <input aria-label="الرسوم" type="number" min="0" className={`${field} max-w-32`} value={z.feeYER}
                onChange={(e) => setZone(i, { feeYER: Number(e.target.value) })} />
              <button type="button" aria-label="حذف المنطقة" onClick={() => setDraft({ ...draft, zones: draft.zones.filter((_, j) => j !== i) })}
                className="px-2 text-muted-foreground"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setDraft({ ...draft, zones: [...draft.zones, { id: `z-${Date.now()}`, name: "", feeYER: 0 }] })}
          className="mt-2 flex items-center gap-1 text-sm text-primary"><Plus className="size-4" /> إضافة منطقة</button>
      </div>

      <div className="flex items-center gap-3">
        <button disabled={busy}
          onClick={async () => {
            setBusy(true); setMsg(null);
            try { await save({ data: draft }); await reloadSettings(); setMsg({ ok: true, text: "تم الحفظ — التغييرات ظاهرة لكل الزبائن الآن." }); }
            catch (x) { setMsg({ ok: false, text: x instanceof Error ? x.message : "تعذر الحفظ" }); }
            finally { setBusy(false); }
          }}
          className="rounded-xl bg-gold px-6 py-2.5 font-bold text-primary-foreground disabled:opacity-60">
          {busy ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </button>
        {msg && <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
      </div>
    </section>
  );
}
