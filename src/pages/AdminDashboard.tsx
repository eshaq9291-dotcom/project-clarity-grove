import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  LogOut,
  Package,
  Save,
  Image as ImageIcon,
} from "lucide-react";

type ProductData = {
  description?: string;
  details?: string;
  colors?: string[];
  size?: string;
  badge?: string;
  stock?: number;
  seo_title?: string;
  seo_description?: string;
  image?: string;
  colorImages?: Record<string, string>;
};

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price_yer: number;
  compare_at_yer: number | null;
  data: Json;
  featured: boolean;
  active: boolean;
};

type ImageRow = {
  id: string;
  product_id: string;
  color: string;
  path: string;
  sort: number;
};

const CATEGORIES = [
  { id: "men-shawls", label: "شيلان رجالية" },
  { id: "women-shawls", label: "شيلان نسائية" },
  { id: "bags", label: "حقائب راقية" },
  { id: "heels", label: "صنادل كعب" },
  { id: "makeup", label: "مستحضرات التجميل" },
];

export function AdminDashboard({
  session,
  onLogout,
}: {
  session: string;
  onLogout: () => void;
}) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts((data as ProductRow[] | null) ?? []);
    setLoading(false);
  };

  const loadImages = async () => {
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .order("sort", { ascending: true });
    setImages((data as ImageRow[] | null) ?? []);
  };

  useEffect(() => {
    loadProducts();
    loadImages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    await supabase.rpc("jood_admin_product_delete", { _session: session, _id: id });
    loadProducts();
    loadImages();
  };

  const openEdit = (p: ProductRow) => {
    setEditing(p);
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const catLabel = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#D4AF37]/20 bg-zinc-900 px-4 py-3">
        <h1 className="flex items-center gap-2 font-bold text-[#D4AF37]">
          <Package className="size-5" /> JOOD Admin
        </h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          <LogOut className="size-4" /> خروج
        </button>
      </header>

      <div className="mx-auto max-w-5xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#D4AF37]">إدارة المنتجات</h2>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black"
          >
            <Plus className="size-4" /> منتج جديد
          </button>
        </div>

        {/* Heels size chart */}
        <HeelsSizeChart />

        {/* Product list */}
        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-500">جاري التحميل...</p>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-sm text-zinc-400">لا توجد منتجات بعد. أضف أول منتج.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((p) => {
              const d = (p.data ?? {}) as ProductData;
              return (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
                >
                  <div className="flex gap-3 p-3">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-black">
                      {d.image ? (
                        <img
                          src={d.image}
                          alt={p.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-zinc-600">
                          <ImageIcon className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold">{p.name}</span>
                        <span className="shrink-0 rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                          {catLabel(p.category)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">#{p.id}</p>
                      <p className="text-xs text-[#D4AF37]">
                        {Number(p.price_yer).toLocaleString("en-US")} ر.ي
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        مخزون: {d.stock ?? 0} {!p.active && "• غير مفعّل"}
                      </p>
                    </div>
                  </div>
                  <div className="flex border-t border-zinc-800">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
                    >
                      <Pencil className="size-3.5" /> تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 border-r border-zinc-800 py-2 text-xs text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="size-3.5" /> حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          session={session}
          product={editing}
          existingImages={images.filter((i) => editing && i.product_id === editing.id)}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            loadProducts();
            loadImages();
          }}
        />
      )}
    </div>
  );
}

// ── Heels size chart ─────────────────────────────────────────────
function HeelsSizeChart() {
  const sizes = [
    { eu: "36", us: "5.5", length: "22.5", heel: "5" },
    { eu: "37", us: "6", length: "23.0", heel: "5" },
    { eu: "38", us: "7", length: "23.5", heel: "7" },
    { eu: "39", us: "8", length: "24.0", heel: "7" },
    { eu: "40", us: "9", length: "24.5", heel: "9" },
    { eu: "41", us: "10", length: "25.5", heel: "9" },
  ];

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-zinc-900">
      <div className="border-b border-[#D4AF37]/20 px-4 py-2.5">
        <h3 className="text-sm font-bold text-[#D4AF37]">
          جدول مقاسات صنادل الكعب العالية
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-black/40 text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-right font-medium">EU</th>
              <th className="px-3 py-2 text-right font-medium">US</th>
              <th className="px-3 py-2 text-right font-medium">طول القدم (سم)</th>
              <th className="px-3 py-2 text-right font-medium">ارتفاع الكعب (سم)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((s) => (
              <tr key={s.eu} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-zinc-200">{s.eu}</td>
                <td className="px-3 py-2 text-zinc-200">{s.us}</td>
                <td className="px-3 py-2 text-zinc-200">{s.length}</td>
                <td className="px-3 py-2 text-zinc-200">{s.heel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-800 px-4 py-2.5">
        <p className="text-xs text-[#D4AF37]">
          نصيحة: إذا كنت بين مقاسين اختاري الأكبر
        </p>
      </div>
    </div>
  );
}

// ── Product form (add/edit) ──────────────────────────────────────
function ProductForm({
  session,
  product,
  existingImages,
  onClose,
  onSaved,
}: {
  session: string;
  product: ProductRow | null;
  existingImages: ImageRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const d = ((product?.data ?? {}) as ProductData);
  const [id, setId] = useState(product?.id ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "men-shawls");
  const [price, setPrice] = useState(String(product?.price_yer ?? ""));
  const [compareAt, setCompareAt] = useState(
    product?.compare_at_yer ? String(product.compare_at_yer) : "",
  );
  const [description, setDescription] = useState(d.description ?? "");
  const [details, setDetails] = useState(d.details ?? "");
  const [colors, setColors] = useState((d.colors ?? []).join(", "));
  const [size, setSize] = useState(d.size ?? "");
  const [badge, setBadge] = useState(d.badge ?? "");
  const [stock, setStock] = useState(String(d.stock ?? "0"));
  const [seoTitle, setSeoTitle] = useState(d.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(d.seo_description ?? "");
  const [image, setImage] = useState(d.image ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    setError(null);
    if (!id.trim() || !name.trim()) {
      setError("المعرف والاسم مطلوبان");
      return;
    }
    setSaving(true);
    const data: ProductData = {
      description,
      details,
      colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
      size,
      badge,
      stock: parseInt(stock, 10) || 0,
      seo_title: seoTitle,
      seo_description: seoDesc,
      image,
    };
    try {
      const { error: e } = await supabase.rpc("jood_admin_product_upsert", {
        _session: session,
        _id: id.trim(),
        _name: name.trim(),
        _category: category,
        _price_yer: parseFloat(price) || 0,
        _compare_at_yer: compareAt ? parseFloat(compareAt) : null,
        _data: data as unknown as Json,
        _featured: featured,
        _active: active,
      });
      if (e) throw e;
      onSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ في الحفظ";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-[#D4AF37]/30 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#D4AF37]">
            {product ? "تعديل منتج" : "منتج جديد"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Image */}
          <div className="flex items-center gap-3">
            <div className="size-24 shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-black">
              {image ? (
                <img src={image} alt="" className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-zinc-600">
                  <ImageIcon className="size-6" />
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
              >
                رفع صورة المنتج
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="المعرف (ID)">
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={!!product}
                className="form-input"
                placeholder="JD-0000"
              />
            </Field>
            <Field label="الاسم">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="القسم">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="السعر (ر.ي)">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="form-input"
              />
            </Field>
            <Field label="السعر القديم (اختياري)">
              <input
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                type="number"
                className="form-input"
              />
            </Field>
            <Field label="المخزون">
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                type="number"
                className="form-input"
              />
            </Field>
          </div>

          <Field label="الألوان (افصل بفاصلة)">
            <input
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="form-input"
              placeholder="ذهبي, أسود, عاجي"
            />
          </Field>

          <Field label="المقاس / الحجم">
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="form-input"
              placeholder="36 – 41 أو متوسط"
            />
          </Field>

          <Field label="الشارة (Badge)">
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="form-input"
              placeholder="قطعة ملكية"
            />
          </Field>

          <Field label="التفاصيل المختصرة">
            <input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="form-input"
            />
          </Field>

          <Field label="الوصف الكامل">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="form-input resize-none"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="SEO العنوان">
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="SEO الوصف">
              <input
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                className="form-input"
              />
            </Field>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              مميز
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              مفعّل
            </label>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              <Save className="size-4" /> {saving ? "..." : "حفظ"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
