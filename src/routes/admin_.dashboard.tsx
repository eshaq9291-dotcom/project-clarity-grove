import { createFileRoute, Link } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminGate } from "@/components/AdminGate";
import { Page } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { erpModules, partyDebt } from "@/lib/erp";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin_/dashboard")({
  head: () => ({
    meta: [
      { title: "هيكلية نظام الإدارة التجارية - INTEGRATED COMMERCIAL MANAGEMENT SYSTEM - JOOD" },
      { name: "description", content: "لوحة نظام الإدارة التجارية المتكامل لمتجر جود: المشتريات والمخزون والمبيعات والمحاسبة." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "نظام الإدارة التجارية | JOOD" },
      { property: "og:description", content: "هيكلية نظام ERP المتكامل لمتجر جود." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AdminGate><Dashboard /></AdminGate>,
});

type Stats = { sales: number; cost: number; stock: number; debts: number; moves: { created_at: string; qty_change: number }[] };

function Dashboard() {
  const { settings } = useStore();
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    (async () => {
      const [sales, stock, pays, moves] = await Promise.all([
        supabase.from("sales").select("customer_id,total_sar,paid_sar,qty,unit_cost_sar"),
        supabase.from("stock").select("qty"),
        supabase.from("payments").select("party_id,amount_sar,party_type"),
        supabase.from("stock_movements").select("created_at,qty_change").order("created_at").limit(1000),
      ]);
      const sl = sales.data ?? [];
      const rows = sl.map((r) => ({ party_id: r.customer_id, total_sar: r.total_sar, paid_sar: r.paid_sar }));
      const cp = (pays.data ?? []).filter((p) => p.party_type === "customer");
      const ids = [...new Set(rows.map((r) => r.party_id).filter(Boolean))] as string[];
      setS({
        sales: sl.reduce((a, r) => a + Number(r.total_sar ?? 0), 0),
        cost: sl.reduce((a, r) => a + r.qty * Number(r.unit_cost_sar), 0),
        stock: (stock.data ?? []).reduce((a, r) => a + r.qty, 0),
        debts: ids.reduce((a, id) => a + partyDebt(rows, cp, id), 0),
        moves: moves.data ?? [],
      });
    })();
  }, []);

  const chart = useMemo(() => {
    const m = new Map<string, { day: string; in: number; out: number }>();
    for (const r of s?.moves ?? []) {
      const day = r.created_at.slice(0, 10);
      const e = m.get(day) ?? { day, in: 0, out: 0 };
      if (r.qty_change > 0) e.in += r.qty_change; else e.out += -r.qty_change;
      m.set(day, e);
    }
    return [...m.values()].slice(-14);
  }, [s]);

  const yer = (sar: number) => `${Math.round(sar * settings.yer_per_sar).toLocaleString("en-US")} ر.ي`;
  const sar = (v: number) => `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} ر.س`;
  const kpis = s ? [
    { l: "إجمالي المبيعات", v: sar(s.sales), y: yer(s.sales) },
    { l: "المخزون الحالي", v: `${s.stock.toLocaleString("en-US")} قطعة`, y: "كل المستودعات" },
    { l: "ديون العملاء", v: sar(s.debts), y: yer(s.debts) },
    { l: "الأرباح", v: sar(s.sales - s.cost), y: yer(s.sales - s.cost) },
  ] : [];

  return (
    <Page>
      <h1 className="text-center font-display text-xl font-bold text-primary md:text-2xl">هيكلية نظام الإدارة التجارية</h1>
      <p className="text-center text-xs tracking-widest text-muted-foreground">INTEGRATED COMMERCIAL MANAGEMENT SYSTEM - JOOD</p>

      <div className="relative mx-auto mt-6 aspect-square w-full max-w-[560px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="50" cy="50" r="36" fill="none" stroke="var(--primary)" strokeOpacity=".35" strokeDasharray="1 1.5" strokeWidth=".4" />
          {erpModules.map((m, i) => {
            const a = (i / erpModules.length) * Math.PI * 2 - Math.PI / 2;
            return <line key={m.id} x1="50" y1="50" x2={50 + 36 * Math.cos(a)} y2={50 + 36 * Math.sin(a)} stroke="var(--primary)" strokeOpacity=".5" strokeWidth=".3" />;
          })}
        </svg>
        <div className="absolute top-1/2 left-1/2 grid size-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-primary bg-card p-2 text-center shadow-gold">
          <div>
            <Database className="mx-auto size-6 text-primary md:size-8" />
            <div className="mt-1 text-[10px] font-bold text-primary md:text-sm">CENTRAL CORE</div>
            <div className="text-[8px] text-muted-foreground md:text-[11px]">قاعدة البيانات المركزية + منطق الأعمال</div>
          </div>
        </div>
        {erpModules.map((m, i) => {
          const a = (i / erpModules.length) * Math.PI * 2 - Math.PI / 2;
          const I = m.icon;
          return (
            <Link
              key={m.id} to="/admin/erp/$module" params={{ module: m.id }}
              style={{ left: `${50 + 36 * Math.cos(a)}%`, top: `${50 + 36 * Math.sin(a)}%` }}
              className="group absolute flex w-[23%] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl border border-primary/60 bg-card p-1.5 text-center transition hover:scale-105 hover:border-primary hover:shadow-gold md:p-2"
            >
              <span className="grid size-7 place-items-center rounded-full bg-gold text-primary-foreground md:size-10"><I className="size-4 md:size-5" /></span>
              <span className="mt-1 text-[9px] leading-tight font-bold md:text-xs">{m.n}. {m.ar}</span>
              <span className="hidden text-[9px] text-muted-foreground md:block">{m.en}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(s ? kpis : Array.from({ length: 4 }, () => null)).map((k, i) => (
          <div key={i} className="rounded-xl border border-primary/30 bg-card p-3">
            <div className="text-xs text-muted-foreground">{k?.l ?? "..."}</div>
            <div className="mt-1 font-bold text-primary">{k?.v ?? "—"}</div>
            <div className="text-[11px] text-muted-foreground">{k?.y}</div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-bold">حركة المخزون (يزيد / يقل)</h2>
        {chart.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">لا توجد حركة بعد. سجّل مشتريات أو مبيعات لتظهر هنا.</p> : (
          <div className="h-64" dir="ltr">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeOpacity={0.15} />
                <XAxis dataKey="day" fontSize={10} />
                <YAxis fontSize={10} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="in" name="وارد (يزيد)" fill="var(--primary)" />
                <Bar dataKey="out" name="صادر (يقل)" fill="var(--muted-foreground)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </Page>
  );
}
