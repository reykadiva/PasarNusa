"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Beranda</Link> &gt;{" "}
        <span className="text-gray-900 dark:text-white font-semibold">{umkm.nama}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Profile details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {umkm.nama.charAt(0)}
            </div>
            <div className="space-y-3">
              <span className="badge">?? UMKM Terverifikasi</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">{umkm.nama}</h1>
              <p className="text-gray-600 dark:text-gray-300">Pemilik: <span className="font-semibold text-gray-800 dark:text-white">{umkm.pemilik}</span></p>
              <p className="text-gray-600 dark:text-gray-300">Alamat: <span className="italic">{umkm.alamat}</span></p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${umkm.no_hp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-2 px-4 text-sm"
                >
                  ?? Hubungi Penjual ({umkm.no_hp})
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
              className="btn-secondary w-full text-center text-sm py-2 block"
            >
              ?? Lihat di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
