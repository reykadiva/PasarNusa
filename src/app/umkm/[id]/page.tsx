"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface UMKM {
  id: string;
  nama: string;
  pemilik: string;
  alamat: string;
  no_hp: string;
  desa: {
    nama_desa: string;
    kecamatan: string;
    kabupaten: string;
    latitude: number;
    longitude: number;
  };
}

interface Produk {
  id: string;
  nama: string;
  harga: number;
  gambar: string;
  kategori: { nama: string };
}

export default function DetailUMKMPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [umkm, setUmkm] = useState<UMKM | null>(null);
  const [produks, setProduks] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUMKMData() {
      // Fetch UMKM info along with desa
      const { data: umkmData } = await supabase
        .from("umkm")
        .select("*, desa(*)")
        .eq("id", id)
        .single();

      if (umkmData) {
        setUmkm(umkmData as unknown as UMKM);

        // Fetch products of this UMKM
        const { data: prodData } = await supabase
          .from("produk")
          .select("*, kategori(nama)")
          .eq("umkm_id", id);
        if (prodData) setProduks(prodData as unknown as Produk[]);
      }
      setLoading(false);
    }

    if (id) fetchUMKMData();
  }, [id]);

  if (loading) {
    return (
      <div className="section-container py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="section-container py-16 text-center card max-w-xl mx-auto my-12">
        <p className="text-red-500 font-bold mb-4">UMKM tidak ditemukan!</p>
        <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
      </div>
    );
  }

  const mapIframeSrc = `https://maps.google.com/maps?q=${umkm.desa.latitude},${umkm.desa.longitude}&z=15&output=embed`;

  return (
    <div className="section-container py-8">
      {/* Back Button & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-primary-950 border border-gray-200 dark:border-primary-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-900/50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>

        <div className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">Beranda</Link> &gt;{" "}
          <span className="text-gray-900 dark:text-white font-semibold">{umkm.nama}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Profile details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {umkm.nama.charAt(0)}
            </div>
            <div className="space-y-3">
              <span className="badge flex items-center gap-1 w-max">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-primary-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
                UMKM Terverifikasi
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">{umkm.nama}</h1>
              <p className="text-gray-600 dark:text-gray-300">Pemilik: <span className="font-semibold text-gray-800 dark:text-white">{umkm.pemilik}</span></p>
              <p className="text-gray-600 dark:text-gray-300">Alamat: <span className="italic">{umkm.alamat}</span></p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${umkm.no_hp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-2 px-4 text-sm flex items-center gap-2 w-max"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                  Hubungi Penjual ({umkm.no_hp})
                </a>
              </div>
            </div>
          </div>

          {/* Produk List */}
          <div>
            <h3 className="section-title mb-6">Produk Kami</h3>
            {produks.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">UMKM ini belum mengunggah produk.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {produks.map((produk) => (
                  <Link href={`/produk/${produk.id}`} key={produk.id} className="card group overflow-hidden flex flex-col">
                    <div className="relative h-44 w-full bg-gray-100">
                      <Image src={produk.gambar} alt={produk.nama} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="badge mb-2">{produk.kategori?.nama}</span>
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">{produk.nama}</h4>
                      </div>
                      <div className="mt-4 pt-2 border-t border-gray-100 dark:border-[#2d4a2d] text-primary-700 dark:text-primary-400 font-bold">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(produk.harga)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Location/Desa details */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white">Lokasi Toko</h4>
            <p className="text-sm text-gray-500">
              Desa {umkm.desa.nama_desa}, Kecamatan {umkm.desa.kecamatan}, Kabupaten {umkm.desa.kabupaten}
            </p>
            <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-[#2d4a2d]">
              <iframe src={mapIframeSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${umkm.desa.latitude},${umkm.desa.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full text-center text-sm py-2 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-wood-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446 3.602-1.2a1.125 1.125 0 0 0 .748-1.066V7.484a1.125 1.125 0 0 0-.748-1.066L15 4.875M9 6.75 5.25 5.562A1.125 1.125 0 0 0 4.5 6.628v11.233a1.125 1.125 0 0 0 .748 1.066L9 20.25m0-13.5v13.5m6-13.5v13.5m-6 0 6-2.25" />
              </svg>
              Lihat di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
