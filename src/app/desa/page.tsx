"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Desa {
  id: string;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
}

export default function DesaListPage() {
  const supabase = createClient();
  const [desas, setDesas] = useState<Desa[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDesas() {
      const { data } = await supabase.from("desa").select("*");
      if (data) setDesas(data as Desa[]);
      loading && setLoading(false);
    }
    fetchDesas();
  }, []);

  const filteredDesas = desas.filter((desa) =>
    desa.nama_desa.toLowerCase().includes(search.toLowerCase()) ||
    desa.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
    desa.kabupaten.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Daftar Desa Wisata</h1>
          <p className="text-gray-500 mt-1">Jelajahi sebaran komunitas pedesaan penggerak ekonomi PasarNusa.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari desa..."
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

      {filteredDesas.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          Tidak ada desa yang sesuai dengan pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesas.map((desa) => (
            <Link href={`/desa/${desa.id}`} key={desa.id} className="card p-6 flex flex-col justify-between hover:border-primary-500 hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-950 dark:text-white">{desa.nama_desa}</h3>
                    <p className="text-xs text-gray-400">Kecamatan: {desa.kecamatan}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-[#2d4a2d] flex justify-between items-center text-xs text-gray-400">
                <span>Kabupaten {desa.kabupaten}</span>
                <span className="font-semibold text-primary-700 dark:text-primary-400 hover:underline">Lihat Desa &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
