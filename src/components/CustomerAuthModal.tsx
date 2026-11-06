import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function CustomerAuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, [open]);

  const handleEmailAuth = async () => {
    setError(null);
    if (!email || password.length < 4) {
      setError("الرجاء إدخال البريد وكلمة سر 4 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ في تسجيل الدخول";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "facebook" | "apple") => {
    setError(null);
    setLoading(true);
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({ provider });
      if (e) throw e;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ في الدخول";
      setError(msg);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[#D4AF37]/30 bg-zinc-900 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-3 left-3 rounded-full p-1.5 text-zinc-400 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold text-[#D4AF37]">جود | JOOD</h2>
          <p className="mt-1 text-xs text-zinc-400">
            {user ? "حسابك" : mode === "signup" ? "إنشاء حساب جديد" : "تسجيل دخول العميل"}
          </p>
        </div>

        {user ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-zinc-300">
              مرحباً بك{user.email ? `، ${user.email}` : ""}!
            </p>
            <button
              onClick={handleSignOut}
              className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر"
              className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]"
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              {loading ? "..." : mode === "signup" ? "إنشاء الحساب" : "دخول"}
            </button>

            <div className="flex items-center gap-2 py-1">
              <div className="h-px flex-1 bg-zinc-700" />
              <span className="text-[10px] text-zinc-500">أو</span>
              <div className="h-px flex-1 bg-zinc-700" />
            </div>

            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              <GoogleIcon /> الدخول بـ Google
            </button>
            <button
              onClick={() => handleOAuth("facebook")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2.5 text-sm font-semibold text-[#1877F2] hover:bg-[#1877F2]/20"
            >
              <FacebookIcon /> الدخول بـ Facebook
            </button>
            <button
              onClick={() => handleOAuth("apple")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900"
            >
              <AppleIcon /> الدخول بـ Apple
            </button>

            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="w-full pt-1 text-center text-xs text-zinc-400 hover:text-[#D4AF37]"
            >
              {mode === "signup"
                ? "لديك حساب؟ تسجيل الدخول"
                : "ليس لديك حساب؟ إنشاء حساب جديد"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.09-2.02-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.8 1.3 10.36.86 1.26 1.88 2.67 3.22 2.62 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.28 3.12-2.55.98-1.46 1.38-2.88 1.4-2.95-.03-.01-2.69-1.03-2.72-4.09zM14.6 4.46c.71-.86 1.19-2.06 1.06-3.26-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.43z" />
    </svg>
  );
}
