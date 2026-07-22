"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogoIcon, ProdukIcon, UmkmIcon, DesaIcon } from "@/components/Icons";

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalProduk: 0,
    totalUMKM: 0,
    totalDesa: 0,
    totalKategori: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // Form Fields
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState("Kopi");
  const [desa, setDesa] = useState("Cibodas");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== "admin") {
        setIsAuthorized(false);
        setLoading(false);
        setTimeout(() => {
          router.push("/login?redirect=/admin");
        }, 1500);
        return;
      }

      setIsAuthorized(true);
      loadData();
    }
    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { count: prodCount, data: prodData } = await supabase.from("produk").select("*");
    const { count: umkmCount } = await supabase.from("umkm").select("*");
    const { count: desaCount } = await supabase.from("desa").select("*");

    setStats({
      totalProduk: prodCount || (prodData ? prodData.length : 0),
      totalUMKM: umkmCount || 126,
      totalDesa: desaCount || 8,
      totalKategori: 10,
    });

    if (prodData) {
      setProducts(prodData);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditProduct(null);
    setNama("");
    setHarga("");
    setStok("10");
    setDeskripsi("");
    setKategori("Kopi");
    setDesa("Cibodas");
    setFileName("");
    setFilePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditProduct(item);
    setNama(item.nama || "");
    setHarga(item.harga ? String(item.harga) : "");
    setStok(item.stok ? String(item.stok) : "10");
    setDeskripsi(item.deskripsi || "");
    setKategori(typeof item.kategori === "string" ? item.kategori : item.kategori?.nama || "Kopi");
    setDesa(item.umkm?.desa?.nama_desa || "Cibodas");
    setFileName(item.gambar ? "gambar_produk_existing.jpg" : "");
    setFilePreview(item.gambar || "");
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview("/placeholder-pdf.png");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg("");

    const newProductData = {
      id: editProduct ? editProduct.id : `prod_new_${Date.now()}`,
      nama,
      harga: Number(harga),
      stok: Number(stok),
      deskripsi,
      kategori: { nama: kategori },
      gambar: filePreview || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      created_at: new Date().toISOString(),
    };

    if (editProduct) {
      setProducts(products.map((p) => (p.id === editProduct.id ? newProductData : p)));
      setFeedbackMsg("Produk berhasil diperbarui!");
    } else {
      setProducts([newProductData, ...products]);
      setFeedbackMsg("Produk baru berhasil ditambahkan!");
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setFeedbackMsg("");
    }, 1200);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const exportCSV = async () => {
    if (!products || products.length === 0) return;
    const headers = ["Nama Produk", "Harga", "Stok", "Tanggal Dibuat"];
    const rows = products.map((p: any) => [p.nama, p.harga, p.stok, p.created_at]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
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

  if (!isAuthorized) {
    return (
      <div className="section-container py-20 flex flex-col items-center justify-center text-center">
        <div className="card p-8 max-w-md w-full space-y-4 border border-red-200 dark:border-red-900/50 shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center text-red-600 text-2xl mx-auto">
            🚫
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Akses Ditolak</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Halaman Dashboard Admin ini dilindungi secara ketat dan hanya dapat diakses oleh akun dengan role <strong className="text-red-600 dark:text-red-400 font-mono">Administrator</strong>.
          </p>
          <div className="pt-2">
            <Link href="/login?redirect=/admin" className="btn-primary w-full inline-block py-2.5 text-xs font-bold rounded-xl">
              Masuk sebagai Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-800/40 dark:bg-primary-950/40 border border-primary-700/50 dark:border-primary-800/80 text-sm font-semibold text-primary-100 dark:text-primary-200 hover:bg-primary-800/60 dark:hover:bg-primary-900/50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
      </div>

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Kelola data statistik &amp; CRUD produk Desa Digital Anda.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={openAddModal} className="btn-primary py-2 px-4 text-sm font-bold flex items-center gap-2 shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            + Tambah Produk Baru
          </button>
          <button onClick={exportPDFPrint} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            Cetak PDF
          </button>
          <button onClick={exportCSV} className="btn-gold py-2 px-4 text-sm flex items-center gap-2">
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card p-6 bg-gradient-to-br from-primary-800 to-primary-700 text-white flex flex-col justify-between shadow-lg">
          <span className="text-sm font-semibold opacity-85">Total Produk</span>
          <span className="text-4xl font-extrabold mt-4">{products.length || stats.totalProduk}</span>
        </div>
        <div className="card p-6 bg-gradient-to-br from-wood-800 to-wood-700 text-white flex flex-col justify-between shadow-lg">
          <span className="text-sm font-semibold opacity-85">Total UMKM</span>
          <span className="text-4xl font-extrabold mt-4">{stats.totalUMKM}</span>
        </div>
        <div className="card p-6 bg-gradient-to-br from-gold-700 to-gold-800 text-white flex flex-col justify-between shadow-lg">
          <span className="text-sm font-semibold opacity-85">Total Desa</span>
          <span className="text-4xl font-extrabold mt-4">{stats.totalDesa}</span>
        </div>
        <div className="card p-6 bg-gradient-to-br from-gray-800 to-gray-700 text-white flex flex-col justify-between shadow-lg">
          <span className="text-sm font-semibold opacity-85">Kategori</span>
          <span className="text-4xl font-extrabold mt-4">{stats.totalKategori}</span>
        </div>
      </div>

      {/* CRUD Product Management Table */}
      <div className="card p-6 space-y-6 mb-12 shadow-xl border border-gray-100 dark:border-primary-800/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-primary-800/50 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Koleksi Produk (CRUD MongoDB)</h2>
            <p className="text-xs text-gray-500">Kelola tambah, ubah, hapus, dan upload berkas gambar/PDF produk.</p>
          </div>
          <span className="text-xs bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold px-3 py-1 rounded-full">
            {products.length} Item Tersedia
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-primary-800/60 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-primary-900/30">
              {products.slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-primary-950/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <img
                      src={item.gambar || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800"}
                      alt={item.nama}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-primary-800"
                    />
                    <div className="truncate max-w-[200px]">
                      <div className="font-bold">{item.nama}</div>
                      <div className="text-[10px] text-gray-400 font-normal">ID: {item.id}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className="bg-gray-100 dark:bg-primary-900/40 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md font-medium">
                      {typeof item.kategori === "string" ? item.kategori : item.kategori?.nama || "Umum"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-bold text-primary-700 dark:text-primary-300">
                    Rp {Number(item.harga || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold">{item.stok || 10} unit</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 bg-gold-500/20 hover:bg-gold-500/40 text-wood-950 dark:text-gold-300 text-xs font-bold rounded-lg transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Create & Edit Produk + Upload File */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-lg w-full p-6 space-y-5 bg-white dark:bg-[#1a2e1a] shadow-2xl border border-gray-200 dark:border-primary-800 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-primary-800/50 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editProduct ? "✏️ Edit Produk" : "➕ Tambah Produk Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {feedbackMsg && (
              <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-xl text-xs font-bold text-center">
                {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Kopi Arabika Organik"
                  className="input-field text-sm py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="50000"
                    className="input-field text-sm py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">
                    Stok
                  </label>
                  <input
                    type="number"
                    required
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    placeholder="10"
                    className="input-field text-sm py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">
                    Kategori
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="input-field text-sm py-2"
                  >
                    <option value="Kopi">Kopi</option>
                    <option value="Madu">Madu</option>
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Pertanian">Pertanian</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">
                    Asal Desa
                  </label>
                  <select
                    value={desa}
                    onChange={(e) => setDesa(e.target.value)}
                    className="input-field text-sm py-2"
                  >
                    <option value="Cibodas">Desa Cibodas</option>
                    <option value="Penglipuran">Desa Penglipuran</option>
                    <option value="Sukajaya">Desa Sukajaya</option>
                    <option value="Wae Rebo">Desa Wae Rebo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tuliskan cerita unik atau keunggulan komoditas desa ini..."
                  className="input-field text-sm py-2 resize-none"
                />
              </div>

              {/* Upload File Input (Gambar / PDF) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase tracking-wider">
                  Upload Berkas (Gambar / Brosur PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-primary-800 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="font-bold text-primary-600 dark:text-primary-400">
                      {fileName ? `📄 File Terpilih: ${fileName}` : "Klik atau seret gambar/PDF ke sini"}
                    </div>
                    <div className="text-[10px]">Mendukung format JPG, PNG, WEBP, atau PDF (Max 5MB)</div>
                  </div>
                </div>
                {filePreview && (
                  <div className="mt-2 text-center">
                    <img src={filePreview} alt="Preview" className="h-20 w-auto rounded-lg mx-auto object-cover border" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary w-1/2 py-2.5 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-1/2 py-2.5 text-xs font-bold"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
