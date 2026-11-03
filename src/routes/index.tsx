import identityBeige from "@/assets/jood-identity-beige.png.asset.json";
import identityBlack from "@/assets/jood-identity-black.png.asset.json";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Gem, Gift, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { Page, ProductCard } from "@/components/Shell";
import { categories, DISCOUNT_CODE, logoUrl, products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "جود | JOOD | شيلان وحقائب ومكياج فاخر" },
      { name: "description", content: "متجر جود: شيلان رجالية ونسائية فاخرة، حقائب راقية، صنادل كعب ومستحضرات تجميل." },
      { property: "og:title", content: "جود | JOOD | أناقة لا تقبل إلا بالأفضل" },
      { property: "og:description", content: "شيلان فاخرة وحقائب راقية وصنادل سهرة ومكياج فاخر." },
    ],
  }),
  component: Index,
});

function Index() {
  const [tab, setTab] = useState<"top" | "new">("top");
  const list = tab === "top" ? [...products].sort((a, b) => b.reviews - a.reviews) : [...products].reverse();
  return (
    <Page>
      <section className="-mx-4 -mt-2 mb-6 overflow-hidden rounded-b-3xl sm:mx-0 sm:rounded-3xl">
        <img src={identityBeige.url} alt="هوية جود" className="block aspect-square w-full object-cover dark:hidden" />
        <img src={identityBlack.url} alt="هوية جود" className="hidden aspect-square w-full object-cover dark:block" />
      </section>
      <section className="text-center">
        <img src={logoUrl} alt="شعار جود" className="mx-auto size-40 object-contain drop-shadow-[0_8px_24px_var(--primary)]" />
        <h1 className="mt-4 font-display text-3xl font-bold text-primary">جود | JOOD</h1>
        <p className="mt-2 text-lg font-semibold">لأن أناقتكم لا تقبل إلا الأفضل</p>
        <p className="mt-2 text-sm text-muted-foreground">شيلان رجالية ونسائية فاخرة | حقائب نسائية راقية | صنادل كعب مميزة | أرقى خيارات الـ Makeup</p>
        <Link to="/categories" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gold py-3.5 font-bold text-primary-foreground shadow-gold">
          اكتشف التشكيلة الجديدة <ArrowLeft className="size-4" />
        </Link>
      </section>

      <section className="mt-6 flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-primary"><BadgeCheck className="size-4" /> إصدار ملكي محدود</div>
          <div className="mt-1 font-bold">مجموعة جود الحصرية</div>
          <div className="text-xs text-muted-foreground">خصم استثنائي حتى 25% بمناسبة التدشين الرسمي</div>
        </div>
        <div className="rounded-lg border border-dashed border-primary/60 px-3 py-2 text-center">
          <div className="text-[10px] text-muted-foreground">كود الخصم</div>
          <div className="font-display font-bold tracking-wider text-primary">{DISCOUNT_CODE}</div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">أقسامنا الراقية</h2>
          <Link to="/categories" className="text-xs text-primary">عرض الكل</Link>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {categories.map((c) => (
            <Link key={c.id} to="/categories" search={{ c: c.id }} className="w-28 shrink-0 text-center">
              <img src={c.image} alt={c.name} className="aspect-square w-full rounded-xl border object-cover" />
              <div className="mt-2 text-sm font-semibold">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">{c.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">القطع الأكثر طلباً</h2>
            <p className="text-xs text-muted-foreground">انتقاء يدوي من أحدث إبداعات الدار</p>
          </div>
          <div className="flex rounded-lg border p-0.5 text-xs">
            {(["top", "new"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1 ${tab === t ? "bg-gold text-primary-foreground" : "text-muted-foreground"}`}>
                {t === "top" ? "المختارة" : "الأحدث"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="mt-8 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 font-bold"><Gem className="size-5 text-primary" /> معايير الدار الملكية «جود»</div>
        <p className="mt-1 text-sm text-muted-foreground">كل قطعة تخضع لمعايير الفحص اليدوي لضمان نقاء الخيوط وجودة الصنع الفائقة.</p>
      </section>
      <section className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {[
          { i: ShieldCheck, t: "أصالة وجودة 100%", s: "شهادات مطابقة معتمدة" },
          { i: Gift, t: "تغليف ملكي فاخر", s: "صناديق مخمل وأشرطة" },
          { i: Truck, t: "شحن سريع وآمن", s: "توصيل لكافة المدن" },
          { i: BadgeCheck, t: "VIP Stylist خاص", s: "استشارات تنسيق 24/7" },
        ].map(({ i: I, t, s }) => (
          <div key={t} className="flex items-center gap-2 rounded-xl border bg-card p-3">
            <I className="size-5 shrink-0 text-primary" />
            <div><div className="font-semibold">{t}</div><div className="text-[11px] text-muted-foreground">{s}</div></div>
          </div>
        ))}
      </section>
    </Page>
  );
}
