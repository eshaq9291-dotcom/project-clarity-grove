import { describe, expect, it } from "vitest";
import { resolveProductGallery } from "@/lib/product-gallery";
import { getProduct } from "@/lib/products";

describe("product colour photos", () => {
  it.each(["JD-5530", "JD-4470", "JD-3310", "JD-1150"])("switches fallback photos for every colour of %s", (id) => {
    const product = getProduct(id);
    if (!product) throw new Error(`Missing product ${id}`);
    const galleries = product.colors.map((color) => resolveProductGallery(product, color, []));
    expect(galleries).toHaveLength(2);
    expect(galleries[0]?.[0]).not.toEqual(galleries[1]?.[0]);
    for (const color of product.colors) expect(product.colorImages?.[color]).toBeTruthy();
  });

  it("prioritizes the complete owner-uploaded gallery for the selected colour", () => {
    const product = { image: "base.jpg", colorImages: { "بني": "generated-brown.jpg" } };
    expect(resolveProductGallery(product, "بني", [
      { color: "أسود", url: "owner-black.jpg" },
      { color: "بني", url: "owner-brown-1.jpg" },
      { color: "بني", url: "owner-brown-2.jpg" },
    ])).toEqual(["owner-brown-1.jpg", "owner-brown-2.jpg"]);
  });

  it("falls back to the selected colour when its owner photo has no usable URL", () => {
    expect(resolveProductGallery({ image: "base.jpg", colorImages: { "بني": "brown.jpg" } }, "بني", [
      { color: "بني", url: "" },
    ])).toEqual(["brown.jpg"]);
  });

  it("uses the base photo only when the selected colour has no photo", () => {
    expect(resolveProductGallery({ image: "base.jpg" }, "بني", [])).toEqual(["base.jpg"]);
  });
});