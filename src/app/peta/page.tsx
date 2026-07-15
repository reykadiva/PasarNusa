"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Desa {
  id: string;
  nama_desa: string;
  kabupaten: string;
  latitude: number;
  longitude: number;
}

interface UMKM {
  id: string;
  nama: string;
  pemilik: string;
  desa: Desa;
}

export default function PetaPage() {
  const supabase = createClient();
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUmkm, setSelectedUmkm] = useState<UMKM | null>(null);

  useEffect(() => {
    async function fetchUMKM() {
      const { data } = await supabase.from("umkm").select("*, desa(*)");
      if (data) {
        setUmkms(data as unknown as UMKM[]);
        if (data.length > 0) setSelectedUmkm(data[0] as unknown as UMKM);
      }
      setLoading(false);
    }
    fetchUMKM();
  }, []);

  if (loading) {
    return (
      <div className="section-container py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // ponytail: Use simple native responsive Google Maps iframe dynamically centered on the selected UMKM location
  const mapIframeSrc = selectedUmkm
    ? `https://maps.google.com/maps?q=${selectedUmkm.desa.latitude},${selectedUmkm.desa.longitude}&z=14&output=embed`
    : `https://maps.google.com/maps?q=-7.250445,112.768845&z=10&output=embed`;

  return (
    <div className="section-container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Peta Sebaran UMKM</h1>
        <p className="text-gray-500 mt-1">Cari dan temukan lokasi fisik pelaku UMKM desa binaan di peta interaktif.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: UMKM List */}
        <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Daftar Toko UMKM</h3>
          {umkms.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">Tidak ada data UMKM.</div>
          ) : (
            umkms.map((umkm) => (
              <div
                key={umkm.id}
                onClick={() => setSelectedUmkm(umkm)}
                className={`card p-4 cursor-pointer transition-all duration-200 border-2 ${
                  selectedUmkm?.id === umkm.id ? "border-primary-500 bg-primary-50/55 dark:bg-primary-950/20" : "border-transparent"
                }`}
              >
                <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64M18 21V9.75M18 9.75v-.75A2.25 2.25 0 0 0 15.75 6.75h-7.5A2.25 2.25 0 0 0 6 9v.75m12 0a2.25 2.25 0 0 1-2.25 2.25H8.25A2.25 2.25 0 0 1 6 9.75m12 0a2.25 2.25 0 0 0-2.25-2.25H8.25A2.25 2.25 0 0 0 6 9.75M6 9.75V21m0 0H2.25m4.5 0h11.25" />
                  </svg>
                  {umkm.nama}
                </h4>
                <p className="text-xs text-gray-500 mt-1">Pemilik: {umkm.pemilik}</p>
                <p className="text-xs text-primary-700 dark:text-primary-400 font-semibold mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-primary-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Desa {umkm.desa?.nama_desa}, {umkm.desa?.kabupaten}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Map Display */}
        <div className="lg:col-span-2 space-y-4">
          {selectedUmkm && (
            <div className="card p-4 bg-primary-800 text-white flex justify-between items-center">
              <div>
                <span className="text-xs text-gold-300 font-semibold">Toko Terpilih</span>
                <h4 className="font-bold text-lg">{selectedUmkm.nama}</h4>
                <p className="text-xs text-primary-100">{selectedUmkm.desa.nama_desa}, {selectedUmkm.desa.kabupaten}</p>
              </div>
              <Link href={`/umkm/${selectedUmkm.id}`} className="btn-gold py-1.5 px-4 text-xs">
                Detail Profil
              </Link>
            </div>
          )}

          <div className="card overflow-hidden h-[500px] border border-gray-200 dark:border-[#2d4a2d]">
            <iframe src={mapIframeSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
