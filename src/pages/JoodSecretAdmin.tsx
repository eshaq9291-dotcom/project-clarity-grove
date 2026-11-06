import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboard } from "./AdminDashboard";

const STORAGE_KEY = "jood_admin_session";

export function JoodSecretAdmin() {
  const [session, setSession] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      supabase
        .rpc("jood_admin_check", { _session: saved })
        .then(({ data }: { data: boolean | null }) => {
          if (data) setSession(saved);
          else localStorage.removeItem(STORAGE_KEY);
        });
    }
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: e } = await supabase.rpc("jood_admin_login", {
        _password: password,
      });
      if (e) throw e;
      if (typeof data === "string") {
        localStorage.setItem(STORAGE_KEY, data);
        setSession(data);
      }
    } catch {
      setError("كلمة السر غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setPassword("");
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <div className="w-full max-w-sm rounded-2xl border border-[#D4AF37]/30 bg-zinc-900 p-8">
          <h1 className="text-center text-2xl font-bold text-[#D4AF37]">JOOD | جود</h1>
          <p className="mb-6 mt-1 text-center text-xs text-zinc-400">لوحة الإدارة السرية</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="كلمة سر الإدارة"
            className="mb-3 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]"
          />
          {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
          >
            {loading ? "..." : "دخول"}
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard session={session} onLogout={handleLogout} />;
}
