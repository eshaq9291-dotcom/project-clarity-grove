import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/Shell";
import { currencies, DISCOUNT_CODE, DISCOUNT_RATE, getProduct, type Currency } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "الحقيبة الملكية | جود كوتور" },
      { name: "description", content: "راجع مقتنياتك وأتمم طلبك من جود." },
      { property: "og:title", content: "الحقيبة الملكية | جود" },
      { property: "og:description", content: "راجع مقتنياتك الفاخرة." },
    ],
  }),
  component: Cart,
});

export function useTotals(code: string) {
  const { cart } = useStore();
  const items = cart.map((i) => ({ ...i, p: getProduct(i.id)! })).filter((i) => i.p);
  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const discount = code.trim().toUpperCase() === DISCOUNT_CODE ? subtotal * DISCOUNT_RATE : 0;
  return { items, subtotal, discount, total: subtotal - discount };
}

function Cart() {
  const { setQty, remove, clear, format, currency, setCurrency } = useStore();
  const [code, setCode] = useState("");
  const { items, subtotal, discount, total } = useTotals(code);

  if (!items.length)
    return <Page><div className="mt-16 text-center"><h1 className="text-xl font-bold">حقيبتك فارغة</h1><Link to="/categories" className="mt-4 inline-block rounded-xl bg-gold px-6 py-3 font-bold text-primary-foreground">تسوّق الآن</Link></div></Page>;

  return (
    <Page>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مقتنياتك الفاخرة ({items.length})</h1>
        <button onClick={clear} className="text-xs text-destructive">تفريغ الحقيبة</button>
      </div>

      <div className="mt-4 rounded-xl border bg-card p-3">
        <div className="text-sm font-semibold">عملة الدفع والفاتورة</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(Object.keys(currencies) as Currency[]).map((k) => (
            <button key={k} onClick={() => setCurrency(k)} className={`rounded-lg border px-2 py-2 text-xs ${currency === k ? "border-primary bg-accent text-accent-foreground" : ""}`}>
              {currencies[k].flag} {currencies[k].label} ({currencies[k].symbol})
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map(({ p, qty }) => (
          <div key={p.id} className="flex gap-3 rounded-xl border bg-card p-3">
            <img src={p.image} alt={p.name} className="size-24 rounded-lg object-cover" />
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-2">
                <Link to="/product/$id" params={{ id: p.id }} className="text-sm font-semibold">{p.name}</Link>
                <button onClick={() => remove(p.id)} aria-label="حذف"><X className="size-4 text-muted-foreground" /></button>
              </div>
              <p className="text-xs text-muted-foreground">{p.details}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-primary"><Gift className="size-3" /> تغليف إهداء مذهب مجاناً</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="font-bold text-primary">{format(p.price * qty)}</span>
                <div className="flex items-center gap-3 rounded-lg border px-2 py-1">
                  <button onClick={() => setQty(p.id, qty - 1)} aria-label="إنقاص"><Minus className="size-4" /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(p.id, qty + 1)} aria-label="زيادة"><Plus className="size-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="كود الخصم" className="flex-1 rounded-xl border bg-card px-3 py-2.5 text-sm outline-none" />
      </div>

      <div className="mt-4 space-y-2 rounded-xl border bg-card p-4 text-sm">
        <Row l="المجموع الفرعي" v={format(subtotal)} />
        {discount > 0 && <Row l={`خصم ${DISCOUNT_CODE}`} v={`- ${format(discount)}`} />}
        <Row l="الشحن الخاص" v="مجاني" />
        <div className="border-t pt-2"><Row l="الإجمالي" v={format(total)} bold /></div>
      </div>
      <Link to="/checkout" search={{ code }} className="mt-5 block rounded-xl bg-gold py-3.5 text-center font-bold text-primary-foreground shadow-gold">إتمام الطلب الملكي</Link>
    </Page>
  );
}

export function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "text-base font-bold text-primary" : ""}`}><span>{l}</span><span>{v}</span></div>;
}
