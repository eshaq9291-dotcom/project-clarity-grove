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
- The first account to sign up becomes the store admin (database trigger); roles live in `user_roles`.
