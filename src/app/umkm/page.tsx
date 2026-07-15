"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Desa {
  nama_desa: string;
  kabupaten: string;
}

interface UMKM {
  id: string;
  nama: string;
  pemilik: string;
  alamat: string;
  desa: Desa;
}

export default function UMKMListPage() {
  const supabase = createClient();
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUMKM() {
      const { data } = await supabase.from("umkm").select("*, desa(*)");
      if (data) setUmkms(data as unknown as UMKM[]);
      setLoading(false);
    }
    fetchUMKM();
  }, []);

  const filteredUmkms = umkms.filter((umkm) =>
    umkm.nama.toLowerCase().includes(search.toLowerCase()) ||
    umkm.pemilik.toLowerCase().includes(search.toLowerCase()) ||
    umkm.desa?.nama_desa.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="section-container py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Daftar Mitra UMKM</h1>
          <p className="text-gray-500 mt-1">Dukung perekonomian lokal dengan membeli produk langsung dari wirausaha desa.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari UMKM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field py-2 pl-10 text-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </span>
        </div>
      </div>

      {filteredUmkms.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          Tidak ada UMKM yang sesuai dengan pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUmkms.map((umkm) => (
            <Link href={`/umkm/${umkm.id}`} key={umkm.id} className="card p-6 flex flex-col justify-between hover:border-primary-500 hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
                    {umkm.nama.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 dark:text-white line-clamp-1">{umkm.nama}</h3>
                    <p className="text-xs text-gray-400">Pemilik: {umkm.pemilik}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-4 line-clamp-2 flex items-start gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary-600 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  {umkm.alamat}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-[#2d4a2d] flex justify-between items-center text-xs">
                <span className="font-semibold text-primary-700 dark:text-primary-400">
                  Desa {umkm.desa?.nama_desa || "Desa"}
                </span>
                <span className="text-gray-400">
                  {umkm.desa?.kabupaten}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
