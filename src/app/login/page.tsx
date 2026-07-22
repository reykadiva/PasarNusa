"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { LogoIcon } from "@/components/Icons";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "634110685120-btss5ukl8fnn0tbb04j6vmmdmeekjhle.apps.googleusercontent.com";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, redirectUrl]);

  // Handle Google OAuth callback (implicit flow - token comes back in URL hash)
  const handleGoogleCallback = useCallback(async (accessToken: string) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("Login Google berhasil! Menyimpan data...");

    try {
      // Fetch user info from Google using the access token
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data akun Google");

      const googleUser = await res.json();

      // Save user data to our Express/MongoDB backend if available
      try {
        const API_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "/api";

        await fetch(`${API_URL}/auth/google/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: googleUser.id,
            name: googleUser.name,
            email: googleUser.email,
            picture: googleUser.picture,
          }),
        });
      } catch {
        // Backend save failed silently - continue with client session
      }

      // Check if email is an admin email
      const adminEmails = ["reyka334@gmail.com", "admin@pasarnusa.com", "admin@gmail.com"];
      const isAdmin = adminEmails.some(e => googleUser.email?.toLowerCase().includes(e.toLowerCase())) || googleUser.email?.includes("admin");
      const userRole = isAdmin ? "admin" : "user";

      // Store user in localStorage using the SAME key the auth simulator reads
      const userData = {
        id: googleUser.id,
        email: googleUser.email,
        user_metadata: {
          display_name: googleUser.name,
          avatar_url: googleUser.picture,
          role: userRole,
          phone: "",
          address: "",
        },
        app_metadata: { provider: "google" },
        last_sign_in_at: new Date().toISOString(),
      };

      // Clear logout flag and store user data
      localStorage.removeItem("pasarnusa_logged_out");
      localStorage.setItem("pasarnusa_user", JSON.stringify(userData));
      localStorage.setItem("google_user", JSON.stringify({
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        lastLogin: new Date().toISOString(),
      }));

      // Clean URL hash
      window.history.replaceState(null, "", window.location.pathname);

      setSuccessMsg(`Selamat datang, ${googleUser.name}! Mengalihkan...`);
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Login Google gagal");
      setLoading(false);
    }
  }, [router, redirectUrl]);

  // Check for Google OAuth callback token in URL hash on page load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        handleGoogleCallback(accessToken);
      }
    }
  }, [handleGoogleCallback]);

  // Google OAuth login - redirect to Google's auth endpoint
  const handleGoogleLogin = () => {
    setLoading(true);
    const redirectUri = `${window.location.origin}/login`;
    const scope = "openid email profile";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="card max-w-md w-full p-8 space-y-6 shadow-2xl border border-gray-100 dark:border-primary-800/40 text-center">
      <div className="flex flex-col items-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-bold text-gradient mb-1">
          <LogoIcon className="w-9 h-9" />
          <span>PasarNusa</span>
        </Link>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Masuk Akun PasarNusa</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          Gunakan Akun Google Anda untuk masuk secara cepat, aman, dan tanpa perlu mengingat password.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold leading-relaxed text-left">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 p-3.5 rounded-xl text-xs font-semibold text-center animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Google Login Button */}
      <div className="pt-2 pb-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 dark:border-primary-800/60 rounded-2xl bg-white dark:bg-[#1a2e1a] text-gray-800 dark:text-gray-100 font-bold text-sm hover:bg-gray-50 dark:hover:bg-primary-900/40 active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? "Menghubungkan ke Google..." : "Masuk dengan Google Account"}
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-primary-800/40 pt-4">
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Dengan masuk, Anda menyetujui Ketentuan Layanan &amp; Kebijakan Privasi PasarNusa.
        </p>
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
