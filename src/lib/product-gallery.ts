import type { Product } from "@/lib/products";

/** Owner photos replace the complete fallback gallery for the selected colour. */
export function resolveProductGallery(
  product: Pick<Product, "image" | "colorImages">,
  color: string,
  uploaded: readonly { color: string; url: string }[],
): string[] {
  const gallery = uploaded.filter((image) => image.color === color && image.url).map((image) => image.url);
  return gallery.length ? gallery : [product.colorImages?.[color] ?? product.image];
}