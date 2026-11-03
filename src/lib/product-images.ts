import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ColorImage = { id: string; color: string; path: string; url: string };

/** Loads the owner-uploaded photos of a product, grouped later by colour. */
export function useProductImages(productId: string | null) {
  const [images, setImages] = useState<ColorImage[]>([]);
  const reload = useCallback(async () => {
    if (!productId) return setImages([]);
    const { data } = await supabase
      .from("product_images")
      .select("id, color, path")
      .eq("product_id", productId)
      .order("sort")
      .order("created_at");
    const rows = data ?? [];
    if (!rows.length) return setImages([]);
    const { data: signed } = await supabase.storage.from("product-images").createSignedUrls(rows.map((r) => r.path), 60 * 60 * 24);
    setImages(rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl ?? "" })).filter((r) => r.url));
  }, [productId]);
  useEffect(() => { void reload(); }, [reload]);
  return { images, reload };
}
