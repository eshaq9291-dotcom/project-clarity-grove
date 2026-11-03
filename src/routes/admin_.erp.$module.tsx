import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminGate } from "@/components/AdminGate";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Page } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { erpModules, partyDebt, type ErpModuleId } from "@/lib/erp";
import { getProduct, products } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin_/erp/$module")({
  loader: ({ params }) => {
    const m = erpModules.find((x) => x.id === params.module);
    if (!m) throw notFound();
    return { id: m.id };
  },
  head: ({ loaderData }) => {
    const m = erpModules.find((x) => x.id === loaderData?.id);
    const t = m ? `${m.ar} | نظام الإدارة | JOOD` : "وحدة غير موجودة | JOOD";
    return { meta: [
      { title: t }, { name: "description", content: m ? `${m.ar} - ${m.en} في نظام إدارة جود.` : "" },
      { name: "robots", content: "noindex" }, { property: "og:title", content: t },
      { property: "og:description", content: m?.en ?? "" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  notFoundComponent: () => <Page><p className="mt-16 text-center">الوحدة غير موجودة.</p></Page>,
  errorComponent: ({ error }) => <Page><p className="mt-16 text-center text-destructive">{error instanceof Error ? error.message : String(error)}</p></Page>,
  component: () => <AdminGate><ModulePage /></AdminGate>,
});

const field = "w-full rounded-lg border bg-background px-2.5 py-2 text-sm outline-none focus:border-primary";
const btn = "rounded-lg bg-gold px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60";
const n2 = (v: number | null | undefined) => Number(v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const pname = (id: string) => getProduct(id)?.name ?? id;
const date = (s: string) => new Date(s).toLocaleDateString("ar-YE");

function ModulePage() {
  const { id } = Route.useLoaderData();
  const m = erpModules.find((x) => x.id === id)!;
  const I = m.icon;
  const body: Record<ErpModuleId, ReactNode> = {
    purchases: <Purchases />, inventory: <Inventory />, sales: <Sales />, customers: <Customers />,
    ledger: <Ledger />, reports: <Reports />, users: <UsersMod />, settings: <SettingsPanel />,
  };
  return (
    <Page>
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-xs text-primary"><ArrowRight className="size-3" /> هيكلية النظام</Link>
      <div className="mt-2 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-gold text-primary-foreground"><I className="size-5" /></span>
        <div><h1 className="text-xl font-bold">{m.n}. {m.ar}</h1><p className="text-xs text-muted-foreground">{m.en}</p></div>
      </div>
      <div className="mt-5 space-y-5">{body[m.id]}</div>
    </Page>
  );
}

function useRows<T>(fetcher: () => PromiseLike<{ data: T[] | null }>) {
  const [rows, setRows] = useState<T[]>([]);
  const reload = useCallback(() => { fetcher().then((r) => setRows(r.data ?? [])); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(reload, [reload]);
  return [rows, reload] as const;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-xl border bg-card p-4"><h2 className="mb-3 font-bold text-primary">{title}</h2>{children}</section>;
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead><tr className="border-b text-xs text-muted-foreground">{head.map((h) => <th key={h} className="px-2 py-2 text-right font-semibold">{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={head.length} className="py-6 text-center text-muted-foreground">لا توجد بيانات</td></tr>
            : rows.map((r, i) => <tr key={i} className="border-b border-border/50">{r.map((c, j) => <td key={j} className="px-2 py-2">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function useSubmit(after: () => void) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>, form?: HTMLFormElement) => {
    setBusy(true); setErr(null);
    const { error } = await fn();
    setBusy(false);
    if (error) setErr(error.message); else { form?.reset(); after(); }
  };
  return { busy, err, run };
}

const ProductSelect = ({ name = "product" }: { name?: string }) => (
  <select name={name} required className={field}><option value="">المنتج</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
);
const fd = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); return new FormData(e.currentTarget); };

function Purchases() {
  const [sup, reloadSup] = useRows<Tables<"suppliers">>(() => supabase.from("suppliers").select("*").order("created_at", { ascending: false }));
  const [wh] = useRows<Tables<"warehouses">>(() => supabase.from("warehouses").select("*").order("created_at"));
  const [rows, reload] = useRows<Tables<"purchases">>(() => supabase.from("purchases").select("*").order("created_at", { ascending: false }).limit(200));
  const s1 = useSubmit(reloadSup), s2 = useSubmit(reload);
  return (
    <>
      <Card title="تسجيل فاتورة شراء (تزيد المخزون تلقائياً)">
        <form className="grid grid-cols-2 gap-2 md:grid-cols-3" onSubmit={(e) => { const f = fd(e); const form = e.currentTarget; s2.run(() => supabase.from("purchases").insert({
          supplier_id: String(f.get("supplier")), warehouse_id: String(f.get("wh")), product_id: String(f.get("product")),
          qty: Number(f.get("qty")), unit_cost_sar: Number(f.get("cost")), paid_sar: Number(f.get("paid") || 0) }), form); }}>
          <select name="supplier" required className={field}><option value="">المورد</option>{sup.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select name="wh" required className={field}>{wh.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <ProductSelect />
          <input name="qty" type="number" min={1} required placeholder="الكمية" className={field} />
          <input name="cost" type="number" min={0} step="0.01" required placeholder="تكلفة الوحدة (ر.س)" className={field} />
          <input name="paid" type="number" min={0} step="0.01" placeholder="المدفوع (ر.س)" className={field} />
          <button disabled={s2.busy} className={btn}>حفظ الشراء</button>
        </form>
        {s2.err && <p className="mt-2 text-sm text-destructive">{s2.err}</p>}
      </Card>
      <Card title="فواتير الشراء">
        <Table head={["التاريخ", "المورد", "المنتج", "الكمية", "الإجمالي ر.س", "المدفوع", "المتبقي"]}
          rows={rows.map((r) => [date(r.created_at), sup.find((s) => s.id === r.supplier_id)?.name ?? "—", pname(r.product_id), r.qty, n2(r.total_sar), n2(r.paid_sar), n2(Number(r.total_sar) - Number(r.paid_sar))])} />
      </Card>
      <Card title="الموردون">
        <form className="mb-3 flex flex-wrap gap-2" onSubmit={(e) => { const f = fd(e); const form = e.currentTarget; s1.run(() => supabase.from("suppliers").insert({ name: String(f.get("name")), phone: String(f.get("phone") || "") || null }), form); }}>
          <input name="name" required placeholder="اسم المورد" className={`${field} flex-1`} />
          <input name="phone" placeholder="الهاتف" className={`${field} w-36`} />
          <button disabled={s1.busy} className={btn}>إضافة</button>
        </form>
        {s1.err && <p className="mb-2 text-sm text-destructive">{s1.err}</p>}
        <Table head={["الاسم", "الهاتف", "عدد المشتريات"]} rows={sup.map((s) => [s.name, s.phone ?? "—", rows.filter((r) => r.supplier_id === s.id).length])} />
      </Card>
    </>
  );
}

function Inventory() {
  const [wh, reloadWh] = useRows<Tables<"warehouses">>(() => supabase.from("warehouses").select("*").order("created_at"));
  const [stock, reloadStock] = useRows<Tables<"stock">>(() => supabase.from("stock").select("*"));
  const [moves, reloadMoves] = useRows<Tables<"stock_movements">>(() => supabase.from("stock_movements").select("*").order("created_at", { ascending: false }).limit(100));
  const after = () => { reloadStock(); reloadMoves(); };
  const s1 = useSubmit(reloadWh), s2 = useSubmit(after), s3 = useSubmit(reloadStock);
  const whName = (id: string) => wh.find((w) => w.id === id)?.name ?? "—";
  const reason: Record<string, string> = { purchase: "شراء", sale: "بيع", stocktake: "جرد" };
  return (
    <>
      <Card title="المخزون الحالي">
        <Table head={["المنتج", "المستودع", "الكمية", "الباركود"]} rows={stock.map((s) => [pname(s.product_id), whName(s.warehouse_id), <b className={s.qty <= 2 ? "text-destructive" : "text-primary"}>{s.qty}</b>,
          <input defaultValue={s.barcode ?? ""} placeholder="أدخل الباركود" className={`${field} w-36 py-1`} dir="ltr"
            onBlur={(e) => { const v = e.target.value.trim(); if (v !== (s.barcode ?? "")) s3.run(() => supabase.from("stock").update({ barcode: v || null }).eq("product_id", s.product_id).eq("warehouse_id", s.warehouse_id)); }} />])} />
        {s3.err && <p className="mt-2 text-sm text-destructive">{s3.err}</p>}
      </Card>
      <Card title="الجرد (Stocktaking)">
        <form className="grid grid-cols-2 gap-2 md:grid-cols-4" onSubmit={(e) => { const f = fd(e); const form = e.currentTarget; s2.run(() => supabase.rpc("erp_stocktake", { _product: String(f.get("product")), _wh: String(f.get("wh")), _counted: Number(f.get("counted")) }), form); }}>
          <ProductSelect />
          <select name="wh" required className={field}>{wh.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <input name="counted" type="number" min={0} required placeholder="العدد الفعلي" className={field} />
          <button disabled={s2.busy} className={btn}>اعتماد الجرد</button>
        </form>
        {s2.err && <p className="mt-2 text-sm text-destructive">{s2.err}</p>}
      </Card>
      <Card title="حركة المخزون">
        <Table head={["التاريخ", "المنتج", "المستودع", "الحركة", "السبب"]} rows={moves.map((m) => [date(m.created_at), pname(m.product_id), whName(m.warehouse_id),
          <b className={m.qty_change > 0 ? "text-primary" : "text-destructive"} dir="ltr">{m.qty_change > 0 ? `+${m.qty_change}` : m.qty_change}</b>, reason[m.reason] ?? m.reason])} />
      </Card>
      <Card title="المستودعات">
        <form className="mb-3 flex flex-wrap gap-2" onSubmit={(e) => { const f = fd(e); const form = e.currentTarget; s1.run(() => supabase.from("warehouses").insert({ name: String(f.get("name")), location: String(f.get("loc") || "") || null }), form); }}>
          <input name="name" required placeholder="اسم المستودع" className={`${field} flex-1`} />
          <input name="loc" placeholder="الموقع" className={`${field} w-36`} />
          <button disabled={s1.busy} className={btn}>إضافة</button>
        </form>
        {s1.err && <p className="mb-2 text-sm text-destructive">{s1.err}</p>}
        <Table head={["المستودع", "الموقع", "إجمالي القطع"]} rows={wh.map((w) => [w.name, w.location ?? "—", stock.filter((s) => s.warehouse_id === w.id).reduce((a, s) => a + s.qty, 0)])} />
      </Card>
    </>
  );
}

function Sales() {
  const [wh] = useRows<Tables<"warehouses">>(() => supabase.from("warehouses").select("*").order("created_at"));
  const [cust] = useRows<Tables<"customers">>(() => supabase.from("customers").select("*").order("name"));
  const [stock] = useRows<Tables<"stock">>(() => supabase.from("stock").select("*"));
  const [rows, reload] = useRows<Tables<"sales">>(() => supabase.from("sales").select("*").order("created_at", { ascending: false }).limit(200));
  const s = useSubmit(reload);
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const pick = (id: string) => { setProduct(id); setPrice(String(getProduct(id)?.price ?? "")); };
  return (
    <>
      <Card title="نقطة البيع POS (تقلل المخزون تلقائياً)">
        <input placeholder="امسح أو اكتب الباركود ثم Enter" dir="ltr" className={`${field} mb-2`}
          onKeyDown={(e) => { if (e.key !== "Enter") return; e.preventDefault(); const hit = stock.find((x) => x.barcode === e.currentTarget.value.trim()); if (hit) pick(hit.product_id); e.currentTarget.value = ""; }} />
        <form className="grid grid-cols-2 gap-2 md:grid-cols-3" onSubmit={(e) => { const f = fd(e); const form = e.currentTarget; const qty = Number(f.get("qty"));
          const paid = f.get("credit") ? Number(f.get("paid") || 0) : qty * Number(price);
          s.run(() => supabase.from("sales").insert({ product_id: product, warehouse_id: String(f.get("wh")), customer_id: String(f.get("customer") || "") || null,
            qty, unit_price_sar: Number(price), paid_sar: paid }), form).then(() => { setProduct(""); setPrice(""); }); }}>
          <select required value={product} onChange={(e) => pick(e.target.value)} className={field}><option value="">المنتج</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <select name="wh" required className={field}>{wh.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          <select name="customer" className={field}><option value="">عميل نقدي</option>{cust.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input name="qty" type="number" min={1} defaultValue={1} required placeholder="الكمية" className={field} />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min={0} step="0.01" required placeholder="سعر الوحدة ر.س" className={field} />
          <label className="flex items-center gap-2 text-sm"><input name="credit" type="checkbox" /> بيع آجل</label>
          <input name="paid" type="number" min={0} step="0.01" placeholder="المدفوع الآن (للآجل)" className={field} />
          <button disabled={s.busy} className={btn}>إصدار فاتورة</button>
        </form>
        {s.err && <p className="mt-2 text-sm text-destructive">{s.err}</p>}
      </Card>
      <Card title="فواتير المبيعات">
        <Table head={["التاريخ", "العميل", "المنتج", "الكمية", "الإجمالي ر.س", "المدفوع", "الربح"]}
          rows={rows.map((r) => [date(r.created_at), cust.find((c) => c.id === r.customer_id)?.name ?? "نقدي", pname(r.product_id), r.qty, n2(r.total_sar), n2(r.paid_sar), n2(Number(r.total_sar) - r.qty * Number(r.unit_cost_sar))])} />
      </Card>
    </>
  );
}

function Customers() {
  const [cust, reloadCust] = useRows<Tables<"customers">>(() => supabase.from("customers").select("*").order("name"));
  const [sup] = useRows<Tables<"suppliers">>(() => supabase.from("suppliers").select("*").order("name"));
  const [sales] = useRows<Tables<"sales">>(() => supabase.from("sales").select("*"));
  const [purch] = useRows<Tables<"purchases">>(() => supabase.from("purchases").select("*"));
  const [pays, reloadPays] = useRows<Tables<"payments">>(() => supabase.from("payments").select("*").order("created_at", { ascending: false }));
  const s1 = useSubmit(reloadCust), s2 = useSubmit(reloadPays);
  const sRows = sales.map((r) => ({ party_id: r.customer_id, total_sar: r.total_sar, paid_sar: r.paid_sar }));
  const pRows = purch.map((r) => ({ party_id: r.supplier_id, total_sar: r.total_sar, paid_sar: r.paid_sar }));
  const cp = pays.filter((p) => p.party_type === "customer"), spay = pays.filter((p) => p.party_type === "supplier");
  return (
    <>
      <Card title="العملاء وديونهم">
        <form className="mb-3 flex flex-wrap gap-2" onSubmit={(e) => { const f = fd(e); const form = e.currentTarget; s1.run(() => supabase.from("customers").insert({ name: String(f.get("name")), phone: String(f.get("phone") || "") || null }), form); }}>
          <input name="name" required placeholder="اسم العميل" className={`${field} flex-1`} />
          <input name="phone" placeholder="الهاتف" className={`${field} w-36`} />
          <button disabled={s1.busy} className={btn}>إضافة</button>
        </form>
        {s1.err && <p className="mb-2 text-sm text-destructive">{s1.err}</p>}
        <Table head={["العميل", "الهاتف", "الدين ر.س"]} rows={cust.map((c) => { const d = partyDebt(sRows, cp, c.id); return [c.name, c.phone ?? "—", <b className={d > 0 ? "text-destructive" : ""}>{n2(d)}</b>]; })} />
      </Card>
      <Card title="ديون الموردين">
        <Table head={["المورد", "المستحق ر.س"]} rows={sup.map((s) => [s.name, n2(partyDebt(pRows, spay, s.id))])} />
      </Card>
      <Card title="تسجيل سداد">
        <form className="grid grid-cols-2 gap-2 md:grid-cols-4" onSubmit={(e) => { const f = fd(e); const form = e.currentTarget; const [t, id] = String(f.get("party")).split(":");
          s2.run(() => supabase.from("payments").insert({ party_type: t ?? "", party_id: id ?? "", amount_sar: Number(f.get("amount")), memo: String(f.get("memo") || "") || null }), form); }}>
          <select name="party" required className={field}><option value="">الطرف</option>
            <optgroup label="عملاء">{cust.map((c) => <option key={c.id} value={`customer:${c.id}`}>{c.name}</option>)}</optgroup>
            <optgroup label="موردون">{sup.map((s) => <option key={s.id} value={`supplier:${s.id}`}>{s.name}</option>)}</optgroup>
          </select>
          <input name="amount" type="number" min={0.01} step="0.01" required placeholder="المبلغ ر.س" className={field} />
          <input name="memo" placeholder="ملاحظة" className={field} />
          <button disabled={s2.busy} className={btn}>حفظ</button>
        </form>
        {s2.err && <p className="mt-2 text-sm text-destructive">{s2.err}</p>}
      </Card>
    </>
  );
}

function Ledger() {
  const { settings } = useStore();
  const [rows] = useRows<Tables<"ledger">>(() => supabase.from("ledger").select("*").order("created_at", { ascending: false }).limit(1000));
  const live = rows.filter((r) => Number(r.debit_sar) || Number(r.credit_sar));
  const acc = new Map<string, number>();
  for (const r of live) acc.set(r.account, (acc.get(r.account) ?? 0) + Number(r.debit_sar) - Number(r.credit_sar));
  const yer = (v: number) => n2(Math.round(v * settings.yer_per_sar));
  return (
    <>
      <Card title="أرصدة الحسابات">
        <Table head={["الحساب", "الرصيد ر.س", "الرصيد ر.ي"]} rows={[...acc].map(([a, v]) => [a, n2(v), yer(v)])} />
        <p className="mt-2 text-xs text-muted-foreground">سعر التحويل: 1 ر.س = {settings.yer_per_sar} ر.ي (من إعدادات النظام)</p>
      </Card>
      <Card title="دفتر القيود اليومية">
        <Table head={["التاريخ", "الحساب", "مدين ر.س", "دائن ر.س", "البيان"]} rows={live.slice(0, 200).map((r) => [date(r.created_at), r.account, n2(r.debit_sar), n2(r.credit_sar), r.memo ?? ""])} />
      </Card>
    </>
  );
}

function Reports() {
  const { settings } = useStore();
  const [sales] = useRows<Tables<"sales">>(() => supabase.from("sales").select("*"));
  const [purch] = useRows<Tables<"purchases">>(() => supabase.from("purchases").select("*"));
  const [stock] = useRows<Tables<"stock">>(() => supabase.from("stock").select("*"));
  const [orders] = useRows<Pick<Tables<"orders">, "total_sar" | "status">>(() => supabase.from("orders").select("total_sar,status"));
  const sum = (a: { total_sar: number | null }[]) => a.reduce((s, r) => s + Number(r.total_sar ?? 0), 0);
  const both = (v: number) => `${n2(v)} ر.س / ${n2(Math.round(v * settings.yer_per_sar))} ر.ي`;
  const byProduct = products.map((p) => {
    const sl = sales.filter((s) => s.product_id === p.id);
    return [p.name, sl.reduce((a, s) => a + s.qty, 0), n2(sum(sl)), stock.filter((s) => s.product_id === p.id).reduce((a, s) => a + s.qty, 0)];
  });
  return (
    <>
      <Card title="ملخص من كل الوحدات">
        <Table head={["البند", "القيمة"]} rows={[
          ["مبيعات نقطة البيع", both(sum(sales))],
          ["طلبات المتجر الإلكتروني", `${orders.length} طلب — ${both(sum(orders))}`],
          ["المشتريات", both(sum(purch))],
          ["تكلفة المبيعات", both(sales.reduce((a, s) => a + s.qty * Number(s.unit_cost_sar), 0))],
          ["قطع في المخزون", stock.reduce((a, s) => a + s.qty, 0)],
        ]} />
      </Card>
      <Card title="أداء المنتجات">
        <Table head={["المنتج", "المباع", "المبيعات ر.س", "المخزون"]} rows={byProduct} />
      </Card>
    </>
  );
}

function UsersMod() {
  const [roles] = useRows<Tables<"user_roles">>(() => supabase.from("user_roles").select("*"));
  const [me, setMe] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);
  return (
    <Card title="المستخدمون والأدوار">
      <Table head={["المستخدم", "الدور"]} rows={roles.map((r) => [<span dir="ltr" className="font-mono text-xs">{r.user_id === me ? "أنت" : `${r.user_id.slice(0, 8)}…`}</span>, r.role === "admin" ? "مدير المتجر" : "مستخدم"])} />
      <p className="mt-2 text-xs text-muted-foreground">أول حساب يُسجّل يصبح مدير المتجر تلقائياً، ولا يمكن لأي حساب آخر الوصول للنظام.</p>
    </Card>
  );
}
