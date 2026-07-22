"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login?redirect=/profile");
        return;
      }
      setUser(user);
      setDisplayName(user.user_metadata?.display_name || user.email?.split("@")[0] || "");
      setRole(user.user_metadata?.role || "user");
      setPhone(user.user_metadata?.phone || "");
      setAddress(user.user_metadata?.address || "");
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg("");

    const res = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        phone: phone,
        address: address,
      }
    });

    setUpdating(false);
    if (res.error) {
      alert(res.error.message || "Gagal memperbarui profil.");
    } else {
      setSuccessMsg("Profil berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500 font-semibold animate-pulse">Memuat profil...</div>
      </div>
    );
  }

  return (
    <div className="section-container py-8 max-w-2xl">
      {/* Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-800/40 dark:bg-primary-950/40 border border-primary-700/50 dark:border-primary-800/80 text-sm font-semibold text-primary-100 dark:text-primary-200 hover:bg-primary-800/60 dark:hover:bg-primary-900/50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
        <div className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">Beranda</Link> &gt;{" "}
          <span className="text-gray-900 dark:text-white font-semibold">Data Diri</span>
        </div>
      </div>

      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-primary-800/50 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold font-display shadow-inner">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${role === "admin" ? "bg-gold-500 text-wood-950" : "bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300"}`}>
                Role: {role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-red-500 hover:text-white border border-red-500/25 hover:bg-red-500 px-3 py-1.5 rounded-xl font-bold transition-all"
          >
            Keluar
          </button>
        </div>

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3.5 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field text-sm py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">Email (Akun)</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="input-field text-sm py-2.5 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">Nomor Telepon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="input-field text-sm py-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">Alamat Pengiriman</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tuliskan alamat lengkap pengiriman produk..."
              className="input-field text-sm py-2.5 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="btn-primary w-full md:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl"
            >
              {updating ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
