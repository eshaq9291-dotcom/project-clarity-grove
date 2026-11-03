import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Heart, ShoppingBag, Star, Wallet } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/Shell";
import { getProduct } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useProductImages } from "@/lib/product-images";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} | جود | JOOD` : "قطعة غير متوفرة | جود" },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.name ?? "جود | JOOD" },
      { property: "og:description", content: loaderData?.description ?? "" },
    ],
  }),
  notFoundComponent: () => <Page><p className="text-center">القطعة غير موجودة. <Link to="/" className="text-primary">العودة</Link></p></Page>,
  component: ProductPage,
});

function ProductPage() {
  const p = Route.useLoaderData();
  const { format, add, toggleWish, wishlist } = useStore();
  const [color, setColor] = useState(p.colors[0]);
  const [added, setAdded] = useState(false);
  const { images } = useProductImages(p.id);
  const gallery = images.filter((i) => i.color === color).map((i) => i.url);
  const shown = gallery.length ? gallery : [p.image];
  const [idx, setIdx] = useState(0);
  const current = shown[Math.min(idx, shown.length - 1)] ?? p.image;
  return (
    <Page>
      <div className="md:grid md:grid-cols-2 md:gap-8">
      <div>
      <div className="relative overflow-hidden rounded-2xl border">
        <img key={current} src={current} alt={`${p.name} — ${color}`} className="aspect-square w-full object-cover animate-in fade-in duration-300" />
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded bg-gold px-2 py-1 text-xs font-bold text-primary-foreground"><BadgeCheck className="size-3.5" /> صنع يدوي 100%</span>
        <button onClick={() => toggleWish(p.id)} aria-label="المفضلة" className="absolute top-3 left-3 grid size-10 place-items-center rounded-full bg-surface/70 text-primary">
          <Heart className={`size-5 ${wishlist.includes(p.id) ? "fill-primary" : ""}`} />
        </button>
      </div>
      {shown.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {shown.map((u, i) => (
            <button key={u} onClick={() => setIdx(i)} aria-label={`صورة ${i + 1}`}
              className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${u === current ? "border-primary" : "border-transparent"}`}>
              <img src={u} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      </div>
      <div>
      <p className="mt-4 font-display text-xs tracking-widest text-primary">JOOD ATELIER EXCLUSIVES · {p.id}</p>
      <h1 className="mt-1 text-2xl font-bold">{p.name}</h1>
      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-primary text-primary" />)}
        <span className="mr-1">{p.rating} ({p.reviews} تقييم)</span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-bold text-primary">{format(p.price)}</span>
        {p.oldPrice && <span className="text-muted-foreground line-through">{format(p.oldPrice)}</span>}
      </div>
      <p className="text-xs text-muted-foreground">شامل ضريبة القيمة المضافة</p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border bg-card p-3 text-sm">
        <Wallet className="size-5 text-primary" /> قسّمها على 4 دفعات بدون فوائد بقيمة {format(p.price / 4)} شهرياً
      </div>
      <h2 className="mt-5 font-semibold">اللون</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {p.colors.map((c) => (
          <button key={c} onClick={() => { setColor(c); setIdx(0); }} className={`rounded-full border px-4 py-1.5 text-sm ${color === c ? "border-primary bg-accent text-accent-foreground" : ""}`}>{c}</button>
        ))}
      </div>
      <h2 className="mt-5 font-semibold">المقاس / الأبعاد</h2>
      <p className="mt-1 text-sm text-muted-foreground">{p.size}</p>
      <p className="mt-5 text-sm leading-7">{p.description}</p>
      <button onClick={() => { add(p.id); setAdded(true); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 font-bold text-primary-foreground shadow-gold">
        <ShoppingBag className="size-5" /> أضف إلى الحقيبة الملكية
      </button>
      {added && <Link to="/cart" className="mt-3 block text-center text-sm text-primary">تمت الإضافة ✓ عرض الحقيبة</Link>}
      </div>
      </div>
    </Page>
  );
}
