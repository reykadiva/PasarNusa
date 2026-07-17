"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Produk {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  gambar: string;
  deskripsi: string;
  created_at: string;
  kategori: { nama: string };
  satuan?: string;
  umkm: {
    nama: string;
    desa: { nama_desa: string; kabupaten: string };
  };
}

interface Kategori {
  id: string;
  nama: string;
}

interface Desa {
  id: string;
  nama_desa: string;
}

export default function ProdukPage() {
  const supabase = createClient();

  const [produks, setProduks] = useState<Produk[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [desas, setDesas] = useState<Desa[]>([]);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [selectedDesa, setSelectedDesa] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("terbaru");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // items per page

  // Fetch filter metadata
  useEffect(() => {
    async function fetchMetadata() {
      const { data: katData } = await supabase.from("kategori").select("id, nama");
      const { data: desaData } = await supabase.from("desa").select("id, nama_desa");
      if (katData) setKategoris(katData);
      if (desaData) setDesas(desaData);
    }
    fetchMetadata();
  }, []);

  // Fetch products with filters & pagination
  useEffect(() => {
    async function fetchProducts() {
      // Calculate offset
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      // Base query
      let query = supabase
        .from("produk")
        .select("*, kategori(nama), umkm(*, desa(*))", { count: "exact" });

      // Apply search (nama produk)
      if (search.trim() !== "") {
        query = query.ilike("nama", `%${search}%`);
      }

      // Apply Kategori Filter
      if (selectedKategori !== "all") {
        query = query.eq("kategori_id", selectedKategori);
      }

      // Apply Desa Filter
      if (selectedDesa !== "all") {
        // Query filter via related table path
        query = query.eq("umkm.desa_id", selectedDesa);
      }

      // Apply Price Range Filters
      if (minPrice !== "") {
        query = query.gte("harga", parseFloat(minPrice));
      }
      if (maxPrice !== "") {
        query = query.lte("harga", parseFloat(maxPrice));
      }

      // Apply Sorting
      if (sortOrder === "terbaru") {
        query = query.order("created_at", { ascending: false });
      } else if (sortOrder === "terlama") {
        query = query.order("created_at", { ascending: true });
      } else if (sortOrder === "sebulan_lalu") {
        // Filter products created within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte("created_at", thirtyDaysAgo.toISOString()).order("created_at", { ascending: false });
      }

      // Pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
      } else if (data) {
        // Filter out items where nested relation join did not match client filter
        let filteredData = data as unknown as Produk[];
        if (selectedDesa !== "all") {
          filteredData = filteredData.filter(
            (p: any) => p.umkm && String(p.umkm.desa_id) === String(selectedDesa)
          );
        }
        setProduks(filteredData);
        if (count) {
          setTotalPages(Math.ceil(count / limit));
        }
      }
    }

    fetchProducts();
  }, [search, selectedKategori, selectedDesa, minPrice, maxPrice, sortOrder, currentPage]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedKategori("all");
    setSelectedDesa("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("terbaru");
    setCurrentPage(1);
  };

  return (
    <div className="section-container py-8">
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Beranda</Link> &gt; <span>Semua Produk</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Filter Form */}
        <aside className="w-full md:w-64 space-y-6 flex-shrink-0">
          <div className="card p-6 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filter</h3>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
              <select
                value={selectedKategori}
                onChange={(e) => { setSelectedKategori(e.target.value); setCurrentPage(1); }}
                className="input-field py-2 text-sm"
              >
                <option value="all">Semua Kategori</option>
                {kategoris.map((kat) => (
                  <option key={kat.id} value={kat.id}>{kat.nama}</option>
                ))}
              </select>
            </div>

            {/* Lokasi Desa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lokasi Desa</label>
              <select
                value={selectedDesa}
                onChange={(e) => { setSelectedDesa(e.target.value); setCurrentPage(1); }}
                className="input-field py-2 text-sm"
              >
                <option value="all">Semua Desa</option>
                {desas.map((d) => (
                  <option key={d.id} value={d.id}>{d.nama_desa}</option>
                ))}
              </select>
            </div>

            {/* Rentang Harga */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rentang Harga (Rp)</label>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                  className="input-field py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                  className="input-field py-2 text-sm"
                />
              </div>
            </div>

            <button onClick={handleClearFilters} className="btn-secondary w-full py-2 text-sm">
              Hapus Filter
            </button>
          </div>
        </aside>

        {/* Right Side: Product Grid */}
        <main className="flex-grow">
          {/* Top Bar with Search & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="input-field py-2 pl-10 text-sm"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-sm text-gray-500 whitespace-nowrap">Urutkan:</span>
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                className="input-field py-2 text-sm w-40"
              >
                <option value="terbaru">Terbaru</option>
                <option value="sebulan_lalu">1 Bulan Lalu</option>
                <option value="terlama">Terlama</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {produks.length === 0 ? (
            <div className="text-center py-16 card">
              <p className="text-gray-500 dark:text-gray-400">Tidak ada produk yang cocok dengan filter pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {produks.map((produk) => (
                <Link href={`/produk/${produk.id}`} key={produk.id} className="card group overflow-hidden flex flex-col h-full">
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={produk.gambar}
                      alt={produk.nama}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <span className="badge mb-2">{produk.kategori?.nama || "Kategori"}</span>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                        {produk.nama}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-primary-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {produk.umkm?.desa?.nama_desa}, {produk.umkm?.desa?.kabupaten}
                      </p>
                      <p className="text-xs text-gray-400">
                        Oleh: {produk.umkm?.nama}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2d4a2d] flex justify-between items-center">
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-primary-700 dark:text-primary-400">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(produk.harga)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          per {produk.satuan || "pcs"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Stok: {produk.stok}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Server-side Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-1.5 mt-12 bg-white dark:bg-[#1a2e1a] p-3 rounded-2xl border border-gray-100 dark:border-[#2d4a2d] max-w-full overflow-x-auto shadow-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-primary-950 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-primary-900/40 transition-colors"
                title="Halaman Pertama"
              >
                &laquo;
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage((prev) => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-primary-950 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-primary-900/40 transition-colors"
              >
                Sebelumnya
              </button>

              {/* First Page if far */}
              {currentPage > 3 && totalPages > 5 && (
                <>
                  <button
                    onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-primary-950 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/40 transition-colors"
                  >
                    1
                  </button>
                  <span className="text-gray-400 dark:text-gray-600 px-1 text-xs">...</span>
                </>
              )}

              {/* Dynamic visible page range */}
              {(() => {
                const pages = [];
                let startPage = Math.max(1, currentPage - 1);
                let endPage = Math.min(totalPages, currentPage + 1);

                if (currentPage <= 2) {
                  endPage = Math.min(totalPages, 3);
                }
                if (currentPage >= totalPages - 1) {
                  startPage = Math.max(1, totalPages - 2);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                return pages.map((page) => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      currentPage === page
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                        : "bg-gray-50 dark:bg-primary-950 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/40"
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}

              {/* Last Page if far */}
              {currentPage < totalPages - 2 && totalPages > 5 && (
                <>
                  <span className="text-gray-400 dark:text-gray-600 px-1 text-xs">...</span>
                  <button
                    onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-primary-950 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/40 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage((prev) => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-primary-950 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-primary-900/40 transition-colors"
              >
                Berikutnya
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-primary-950 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-primary-900/40 transition-colors"
                title="Halaman Terakhir"
              >
                &raquo;
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
