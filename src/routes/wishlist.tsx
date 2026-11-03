import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, ProductCard } from "@/components/Shell";
import { products } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "قائمة رغباتي | جود | JOOD" },
      { name: "description", content: "مقتنياتك المفضلة المحفوظة في جود." },
      { property: "og:title", content: "قائمة رغباتي الملكية | جود" },
      { property: "og:description", content: "مقتنياتك المفضلة المحفوظة بعناية." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist, add } = useStore();
  const list = products.filter((p) => wishlist.includes(p.id));
  return (
    <Page>
      <h1 className="text-2xl font-bold">قائمة رغباتي الملكية</h1>
      <p className="mt-1 text-sm text-muted-foreground">{list.length} قطع محفوظة لاختيار إطلالتك القادمة.</p>
      {list.length > 0 && (
        <button onClick={() => list.forEach((p) => add(p.id))} className="mt-4 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-primary-foreground">نقل الكل للحقيبة</button>
      )}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {list.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">لا توجد قطع محفوظة بعد. <Link to="/categories" className="text-primary">تصفح الأقسام</Link></p>
      )}
    </Page>
  );
}
