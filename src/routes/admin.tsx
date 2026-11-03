import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Page } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { confirmPayment } from "@/lib/orders.functions";
import { expectedInCurrency } from "@/lib/receipt-check";
import { useStore } from "@/lib/store";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ProductPhotosPanel } from "@/components/ProductPhotosPanel";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الطلبات | جود | JOOD" },
      { name: "description", content: "لوحة صاحب المتجر لمراجعة الطلبات وإشعارات التحويل." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "لوحة الطلبات | جود" },
      { property: "og:description", content: "مراجعة الطلبات وتأكيد الدفع." },
    ],
  }),
  component: Admin,
});

type Order = Tables<"orders">;
const fmt = (n: number | null | undefined, c = "YER") =>
  n == null ? "—" : `${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${c}`;

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  if (!ready) return <Page><p className="text-center text-muted-foreground">...</p></Page>;
  return session ? <Orders /> : <Login />;
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState<string | null>(null);
  const field = "w-full rounded-xl border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";
  return (
    <Page>
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-bold">دخول صاحب المتجر</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const email = String(f.get("email")), password = String(f.get("password"));
            setMsg(null);
            const { error } = mode === "in"
              ? await supabase.auth.signInWithPassword({ email, password })
              : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
            if (error) setMsg(error.message);
            else if (mode === "up") setMsg("تحقق من بريدك لتأكيد الحساب.");
          }}
        >
          <input name="email" type="email" required placeholder="البريد الإلكتروني" className={field} />
          <input name="password" type="password" required minLength={6} placeholder="كلمة المرور" className={field} />
          <button className="w-full rounded-xl bg-gold py-3 font-bold text-primary-foreground">{mode === "in" ? "دخول" : "إنشاء حساب"}</button>
        </form>
        <button
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/admin` });
            if (r.error) setMsg("تعذر الدخول عبر Google");
          }}
          className="mt-3 w-full rounded-xl border py-3 text-sm"
        >
          المتابعة عبر Google
        </button>
        {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-sm text-primary">
          {mode === "in" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    </Page>
  );
}

function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [denied, setDenied] = useState(false);
  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
    if (!isAdmin) { setDenied(true); return; }
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <Page>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 text-sm text-muted-foreground"><LogOut className="size-4" /> خروج</button>
      </div>
      {orders && <SettingsPanel />}
      {orders && <ProductPhotosPanel />}
      {denied && <p className="mt-6 text-muted-foreground">هذا الحساب ليس حساب صاحب المتجر.</p>}
      {orders?.length === 0 && <p className="mt-6 text-muted-foreground">لا توجد طلبات بعد.</p>}
      {orders && <h2 className="mt-8 text-xl font-bold">الطلبات</h2>}
      <div className="mt-4 space-y-4">
        {orders?.map((o) => <OrderCard key={o.id} o={o} onChange={load} />)}
      </div>
    </Page>
  );
}

function OrderCard({ o, onChange }: { o: Order; onChange: () => void }) {
  const confirm = useServerFn(confirmPayment);
  const { settings } = useStore();
  const [img, setImg] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (o.receipt_path) supabase.storage.from("receipts").createSignedUrl(o.receipt_path, 3600).then(({ data }) => setImg(data?.signedUrl ?? null));
  }, [o.receipt_path]);

  const items = (o.items as { name: string; qty: number }[]) ?? [];
  const risky = o.payment_method === "cod" || o.amount_mismatch !== false || o.extraction_status !== "done";
  const expected = expectedInCurrency(Number(o.total_sar), o.receipt_currency, settings);
  const statusLabel: Record<string, string> = { pending: "بانتظار الدفع", awaiting_confirmation: "بانتظار تأكيدك", paid: "مدفوع", cancelled: "ملغي" };

  return (
    <div className="rounded-xl border bg-card p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold">{o.order_number} · {o.customer_name}</div>
        <span className={`rounded-full px-3 py-1 text-xs ${o.status === "paid" ? "bg-gold text-primary-foreground" : "bg-accent text-accent-foreground"}`}>{statusLabel[o.status]}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{o.phone} · {o.zone} · {o.address}</p>
      <p className="mt-1">{items.map((i) => `${i.name} ×${i.qty}`).join("، ")}</p>
      <p className="mt-1 font-semibold text-primary">الإجمالي: {fmt(Number(o.total_yer))} ({fmt(Number(o.total_sar), "SAR")})</p>
      <p className="mt-1">الدفع: {o.payment_method === "cod" ? "عند الاستلام" : `محفظة — ${o.wallet}`}</p>

      {o.payment_method === "wallet" && (
        <div className="mt-3 grid gap-3 rounded-lg border p-3 md:grid-cols-[160px_1fr]">
          {img ? <a href={img} target="_blank" rel="noreferrer"><img src={img} alt="إشعار الحوالة" className="max-h-48 rounded-md" /></a> : <div className="text-muted-foreground">لا توجد صورة</div>}
          <div className="space-y-1">
            <div className="font-semibold">بيانات الإشعار (قراءة تلقائية)</div>
            {o.extraction_status === "processing" && <p className="text-muted-foreground">جارٍ القراءة...</p>}
            {o.extraction_status === "failed" && <p className="text-destructive">تعذرت القراءة التلقائية — راجع الصورة يدوياً.</p>}
            {o.extraction_status === "done" && (
              <>
                <p>المبلغ: <b>{fmt(o.receipt_amount, o.receipt_currency ?? "")}</b></p>
                <p>المحفظة: {o.receipt_wallet ?? "—"}</p>
                <p>رقم العملية: <b className="tracking-wider">{o.receipt_reference ?? "—"}</b></p>
                {o.receipt_notes && <p className="text-muted-foreground">{o.receipt_notes}</p>}
              </>
            )}
            {o.extraction_status === "done" && (o.amount_mismatch ? (
              <p className="flex items-center gap-1 font-semibold text-destructive"><AlertTriangle className="size-4" /> فرق في المبلغ: المتوقع {fmt(expected, o.receipt_currency ?? "YER")}</p>
            ) : (
              <p className="flex items-center gap-1 text-primary"><CheckCircle2 className="size-4" /> المبلغ مطابق لإجمالي الطلب</p>
            ))}
          </div>
        </div>
      )}

      {o.status !== "paid" && (
        <div className="mt-3 space-y-2">
          {risky && (
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
              {o.payment_method === "cod" ? "استلمت المبلغ نقداً" : "راجعت الإشعار بنفسي وأؤكد استلام المبلغ رغم الفرق"}
            </label>
          )}
          <button
            disabled={risky && !ack}
            onClick={async () => {
              setErr(null);
              try { await confirm({ data: { orderId: o.id, acknowledgeMismatch: ack } }); onChange(); }
              catch (x) { setErr(x instanceof Error ? x.message : "خطأ"); }
            }}
            className="rounded-xl bg-gold px-5 py-2 font-bold text-primary-foreground disabled:opacity-50"
          >
            تأكيد الدفع
          </button>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      )}
    </div>
  );
}
