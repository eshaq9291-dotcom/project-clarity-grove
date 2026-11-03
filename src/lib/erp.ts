import { BarChart3, Boxes, Calculator, Settings, ShoppingCart, Truck, UserCog, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ErpModuleId = "purchases" | "inventory" | "sales" | "customers" | "ledger" | "reports" | "users" | "settings";

export const erpModules: { id: ErpModuleId; n: number; ar: string; en: string; points: string[]; icon: LucideIcon }[] = [
  { id: "purchases", n: 1, ar: "المشتريات والموردون", en: "Purchases & Suppliers", points: ["ربط الموردين", "يزيد المخزون عند الشراء"], icon: Truck },
  { id: "inventory", n: 2, ar: "المخزون والمستودعات", en: "Inventory & Warehouses", points: ["تتبع المستودعات", "الجرد", "الباركود ونقاط البيع"], icon: Boxes },
  { id: "sales", n: 3, ar: "المبيعات والفواتير", en: "Sales & Invoices", points: ["يقلل المخزون عند البيع", "ربط ثنائي مع المخزون"], icon: ShoppingCart },
  { id: "customers", n: 4, ar: "العملاء والديون", en: "Customers & Debts", points: ["ديون العملاء والموردين", "تسجيل السداد"], icon: Users },
  { id: "ledger", n: 5, ar: "المحاسبة والصندوق", en: "General Ledger", points: ["ريال يمني وسعودي", "ربط المحاسبة الشامل"], icon: Calculator },
  { id: "reports", n: 6, ar: "التقارير ولوحة التحكم", en: "Reports & Dashboard", points: ["بيانات من كل الوحدات"], icon: BarChart3 },
  { id: "users", n: 7, ar: "المستخدمون والصلاحيات", en: "Users & Permissions", points: ["أدوار المستخدمين"], icon: UserCog },
  { id: "settings", n: 8, ar: "إعدادات النظام", en: "System Settings", points: ["العملات والمحافظ والتوصيل"], icon: Settings },
];

/** Customer debt = credit sales not paid at sale time minus later payments. */
export function partyDebt(
  rows: { party_id: string | null; total_sar: number | null; paid_sar: number }[],
  payments: { party_id: string; amount_sar: number }[],
  id: string,
) {
  const owed = rows.filter((r) => r.party_id === id).reduce((s, r) => s + Number(r.total_sar ?? 0) - Number(r.paid_sar), 0);
  const paid = payments.filter((p) => p.party_id === id).reduce((s, p) => s + Number(p.amount_sar), 0);
  return owed - paid;
}
