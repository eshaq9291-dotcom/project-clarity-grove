import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

export function AdminProducts() {
  const [rows, setRows] = useState<Tables<'products'>[]>([]);
  const [edit, setEdit] = useState<Tables<'products'> | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const r = await supabase.from('products').select('*').order('created_at');
    if (r.error) setMessage(r.error.message); else setRows(r.data ?? []);
  };
  useEffect(() => { void load(); }, []);
  const data = edit?.data && typeof edit.data === 'object' && !Array.isArray(edit.data) ? edit.data : {};
  const field = 'w-full rounded border border-border bg-background p-3 text-foreground';
  return <section>
    <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-primary">إدارة المنتجات</h2><Button onClick={() => { setEdit(null); setOpen(true); }}><Plus /> إضافة منتج</Button></div>
    {message && <p role="status" className="mb-4 text-primary">{message}</p>}
    {open && <form key={edit?.id ?? 'new'} className="mb-6 grid gap-3 md:grid-cols-2" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setMessage('');
      const f = new FormData(e.currentTarget);
      const colors = String(f.get('colors')).split(',').map(x => x.trim()).filter(Boolean);
      const stock = Number(f.get('stock'));
      const value: Json = { ...data, colors, size: String(f.get('size')), stock, image: String(f.get('image')), variants: [{ color: colors[0] ?? '', size: String(f.get('size')), stock }] };
      const r = await supabase.rpc('save_admin_product', { _id: edit?.id ?? `JD-${crypto.randomUUID()}`, _name: String(f.get('name')), _category: String(f.get('category')), _price: Number(f.get('price')), _data: value, _stock: stock });
      setBusy(false);
      if (r.error) setMessage(r.error.message); else { setOpen(false); setMessage('تم حفظ المنتج'); await load(); }
    }}>
      <label>اسم المنتج<input name="name" aria-label="اسم المنتج" required defaultValue={edit?.name} className={field} /></label>
      <label>القسم<select name="category" defaultValue={edit?.category ?? 'heels'} className={field}><option value="heels">Sandals / صنادل</option><option value="men-shawls">شيلان رجالية</option><option value="women-shawls">شيلان نسائية</option><option value="bags">حقائب</option><option value="makeup">ميكب</option></select></label>
      <label>السعر ر.ي<input name="price" aria-label="السعر ر.ي" type="number" min="0" step="0.01" required defaultValue={edit?.price_yer} className={field} /></label>
      <label>المخزون<input name="stock" aria-label="المخزون" type="number" min="0" step="1" required defaultValue={Number(data?.['stock'] ?? 0)} className={field} /></label>
      <label>الألوان<input name="colors" defaultValue={Array.isArray(data?.['colors']) ? data['colors'].join(', ') : ''} className={field} /></label>
      <label>المقاس<input name="size" defaultValue={String(data?.['size'] ?? '')} className={field} /></label>
      <label className="md:col-span-2">رابط الصورة<input name="image" defaultValue={String(data?.['image'] ?? '')} className={field} /></label>
      <div className="flex gap-2"><Button disabled={busy} type="submit"><Save /> حفظ المنتج</Button><Button variant="outline" type="button" onClick={() => setOpen(false)}>إلغاء</Button></div>
    </form>}
    <div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b"><th className="p-3">المنتج</th><th>القسم</th><th>السعر ر.ي</th><th>المخزون</th><th>الإجراءات</th></tr></thead><tbody>{rows.map(p => {
      const d = p.data && typeof p.data === 'object' && !Array.isArray(p.data) ? p.data : {};
      return <tr key={p.id} className="border-b border-border"><td className="p-3">{p.name}</td><td>{p.category === 'heels' ? 'Sandals' : p.category}</td><td>{p.price_yer}</td><td>{Number(d?.['stock'] ?? 0)}</td><td className="whitespace-nowrap"><Button variant="ghost" size="icon" aria-label={`تعديل ${p.name}`} onClick={() => { setEdit(p); setOpen(true); }}><Pencil /></Button><Button variant="ghost" size="icon" aria-label={`حذف ${p.name}`} onClick={async () => {
        if (!window.confirm(`حذف ${p.name}؟`)) return;
        const r = await supabase.rpc('delete_admin_product', { _id: p.id });
        if (r.error) setMessage(r.error.message); else { setMessage('تم حذف المنتج'); await load(); }
      }}><Trash2 /></Button></td></tr>;
    })}</tbody></table></div>
  </section>;
}