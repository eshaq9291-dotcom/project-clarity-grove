import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { currencies, DISCOUNT_CODE, DISCOUNT_RATE, getProduct } from "./products";
import { normalizeSettings, yerToSar } from "./settings";
import { isAmountMismatch } from "./receipt-check";

type PlaceOrderInput = {
  name: string;
  phone: string;
  zone: string;
  address: string;
  items: { id: string; qty: number }[];
  code: string;
  currency: string;
  payment: "cod" | "wallet";
  wallet?: string | undefined;
  receipt?: string | undefined; // data URL
};

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: PlaceOrderInput) => {
    if (!d.name?.trim() || !d.phone?.trim() || !d.address?.trim()) throw new Error("بيانات ناقصة");
    if (typeof d.zone !== "string" || !d.zone) throw new Error("منطقة غير صحيحة");
    if (!Array.isArray(d.items) || d.items.length === 0 || d.items.length > 50) throw new Error("الحقيبة فارغة");
    if (d.payment === "wallet") {
      if (typeof d.wallet !== "string" || !d.wallet) throw new Error("محفظة غير صحيحة");
      if (!d.receipt?.startsWith("data:image/") || d.receipt.length > 8_000_000) throw new Error("صورة الإشعار مطلوبة");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("store_settings").select("yer_per_sar, yer_per_usd, wallets, zones").eq("id", 1).maybeSingle();
    const settings = normalizeSettings(row);
    const zone = settings.zones.find((z) => z.id === data.zone);
    if (!zone) throw new Error("منطقة غير صحيحة");
    const walletInfo = data.payment === "wallet" ? settings.wallets.find((w) => w.id === data.wallet) : undefined;
    if (data.payment === "wallet" && !walletInfo?.account) throw new Error("هذه المحفظة غير متاحة حالياً");

    // Totals are always recomputed on the server from the catalog.
    const items = data.items
      .map((i) => ({ p: getProduct(i.id), qty: Math.max(1, Math.min(20, Math.floor(i.qty))) }))
      .filter((i): i is { p: NonNullable<typeof i.p>; qty: number } => !!i.p);
    if (!items.length) throw new Error("الحقيبة فارغة");
    const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
    const discount = data.code.trim().toUpperCase() === DISCOUNT_CODE ? subtotal * DISCOUNT_RATE : 0;
    const shipping = yerToSar(settings, zone.feeYER);
    const total = subtotal - discount + shipping;
    const orderNumber = "JD-" + Date.now().toString().slice(-8);

    let receiptPath: string | null = null;
    if (data.payment === "wallet" && data.receipt) {
      const [meta, b64] = data.receipt.split(",");
      const type = meta?.match(/data:(image\/[a-z+]+)/)?.[1] ?? "image/jpeg";
      const bytes = Uint8Array.from(atob(b64 ?? ""), (c) => c.charCodeAt(0));
      receiptPath = `${orderNumber}.${type.split("/")[1]}`;
      const up = await supabaseAdmin.storage.from("receipts").upload(receiptPath, bytes, { contentType: type });
      if (up.error) throw new Error("تعذر رفع الإشعار");
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.name.trim(),
        phone: data.phone.trim(),
        zone: zone.name,
        address: data.address.trim(),
        items: items.map((i) => ({ id: i.p.id, name: i.p.name, qty: i.qty, price_sar: i.p.price })),
        subtotal_sar: subtotal,
        discount_sar: discount,
        shipping_sar: shipping,
        total_sar: total,
        total_yer: Math.round(total * settings.yer_per_sar),
        display_currency: data.currency in currencies ? data.currency : "YER",
        payment_method: data.payment,
        wallet: walletInfo ? `${walletInfo.name} (${walletInfo.account})` : null,
        receipt_path: receiptPath,
        extraction_status: receiptPath ? "processing" : "none",
        status: receiptPath ? "awaiting_confirmation" : "pending",
      })
      .select("id")
      .single();
    if (error || !order) throw new Error("تعذر حفظ الطلب");

    if (receiptPath && data.receipt) {
      const { extractReceipt } = await import("./receipt-ai.server");
      const r = await extractReceipt(data.receipt);
      await supabaseAdmin
        .from("orders")
        .update(
          r.ok
            ? {
                extraction_status: "done",
                receipt_amount: r.data.amount,
                receipt_currency: r.data.currency,
                receipt_wallet: r.data.wallet,
                receipt_reference: r.data.reference,
                receipt_notes: r.data.notes,
                amount_mismatch: isAmountMismatch(total, r.data.amount, r.data.currency, settings),
              }
            : { extraction_status: "failed", receipt_notes: "تعذرت قراءة الإشعار تلقائياً، راجعه يدوياً." },
        )
        .eq("id", order.id);
    }
    return { orderNumber };
  });

/** Store owner explicitly confirms an order as paid. Mismatches need an extra acknowledgement. */
export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string; acknowledgeMismatch: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("غير مصرح");
    const { data: order } = await context.supabase.from("orders").select("status, amount_mismatch, extraction_status").eq("id", data.orderId).single();
    if (!order) throw new Error("الطلب غير موجود");
    if (order.status === "paid") return { ok: true };
    const risky = order.amount_mismatch !== false || order.extraction_status !== "done";
    if (risky && !data.acknowledgeMismatch) throw new Error("يجب تأكيد مراجعة الفرق قبل اعتماد الدفع");
    const { error } = await context.supabase
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString(), confirmed_by: context.userId })
      .eq("id", data.orderId);
    if (error) throw new Error("تعذر التحديث");
    return { ok: true };
  });
