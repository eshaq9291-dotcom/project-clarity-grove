import { Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProductImages } from "@/lib/product-images";
import { products } from "@/lib/products";

const field = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

/** Owner uploads a separate photo set for each colour of each product. */
export function ProductPhotosPanel() {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const product = products.find((p) => p.id === productId);
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const { images, reload } = useProductImages(productId);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const forColor = images.filter((i) => i.color === color);

  async function upload(files: FileList) {
    setBusy(true); setMsg(null);
    try {
      let sort = forColor.length;
      for (const f of Array.from(files)) {
        const path = `${productId}/${crypto.randomUUID()}.${f.name.split(".").pop() || "jpg"}`;
        const up = await supabase.storage.from("product-images").upload(path, f, { contentType: f.type });
        if (up.error) throw up.error;
        const ins = await supabase.from("product_images").insert({ product_id: productId, color, path, sort: sort++ });
        if (ins.error) throw ins.error;
      }
      await reload();
      setMsg("تم رفع الصور.");
    } catch {
      setMsg("تعذر رفع الصور.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, path: string) {
    await supabase.from("product_images").delete().eq("id", id);
    await supabase.storage.from("product-images").remove([path]);
    await reload();
  }

  return (
    <section className="mt-6 space-y-4 rounded-xl border bg-card p-4">
      <h2 className="text-xl font-bold">صور المنتجات حسب اللون</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">المنتج
          <select className={field} value={productId}
            onChange={(e) => { setProductId(e.target.value); setColor(products.find((p) => p.id === e.target.value)?.colors[0] ?? ""); }}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="text-sm">اللون
          <select className={field} value={color} onChange={(e) => setColor(e.target.value)}>
            {product?.colors.map((c) => (
              <option key={c} value={c}>{c} ({images.filter((i) => i.color === c).length} صور)</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {forColor.map((i) => (
          <div key={i.id} className="relative">
            <img src={i.url} alt={color} className="aspect-square w-full rounded-lg object-cover" />
            <button onClick={() => remove(i.id, i.path)} aria-label="حذف الصورة"
              className="absolute top-1 left-1 grid size-7 place-items-center rounded-full bg-surface/80 text-destructive">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground">
          <Upload className="size-5 text-primary" />
          {busy ? "جارٍ الرفع..." : "إضافة صور"}
          <input type="file" accept="image/*" multiple className="sr-only" disabled={busy}
            onChange={(e) => { if (e.target.files?.length) void upload(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">إذا لم تُضف صوراً للون، تظهر الصورة الأساسية للمنتج.</p>
      {msg && <p className="text-sm text-primary">{msg}</p>}
    </section>
  );
}
