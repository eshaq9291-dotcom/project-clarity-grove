import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/Shell";
import { useStore } from "@/lib/store";
import { Row, useTotals } from "./cart";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): { code?: string } => (typeof s["code"] === "string" ? { code: s["code"] } : {}),
  head: () => ({
    meta: [
      { title: "إتمام الطلب | جود كوتور" },
      { name: "description", content: "أدخل بيانات الشحن وأتمم طلبك من جود." },
      { property: "og:title", content: "إتمام الطلب الملكي | جود" },
      { property: "og:description", content: "الشحن والدفع الآمن." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { code = "" } = Route.useSearch();
  const { format, clear } = useStore();
  const { items, subtotal, discount, total } = useTotals(code);
  const [done, setDone] = useState<string | null>(null);
  const [pay, setPay] = useState("عند الاستلام");

  if (done)
    return (
      <Page>
        <div className="mt-16 text-center">
          <CheckCircle2 className="mx-auto size-16 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">تم استلام طلبك الملكي</h1>
          <p className="mt-2 text-muted-foreground">رقم الطلب: {done}</p>
          <Link to="/" className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-bold text-primary-foreground">العودة للرئيسية</Link>
        </div>
      </Page>
    );

  if (!items.length) return <Page><p className="mt-16 text-center">الحقيبة فارغة. <Link to="/categories" className="text-primary">تسوّق</Link></p></Page>;

  const field = "w-full rounded-xl border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";
  return (
    <Page>
      <h1 className="text-2xl font-bold">الشحن والدفع</h1>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => { e.preventDefault(); setDone("JD-" + Math.floor(100000 + Math.random() * 900000)); clear(); }}
      >
        <input required placeholder="الاسم الكامل" className={field} />
        <input required type="tel" placeholder="رقم الجوال" className={field} />
        <input required placeholder="المدينة" className={field} />
        <textarea required placeholder="العنوان التفصيلي" rows={3} className={field} />
        <div className="text-sm font-semibold">طريقة الدفع</div>
        <div className="grid grid-cols-3 gap-2">
          {["عند الاستلام", "تابي", "تمارا"].map((m) => (
            <button type="button" key={m} onClick={() => setPay(m)} className={`rounded-lg border py-2 text-sm ${pay === m ? "border-primary bg-accent text-accent-foreground" : ""}`}>{m}</button>
          ))}
        </div>
        <div className="space-y-2 rounded-xl border bg-card p-4 text-sm">
          <Row l={`المقتنيات (${items.length})`} v={format(subtotal)} />
          {discount > 0 && <Row l="الخصم" v={`- ${format(discount)}`} />}
          <Row l="الشحن" v="مجاني" />
          <div className="border-t pt-2"><Row l="الإجمالي" v={format(total)} bold /></div>
        </div>
        <button className="w-full rounded-xl bg-gold py-3.5 font-bold text-primary-foreground shadow-gold">تأكيد الطلب</button>
      </form>
    </Page>
  );
}
