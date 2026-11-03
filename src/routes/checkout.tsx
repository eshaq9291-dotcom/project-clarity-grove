import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Upload } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { placeOrder } from "@/lib/orders.functions";
import { Page } from "@/components/Shell";
import { yerToSar } from "@/lib/settings";
import { useStore } from "@/lib/store";
import { Row, useTotals } from "./cart";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): { code?: string } => (typeof s["code"] === "string" ? { code: s["code"] } : {}),
  head: () => ({
    meta: [
      { title: "إتمام الطلب | جود | JOOD" },
      { name: "description", content: "اختر منطقتك داخل صنعاء وطريقة الدفع وأتمم طلبك من جود." },
      { property: "og:title", content: "إتمام الطلب | جود" },
      { property: "og:description", content: "توصيل داخل صنعاء ودفع عند الاستلام أو عبر المحافظ." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { code = "" } = Route.useSearch();
  const { format, clear, cart, currency, settings } = useStore();
  const { zones: sanaaZones } = settings;
  const wallets = settings.wallets.filter((w) => w.account.trim());
  const submit = useServerFn(placeOrder);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { items, subtotal, discount, total } = useTotals(code);
  const [done, setDone] = useState<string | null>(null);
  const [zone, setZone] = useState("");
  const [pay, setPay] = useState<"cod" | "wallet">("cod");
  const [walletChoice, setWallet] = useState("");
  const wallet = wallets.some((w) => w.id === walletChoice) ? walletChoice : (wallets[0]?.id ?? "");
  const [receipt, setReceipt] = useState<string | null>(null);

  const shipping = yerToSar(settings, sanaaZones.find((z) => z.id === zone)?.feeYER ?? 0);

  if (done)
    return (
      <Page>
        <div className="mt-16 text-center">
          <CheckCircle2 className="mx-auto size-16 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">تم استلام طلبك</h1>
          <p className="mt-2 text-muted-foreground">رقم الطلب: {done}</p>
          {pay === "wallet" && <p className="mt-1 text-sm text-muted-foreground">سنراجع إشعار الحوالة ونؤكد طلبك قريباً.</p>}
          <Link to="/" className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-bold text-primary-foreground">العودة للرئيسية</Link>
        </div>
      </Page>
    );

  if (!items.length) return <Page><p className="mt-16 text-center">الحقيبة فارغة. <Link to="/categories" className="text-primary">تسوّق</Link></p></Page>;

  const field = "w-full rounded-xl border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";
  const chip = (on: boolean) => `rounded-lg border py-2.5 text-sm ${on ? "border-primary bg-accent text-accent-foreground" : ""}`;
  const selected = wallets.find((w) => w.id === wallet) ?? wallets[0] ?? { id: "", name: "", account: "" };

  return (
    <Page>
      <h1 className="text-2xl font-bold">الشحن والدفع</h1>
      <form
        className="mt-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true); setErr(null);
          try {
            const r = await submit({ data: {
              name: String(f.get("name")), phone: String(f.get("phone")), address: String(f.get("address")),
              zone, items: cart, code, currency, payment: pay,
              wallet: pay === "wallet" ? wallet : undefined,
              receipt: pay === "wallet" ? receipt ?? undefined : undefined,
            } });
            setDone(r.orderNumber); clear();
          } catch (x) { setErr(x instanceof Error ? x.message : "حدث خطأ"); }
          finally { setBusy(false); }
        }}
      >
        <input required name="name" placeholder="الاسم الكامل" className={field} />
        <input required name="phone" type="tel" placeholder="رقم الجوال" className={field} />
        <label className="block text-sm font-semibold">المنطقة داخل صنعاء</label>
        <select required value={zone} onChange={(e) => setZone(e.target.value)} className={field}>
          <option value="">اختر المنطقة</option>
          {sanaaZones.map((z) => <option key={z.id} value={z.id}>{z.name} — {format(yerToSar(settings, z.feeYER))}</option>)}
        </select>
        <textarea required name="address" placeholder="العنوان التفصيلي (الشارع، أقرب معلم)" rows={2} className={field} />

        <div className="text-sm font-semibold">طريقة الدفع</div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPay("cod")} className={chip(pay === "cod")}>الدفع عند الاستلام</button>
          {wallets.length > 0 && <button type="button" onClick={() => setPay("wallet")} className={chip(pay === "wallet")}>محفظة / حوالة بنكية</button>}
        </div>

        {pay === "wallet" && wallets.length > 0 && (
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="grid grid-cols-2 gap-2">
              {wallets.map((w) => <button type="button" key={w.id} onClick={() => setWallet(w.id)} className={chip(wallet === w.id)}>{w.name}</button>)}
            </div>
            <p className="text-sm">حوّل مبلغ <b className="text-primary">{format(total + shipping)}</b> إلى حساب {selected.name} رقم <b className="tracking-wider">{selected.account}</b> ثم ارفع صورة الإشعار.</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              {receipt ? <img src={receipt} alt="إشعار الحوالة" className="max-h-48 rounded-lg" /> : <Upload className="size-6 text-primary" />}
              {receipt ? "تغيير الصورة" : "رفع إشعار الحوالة"}
              <input
                type="file" accept="image/*" required className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => setReceipt(String(rd.result)); rd.readAsDataURL(f); }}
              />
            </label>
          </div>
        )}

        <div className="space-y-2 rounded-xl border bg-card p-4 text-sm">
          <Row l={`المقتنيات (${items.length})`} v={format(subtotal)} />
          {discount > 0 && <Row l="الخصم" v={`- ${format(discount)}`} />}
          <Row l="التوصيل" v={zone ? format(shipping) : "اختر المنطقة"} />
          <div className="border-t pt-2"><Row l="الإجمالي" v={format(total + shipping)} bold /></div>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-gold py-3.5 font-bold text-primary-foreground shadow-gold disabled:opacity-60">{busy ? (pay === "wallet" ? "جارٍ إرسال الطلب وقراءة الإشعار..." : "جارٍ إرسال الطلب...") : "تأكيد الطلب"}</button>
      </form>
    </Page>
  );
}
