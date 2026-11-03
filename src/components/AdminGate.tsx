import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Page } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";

/** Client-side gate for ERP pages; the database RLS (admin role) is the real protection. */
export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "out" | "denied" | "ok">("loading");
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setState("out");
      const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      setState(ok ? "ok" : "denied");
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT") check(); });
    return () => sub.subscription.unsubscribe();
  }, []);
  if (state === "ok") return <>{children}</>;
  return (
    <Page>
      <div className="mt-16 text-center">
        {state === "loading" ? <p className="text-muted-foreground">...</p> : (
          <>
            <p className="font-bold">{state === "out" ? "سجّل الدخول كصاحب المتجر أولاً" : "هذا الحساب لا يملك صلاحية الإدارة"}</p>
            <Link to="/admin" className="mt-4 inline-block rounded-xl bg-gold px-6 py-3 font-bold text-primary-foreground">صفحة الدخول</Link>
          </>
        )}
      </div>
    </Page>
  );
}
