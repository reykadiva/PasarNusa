"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const redirectUrl = searchParams.get("redirect") || "/";

  // Check if already logged in
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push(redirectUrl);
      }
    }
    checkUser();
  }, [router, redirectUrl, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccessMsg("Login berhasil! Mengalihkan...");
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 1000);
    }
  };

  // Mock demonstration logins for convenience
  const handleQuickLogin = async (role: "admin" | "user") => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const targetEmail = role === "admin" ? "admin@pasarnusa.com" : "user@pasarnusa.com";
    const targetPassword = role === "admin" ? "admin123" : "user123";

    // 1. Try real login first
    const { error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });

    if (error) {
      // 2. If user doesn't exist, try signing them up first, then sign in
      const { error: signUpError } = await supabase.auth.signUp({
        email: targetEmail,
        password: targetPassword,
        options: {
          data: {
            display_name: role === "admin" ? "Administrator PasarNusa" : "Reyka Diva",
            role: role,
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("confirm")) {
          setErrorMsg("Pendaftaran sukses! Namun Anda harus melakukan konfirmasi email (atau nonaktifkan 'Confirm email' di dashboard Supabase -> Authentication -> Providers -> Email -> turn off 'Confirm email').");
        } else {
          setErrorMsg(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Retry sign in
      const { error: signInRetryError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });

      if (signInRetryError) {
        if (signInRetryError.message.toLowerCase().includes("confirm")) {
          setErrorMsg("Email not confirmed. Silakan konfirmasi email Anda, atau nonaktifkan pilihan 'Confirm email' di Supabase Dashboard -> Authentication -> Providers -> Email -> matikan toggle 'Confirm email' agar demo bisa langsung masuk.");
        } else {
          setErrorMsg(signInRetryError.message);
        }
        setLoading(false);
      } else {
        setSuccessMsg(`Berhasil mendaftarkan & login sebagai ${role === "admin" ? "Admin" : "User"}!`);
        setTimeout(() => {
          router.push(role === "admin" ? "/admin" : redirectUrl);
          router.refresh();
        }, 1200);
      }
    } else {
      setSuccessMsg(`Login berhasil sebagai ${role === "admin" ? "Admin" : "User"}!`);
      setTimeout(() => {
        router.push(role === "admin" ? "/admin" : redirectUrl);
        router.refresh();
      }, 1000);
    }
  };

  return (
    <div className="card max-w-md w-full p-8 space-y-6 shadow-xl border border-gray-100 dark:border-primary-800/40">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block text-2xl font-bold font-display text-gradient mb-2">
          PasarNusa
        </Link>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Masuk ke Akun Anda</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Silakan gunakan akun demo atau email Anda</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold leading-relaxed">
          {errorMsg.includes("Confirm email") || errorMsg.includes("confirmed") ? (
            <div>
              <p className="font-bold mb-1">Email Belum Dikonfirmasi</p>
              <p className="font-normal text-[11px] opacity-90 leading-relaxed">
                Supabase memblokir login sebelum email dikonfirmasi. Agar demo akses cepat bisa langsung masuk tanpa konfirmasi email, silakan nonaktifkan pengaturannya di:
              </p>
              <div className="bg-red-100/50 dark:bg-red-950/40 p-2 rounded-lg mt-2 font-mono text-[10px] text-red-800 dark:text-red-300">
                Supabase Dashboard &gt; Authentication &gt; Providers &gt; Email &gt; Matikan toggle &quot;Confirm email&quot;
              </div>
            </div>
          ) : (
            errorMsg
          )}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 p-3.5 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="input-field text-sm py-2.5"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Password</label>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field text-sm py-2.5"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 font-semibold rounded-xl text-sm transition-all"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="relative flex items-center justify-center my-2">
        <div className="absolute inset-x-0 h-px bg-gray-200 dark:bg-primary-800/40"></div>
        <span className="relative px-3 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1a2e1a]">
          Atau Masuk Dengan
        </span>
      </div>

      {/* Google Login Button */}
      <a
        href="http://localhost:5000/api/auth/google"
        className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 border border-gray-200 dark:border-primary-800/40 rounded-xl bg-white dark:bg-[#1a2e1a] text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-primary-900/30 active:scale-[0.98] transition-all shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
        </svg>
        Google Account
      </a>

      <div className="relative flex items-center justify-center my-2">
        <div className="absolute inset-x-0 h-px bg-gray-200 dark:bg-primary-800/40"></div>
        <span className="relative px-3 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1a2e1a]">
          Atau Demo Akses Cepat
        </span>
      </div>

      {/* Demo Accounts Panel */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleQuickLogin("user")}
          disabled={loading}
          className="btn-secondary py-2.5 text-xs font-bold flex flex-col items-center justify-center gap-1 hover:border-primary-600/50"
        >
          <span className="text-gray-900 dark:text-white">Akun User</span>
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-normal">user@pasarnusa.com</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin("admin")}
          disabled={loading}
          className="btn-gold py-2.5 text-xs font-bold flex flex-col items-center justify-center gap-1 hover:border-gold-600/50"
        >
          <span className="text-wood-950">Akun Admin</span>
          <span className="text-[9px] text-wood-700 font-normal">admin@pasarnusa.com</span>
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50 dark:bg-transparent">
      <Suspense fallback={<div className="text-gray-500 font-semibold animate-pulse">Memuat halaman login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
