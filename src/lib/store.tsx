import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currencies, type Currency } from "./products";

type CartItem = { id: string; qty: number };
type Store = {
  cart: CartItem[];
  wishlist: string[];
  currency: Currency;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  setCurrency: (c: Currency) => void;
  format: (sar: number) => string;
};

const Ctx = createContext<Store | null>(null);
const KEY = "jood-store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currency, setCurrency] = useState<Currency>("SAR");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (s.cart) setCart(s.cart);
      if (s.wishlist) setWishlist(s.wishlist);
      if (s.currency) setCurrency(s.currency);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ cart, wishlist, currency }));
  }, [cart, wishlist, currency, loaded]);

  const value: Store = {
    cart, wishlist, currency, setCurrency,
    add: (id) => setCart((c) => (c.some((i) => i.id === id) ? c.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) : [...c, { id, qty: 1 }])),
    setQty: (id, qty) => setCart((c) => (qty < 1 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i)))),
    remove: (id) => setCart((c) => c.filter((i) => i.id !== id)),
    clear: () => setCart([]),
    toggleWish: (id) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    format: (sar) => {
      const c = currencies[currency];
      return `${(sar * c.rate).toLocaleString("en-US", { maximumFractionDigits: currency === "USD" ? 2 : 0 })} ${c.symbol}`;
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
