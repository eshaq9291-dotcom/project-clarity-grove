import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import identityBlack from "@/assets/jood-identity-black.png.asset.json";
import { categories, DISCOUNT_CODE, type CategoryId } from "@/lib/products";

const img = (id: CategoryId) => categories.find((c) => c.id === id)!.image;

const slides: { title: string; text: string; image: string; c?: CategoryId }[] = [
  { title: "شيلان رجالية", text: "شيلان رجالية فاخرة - خامة تركية أصيلة", image: img("men-shawls"), c: "men-shawls" },
  { title: "شيلان نسائية", text: "شيلان نسائية بألوان عصرية", image: img("women-shawls"), c: "women-shawls" },
  { title: "حقائب نسائية", text: "حقائب راقية تكمل أناقتك", image: img("bags"), c: "bags" },
  { title: "صنادل كعب", text: "صنادل كعب مريحة وأنيقة", image: img("heels"), c: "heels" },
  { title: "ميكب ومستحضرات", text: "مستحضرات جمال أصلية 100%", image: img("makeup"), c: "makeup" },
  { title: "جود JOOD", text: `لأن أناقتكم لا تقبل إلا الأفضل - خصم 15% للطلب الأول ${DISCOUNT_CODE}`, image: identityBlack.url },
];

export function PromoSlider() {
  const [ref, api] = useEmblaCarousel({ loop: true, direction: "rtl", align: "start", duration: 30 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect).on("reInit", onSelect);
    onSelect();
    let t = setInterval(() => api.scrollNext(), 3000);
    const reset = () => { clearInterval(t); t = setInterval(() => api.scrollNext(), 3000); };
    api.on("pointerUp", reset).on("select", reset);
    return () => { clearInterval(t); api.off("select", onSelect); api.off("pointerUp", reset); api.off("select", reset); };
  }, [api]);

  const prev = useCallback(() => api?.scrollPrev(), [api]);
  const next = useCallback(() => api?.scrollNext(), [api]);

  return (
    <section aria-label="العروض" className="relative mb-6 promo-wide">
      <div className="absolute top-3 left-3 z-10 rounded-full border border-primary/50 bg-background/70 px-2.5 py-0.5 font-mono text-xs font-bold text-primary backdrop-blur" dir="ltr">
        {index + 1}/{slides.length}
      </div>
      <div ref={ref} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {slides.map((s) => (
            <div key={s.title} className="h-[200px] min-w-0 shrink-0 grow-0 basis-full ps-0 md:h-[300px] md:basis-1/3 md:px-1.5">
              <div className="relative h-full overflow-hidden rounded-2xl border border-primary/30">
                <img src={s.image} alt={s.title} className="absolute inset-0 size-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl font-bold text-primary">{s.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-foreground">{s.text}</p>
                  <Link to="/categories" search={s.c ? { c: s.c } : {}} className="mt-3 inline-block rounded-lg bg-gold px-5 py-2 text-sm font-bold text-primary-foreground shadow-gold">
                    تسوق الآن
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={prev} aria-label="السابق" className="absolute top-[30%] md:top-1/2 right-2 z-10 grid size-8 md:size-10 -translate-y-1/2 place-items-center rounded-full border border-primary bg-background/70 text-primary backdrop-blur">
        <ChevronRight className="size-5" />
      </button>
      <button onClick={next} aria-label="التالي" className="absolute top-[30%] md:top-1/2 left-2 z-10 grid size-8 md:size-10 -translate-y-1/2 place-items-center rounded-full border border-primary bg-background/70 text-primary backdrop-blur">
        <ChevronLeft className="size-5" />
      </button>
      <div className="mt-3 flex justify-center gap-2">
        {slides.map((s, i) => (
          <button key={s.title} onClick={() => api?.scrollTo(i)} aria-label={`الشريحة ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-primary/30"}`} />
        ))}
      </div>
    </section>
  );
}
