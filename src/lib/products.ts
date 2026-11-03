import logo from "@/assets/jood-logo-gold.png";
import catMen from "@/assets/cat-men.jpg.asset.json";
import catWomen from "@/assets/cat-women.jpg.asset.json";
import catBags from "@/assets/cat-bags.jpg.asset.json";
import catHeels from "@/assets/cat-heels.jpg.asset.json";
import catMakeup from "@/assets/cat-makeup.jpg.asset.json";
import pMen from "@/assets/p-men-shawl.jpg.asset.json";
import pMenBlack from "@/assets/p-men-shawl-black.jpg";
import pMenIvory from "@/assets/p-men-shawl-ivory.jpg";
import pWomen from "@/assets/p-women-shawl.jpg.asset.json";
import pBag from "@/assets/p-bag.jpg.asset.json";
import pHeels from "@/assets/p-heels.jpg.asset.json";
import pMakeup from "@/assets/p-makeup.jpg.asset.json";
import pClutch from "@/assets/p-clutch.jpg.asset.json";
import pBagBrown from "@/assets/p-bag-brown.jpg";
import pHeelsSilver from "@/assets/p-heels-silver.jpg";
import pMakeupNeutral from "@/assets/p-makeup-neutral.jpg";
import pClutchGold from "@/assets/p-clutch-gold.jpg";

export const logoUrl = logo;

export type CategoryId = "men-shawls" | "women-shawls" | "bags" | "heels" | "makeup";

export const categories: { id: CategoryId; name: string; sub: string; image: string }[] = [
  { id: "men-shawls", name: "شيلان رجالية", sub: "صوف وكشميري", image: catMen.url },
  { id: "women-shawls", name: "شيلان نسائية", sub: "حرير ملكي وتطريز", image: catWomen.url },
  { id: "bags", name: "حقائب راقية", sub: "كلتش وجلد إيطالي", image: catBags.url },
  { id: "heels", name: "صنادل كعب", sub: "كريستال وسهرة", image: catHeels.url },
  { id: "makeup", name: "مستحضرات التجميل", sub: "Makeup فاخر", image: catMakeup.url },
];

export type Product = {
  id: string;
  name: string;
  details: string;
  category: CategoryId;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  colors: string[];
  size: string;
  description: string;
  // Fallback photo per color when no admin-uploaded photos exist for that color.
  colorImages?: Record<string, string>;
};

// Hex swatch for each color name used in the catalog (for the circle picker).
export const COLOR_HEX: Record<string, string> = {
  "كحلي ملكي": "#1B2A4A",
  "أسود عتيق": "#141414",
  "عاجي فضي": "#E8E4DA",
  "ذهبي": "#D4AF37",
  "أسود": "#0A0A0A",
  "عاجي": "#F2EBDD",
  "بني": "#5C3A21",
  "فضي": "#C0C0C0",
  "دافئ": "#C98A5B",
  "محايد": "#A08C7A",
  "لؤلؤي": "#EFEAE0",
};

export const products: Product[] = [
  {
    id: "JD-9801", name: "شال كشميري مطرز ملكي بخيوط الذهب", details: "رجالي فاخر • صوف نقي 100%",
    category: "men-shawls", price: 1850, oldPrice: 2300, rating: 4.9, reviews: 84, badge: "قطعة ملكية",
    image: pMen.url, colors: ["كحلي ملكي", "أسود عتيق", "عاجي فضي"], size: "200 × 70 سم",
    colorImages: { "أسود عتيق": pMenBlack, "عاجي فضي": pMenIvory },
    description: "صوف كشمير نقي بحياكة ذهبية يدوية، يأتي في تغليف إهداء مذهب مع بطاقة بخط ديواني.",
  },
  {
    id: "JD-7720", name: "شال حرير دمشقي يدوي", details: "نسائي ملكي • حرير خالص",
    category: "women-shawls", price: 1420, rating: 5.0, reviews: 42, badge: "حياكة يدوية",
    image: pWomen.url, colors: ["ذهبي", "أسود", "عاجي"], size: "180 × 90 سم",
    description: "حرير دمشقي خالص منسوج بخيوط ذهبية بنقوش عربية أصيلة.",
  },
  {
    id: "JD-5530", name: "حقيبة يد جلدية سوداء بلمسات الذهب", details: "جلد طبيعي إيطالي • حلية مذهبة",
    category: "bags", price: 2650, rating: 4.9, reviews: 67, badge: "قطعة مميزة",
    image: pBag.url, colors: ["أسود", "بني"], size: "متوسط (M)",
    colorImages: { "أسود": pBag.url, "بني": pBagBrown },
    description: "جلد عجل إيطالي محبب مع حلية «جود» المطلية بذهب 24 قيراط. إصدار محدود.",
  },
  {
    id: "JD-3310", name: "صندل كعب كريستالي للسهرة", details: "مرصع يدوياً • كعب 9.5 سم",
    category: "heels", price: 1980, rating: 4.9, reviews: 35, badge: "سهرة راقية",
    image: pHeels.url, colors: ["ذهبي", "فضي"], size: "36 – 41",
    colorImages: { "ذهبي": pHeels.url, "فضي": pHeelsSilver },
    description: "صندل سهرة مرصع بالكريستال يدوياً بتصميم باريسي أنيق.",
  },
  {
    id: "JD-1150", name: "مجموعة مكياج المخمل الملكية", details: "إصدار Royal Velvet Box الذهبي",
    category: "makeup", price: 950, rating: 4.9, reviews: 91, badge: "Makeup",
    image: pMakeup.url, colors: ["دافئ", "محايد"], size: "صندوق كامل",
    colorImages: { "دافئ": pMakeup.url, "محايد": pMakeupNeutral },
    description: "صندوق مستحضرات تجميل فاخر بتغليف ذهبي مزخرف يضم كل ما تحتاجينه لإطلالة السهرة.",
  },
  {
    id: "JD-4470", name: "كلتش مرصع باللؤلؤ", details: "حقيبة سهرة فخمة مع سلسلة ذهب",
    category: "bags", price: 1650, rating: 5.0, reviews: 28, badge: "إصدار محدود",
    image: pClutch.url, colors: ["لؤلؤي", "ذهبي"], size: "صغير (S)",
    colorImages: { "لؤلؤي": pClutch.url, "ذهبي": pClutchGold },
    description: "كلتش صلب للعرائس مرصع يدوياً باللؤلؤ والكريستال مع سلسلة ذهبية.",
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const currencies = {
  SAR: { label: "ريال سعودي", symbol: "ر.س", flag: "🇸🇦" },
  USD: { label: "دولار", symbol: "$", flag: "🇺🇸" },
  YER: { label: "ريال يمني", symbol: "ر.ي", flag: "🇾🇪" },
} as const;
export type Currency = keyof typeof currencies;

export const DISCOUNT_CODE = "JOOD15";
export const DISCOUNT_RATE = 0.15;
