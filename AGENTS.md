<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Orders are created only through the `placeOrder` server function, which recomputes totals from `src/lib/products.ts`; customers never write to the database directly (no anon policies on orders).
- Receipt reading uses the AI Gateway in `src/lib/receipt-ai.server.ts`; marking an order paid always goes through `confirmPayment`, which checks the admin role and needs an explicit acknowledgement when the amount differs or wasn't read.
- Owner product controls use verified owner activation and two-hour admin sessions; passwords are verified by Cloud Auth, never browser storage. Roles live in `user_roles`.
- Product saves and deletes use owner-gated transactional RPCs against `products` and main-warehouse `stock`; the ERP link stays internal to avoid the unrelated external backend.
- Exchange rates, wallet numbers and Sana'a delivery zones live in the single-row `store_settings` table (public read, admin update via `saveSettings`); client reads them through `useStore().settings`, and `placeOrder` re-reads them server-side. Never hardcode these values.
- Per-colour product photos live in `product_images` + private `product-images` bucket (anon read via signed URLs, admin write); resolve galleries through `src/lib/product-gallery.ts` in owner-uploaded, catalog-colour, base-image order to keep fallback behaviour consistent.
