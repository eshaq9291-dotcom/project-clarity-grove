import identityBeige from "@/assets/jood-identity-beige.png.asset.json";
import identityBlack from "@/assets/jood-identity-black.png.asset.json";

export function IdentityArt() {
  return (
    <section className="mx-auto mb-6 w-full max-w-[180px] overflow-hidden rounded-2xl border border-primary/30">
      <img src={identityBeige.url} alt="هوية جود" className="block aspect-square w-full object-cover dark:hidden" />
      <img src={identityBlack.url} alt="هوية جود" className="hidden aspect-square w-full object-cover dark:block" />
    </section>
  );
}
