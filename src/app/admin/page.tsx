"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalProduk: 0,
    totalUMKM: 0,
    totalDesa: 0,
    totalKategori: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { count: prodCount } = await supabase.from("produk").select("*", { count: "exact", head: true });
      const { count: umkmCount } = await supabase.from("umkm").select("*", { count: "exact", head: true });
      const { count: desaCount } = await supabase.from("desa").select("*", { count: "exact", head: true });
      const { count: katCount } = await supabase.from("kategori").select("*", { count: "exact", head: true });

      setStats({
        totalProduk: prodCount || 0,
        totalUMKM: umkmCount || 0,
        totalDesa: desaCount || 0,
        totalKategori: katCount || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  // ponytail: Simple native Excel CSV representation format and native PDF generation setup
  const exportCSV = async () => {
    // Fetch products
    const { data: products } = await supabase
      .from("produk")
      .select("nama, harga, stok, created_at");

    if (!products || products.length === 0) return;

    const headers = ["Nama Produk", "Harga", "Stok", "Tanggal Dibuat"];
    const rows = products.map((p) => [p.nama, p.harga, p.stok, p.created_at]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_produk_desa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDFPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="section-container py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-primary-950 border border-gray-200 dark:border-primary-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-900/50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Kelola data statistik Pasar Desa Digital Anda.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={exportPDFPrint} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h-11.32m11.32 0a49.211 49.211 0 0 0-1.12-7.5M6.34 18a49.211 49.211 0 0 1 1.12-7.5m0 0a4.125 4.125 0 0 1 4.125-4.125h3.75A4.125 4.125 0 0 1 16.5 10.5m-9.036 0a39.002 39.002 0 0 1 9.036 0M15 6.75V4.875c0-.621-.504-1.125-1.125-1.125h-3.75c-.621 0-1.125.504-1.125 1.125V6.75M9.75 12h4.5m-4.5 3h4.5" />
            </svg>
            Cetak Laporan (PDF)
          </button>
          <button onClick={exportCSV} className="btn-gold py-2 px-4 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-wood-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125V3.375c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v1.5m-15 15a1.125 1.125 0 0 0 1.125 1.125h17.25a1.125 1.125 0 0 0 1.125-1.125V14.25m-18.75 4.5V10.5m18.75 4.5V10.5m-18.75 0a1.125 1.125 0 0 1 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125m-18.75 0V3.375c0-.621.504-1.125 1.125-1.125h12.75M3.75 6v3.75m0-3.75h16.5m-16.5 0v3.75m16.5-3.75v3.75m-16.5 0h16.5m-16.5 0v3.75m16.5-3.75v3.75m-16.5 0h16.5m-16.5 0V14.25m16.5-3.75V14.25m-16.5 0h16.5" />
            </svg>
            Ekspor Excel (CSV)
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card p-6 bg-gradient-to-br from-primary-800 to-primary-700 text-white flex flex-col justify-between">
          <span className="text-sm font-semibold opacity-85">Total Produk</span>
          <span className="text-4xl font-extrabold mt-4">{stats.totalProduk}</span>
        </div>
        <div className="card p-6 bg-gradient-to-br from-wood-800 to-wood-700 text-white flex flex-col justify-between">
          <span className="text-sm font-semibold opacity-85">Total UMKM</span>
          <span className="text-4xl font-extrabold mt-4">{stats.totalUMKM}</span>
        </div>
        <div className="card p-6 bg-gradient-to-br from-gold-700 to-gold-800 text-white flex flex-col justify-between">
          <span className="text-sm font-semibold opacity-85">Total Desa</span>
          <span className="text-4xl font-extrabold mt-4">{stats.totalDesa}</span>
        </div>
        <div className="card p-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white flex flex-col justify-between">
          <span className="text-sm font-semibold opacity-85">Kategori</span>
          <span className="text-4xl font-extrabold mt-4">{stats.totalKategori}</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Statistik Produk Terlaris</h3>
          {/* ponytail: Custom CSS visualization component instead of heavy chart bundle */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Kopi Arabika Premium</span>
                <span>80% Terjual</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#2d4a2d] h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary-600 h-full rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Madu Hutan Asli</span>
                <span>65% Terjual</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#2d4a2d] h-2.5 rounded-full overflow-hidden">
                <div className="bg-wood-600 h-full rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Kain Tenun Tradisional</span>
                <span>30% Terjual</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#2d4a2d] h-2.5 rounded-full overflow-hidden">
                <div className="bg-gold-600 h-full rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">UMKM Teraktif per Desa</h3>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Desa Cibodas</span>
                <span>18 UMKM</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#2d4a2d] h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary-500 h-full rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Desa Penglipuran</span>
                <span>12 UMKM</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#2d4a2d] h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary-400 h-full rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Desa Sukajaya</span>
                <span>8 UMKM</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#2d4a2d] h-2.5 rounded-full overflow-hidden">
                <div className="bg-primary-300 h-full rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
