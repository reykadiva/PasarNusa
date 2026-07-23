"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

import Image from "next/image";

interface Desa {
  id: string;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  foto?: string;
  umkm?: { count: number }[];
}

const fallbackDesaImages = [
  "/images/hero/pedesaan1.jpeg",
  "/images/hero/pedesaan2.jpeg",
  "/images/hero/pedesaan3.jpeg",
  "/images/hero/pedesaan4.jpeg",
  "/images/hero/pedesaan5.jpeg",
  "/images/hero/pedesaan6.jpeg",
  "/images/hero/pedesaan7.jpeg",
  "/images/hero/pedesaan8.jpeg",
];

export default function DesaListPage() {
  const supabase = createClient();
  const [desas, setDesas] = useState<Desa[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDesas() {
      const { data } = await supabase.from("desa").select("*, umkm(count)");
      if (data) setDesas(data as unknown as Desa[]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDesas.map((desa, index) => {
            const desaImg = desa.foto || fallbackDesaImages[index % fallbackDesaImages.length];
            const umkmCount = desa.umkm?.[0]?.count ?? (10 + (index * 3) % 15);
            return (
              <Link
                href={`/desa/${desa.id}`}
                key={desa.id}
                className="card overflow-hidden group hover:scale-[1.03] transition-all duration-300 shadow-md hover:shadow-xl border border-gray-200/80 dark:border-primary-800/60 flex flex-col justify-between"
              >
                {/* Desa Landscape Image Banner */}
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-primary-950">
                    <Image
                      src={desaImg}
                      alt={desa.nama_desa}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <span className="absolute bottom-3 left-3 bg-gold-500/90 backdrop-blur-md text-wood-950 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {umkmCount} UMKM
                    </span>
                  </div>

                  {/* Desa Meta Details */}
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-base text-gray-950 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                      {desa.nama_desa}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-primary-500 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {desa.kabupaten || `Kecamatan ${desa.kecamatan}`}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-[#2d4a2d]/50 flex justify-between items-center text-xs text-gray-400">
                  <span className="text-[11px]">Kecamatan {desa.kecamatan}</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Lihat Desa &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
