import { Link, useCanGoBack, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Heart, Home, LayoutGrid, Moon, ShoppingBag, Star, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { logoUrl, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("jood-theme");
    if (saved) setDark(saved === "dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("jood-theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <button onClick={() => setDark(!dark)} aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"} className="rounded-full p-2 text-primary">
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

export function Header() {
  const { cart } = useStore();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-surface/90 px-4 py-2 backdrop-blur">
      <Link to="/" className="flex items-center gap-2">
        <img src={logoUrl} alt="جود" className="size-12 object-contain" />
        <div className="leading-tight">
          <div className="font-bold text-primary">جود | JOOD</div>
          <div className="text-[10px] text-muted-foreground">لأن أناقتكم لا تقبل إلا الأفضل</div>
        </div>
      </Link>
      <div className="flex items-center">
        <ThemeToggle />
        <Link to="/cart" className="relative rounded-full p-2 text-primary" aria-label="الحقيبة">
          <ShoppingBag className="size-6" />
          {count > 0 && (
            <span className="absolute -top-0.5 -left-0.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{count}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const items = [
    { to: "/", label: "الرئيسية", icon: Home },
    { to: "/categories", label: "الأقسام", icon: LayoutGrid },
    { to: "/wishlist", label: "رغباتي", icon: Heart },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-surface/95 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground"
            activeProps={{ className: "text-primary" }}>
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const { format, add, toggleWish, wishlist } = useStore();
  const wished = wishlist.includes(p.id);
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="relative">
        <Link to="/product/$id" params={{ id: p.id }}>
          <img src={p.image} alt={p.name} className="aspect-[4/5] w-full object-cover" loading="lazy" />
        </Link>
        {p.badge && <span className="absolute top-2 right-2 rounded bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{p.badge}</span>}
        <button onClick={() => toggleWish(p.id)} aria-label="المفضلة" className="absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-surface/70 text-primary">
          <Heart className={`size-4 ${wished ? "fill-primary" : ""}`} />
        </button>
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-primary text-primary" /> {p.rating.toFixed(1)} ({p.reviews})
        </div>
        <Link to="/product/$id" params={{ id: p.id }} className="line-clamp-1 text-sm font-semibold">{p.name}</Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">{p.details}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-primary">{format(p.price)}</span>
          <button onClick={() => add(p.id)} aria-label="أضف للحقيبة" className="grid size-8 place-items-center rounded-md bg-gold text-primary-foreground">
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <main className="mx-auto max-w-3xl px-4 pt-5 pb-28">
      {pathname !== "/" && (
        <div className="mb-4">
          <Button asChild variant="outline" size="sm" className="text-primary">
            <Link to="/" aria-label="الرجوع للخلف" title="الرجوع للخلف" onClick={(event) => {
              if (canGoBack && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                router.history.back();
              }
            }}>
              <ArrowRight aria-hidden="true" /> رجوع
            </Link>
          </Button>
        </div>
      )}
      {children}
    </main>
  );
}
