import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Page, ProductCard } from "@/components/Shell";
import { categories, products, type CategoryId } from "@/lib/products";

export const Route = createFileRoute("/categories")({
  validateSearch: (s: Record<string, unknown>): { c?: CategoryId } =>
    categories.some((x) => x.id === s["c"]) ? { c: s["c"] as CategoryId } : {},
  head: () => ({
    meta: [
      { title: "الأقسام والمجموعات | جود | JOOD" },
      { name: "description", content: "تصفح شيلان جود الفاخرة والحقائب وأحذية السهرة ومستحضرات التجميل." },
      { property: "og:title", content: "الأقسام والمجموعات الملكية | جود" },
      { property: "og:description", content: "استكشف إبداعات دار جود." },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { c } = Route.useSearch();
  const [q, setQ] = useState("");
  const list = products.filter((p) => (!c || p.category === c) && (!q || p.name.includes(q) || p.details.includes(q)));
  return (
    <Page>
      <p className="font-display text-xs tracking-widest text-primary">HAUTE COUTURE INDEX</p>
      <h1 className="mt-1 text-2xl font-bold">الأقسام والمجموعات الملكية</h1>
      <p className="mt-1 text-sm text-muted-foreground">استكشف إبداعات دار جود من الشيلان الفاخرة، الحقائب الجلدية، أحذية السهرة، ومستحضرات التجميل.</p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border bg-card px-3">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن قطعة..." className="w-full bg-transparent py-3 text-sm outline-none" />
      </div>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        <Link to="/categories" search={{}} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${!c ? "bg-gold text-primary-foreground" : ""}`}>الكل</Link>
        {categories.map((x) => (
          <Link key={x.id} to="/categories" search={{ c: x.id }} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${c === x.id ? "bg-gold text-primary-foreground" : ""}`}>{x.name}</Link>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-muted-foreground">لا توجد قطع مطابقة.</p>}
    </Page>
  );
}
