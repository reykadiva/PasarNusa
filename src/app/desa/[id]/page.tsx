"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Desa {
  id: string;
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  latitude: number;
  longitude: number;
}

interface UMKM {
  id: string;
  nama: string;
  pemilik: string;
  alamat: string;
  no_hp: string;
}

interface Produk {
  id: string;
  nama: string;
  harga: number;
  gambar: string;
  kategori: { nama: string };
  umkm: { nama: string };
}

export default function DetailDesaPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [desa, setDesa] = useState<Desa | null>(null);
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [produks, setProduks] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDesaData() {
      // Fetch desa info
      const { data: desaData } = await supabase.from("desa").select("*").eq("id", id).single();
      
      if (desaData) {
        setDesa(desaData);

        // Fetch UMKM in this desa
        const { data: umkmData } = await supabase.from("umkm").select("*").eq("desa_id", id);
        if (umkmData) setUmkms(umkmData);

        // Fetch products from UMKM in this desa
        if (umkmData && umkmData.length > 0) {
          const umkmIds = umkmData.map((u) => u.id);
          const { data: prodData } = await supabase
            .from("produk")
            .select("*, kategori(nama), umkm(nama)")
            .in("umkm_id", umkmIds);
          if (prodData) setProduks(prodData as unknown as Produk[]);
        }
      }
      setLoading(false);
    }

    if (id) fetchDesaData();
  }, [id]);

  if (loading) {
    return (
      <div className="section-container py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!desa) {
    return (
      <div className="section-container py-16 text-center card max-w-xl mx-auto my-12">
        <p className="text-red-500 font-bold mb-4">Desa tidak ditemukan!</p>
        <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
      </div>
    );
  }

  const mapIframeSrc = `https://maps.google.com/maps?q=${desa.latitude},${desa.longitude}&z=14&output=embed`;

  return (
    <div className="section-container py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Beranda</Link> &gt;{" "}
        <span className="text-gray-900 dark:text-white font-semibold">{desa.nama_desa}</span>
      </div>

      {/* Header Panel */}
      <div className="card p-8 bg-gradient-to-r from-primary-900 to-primary-700 text-white mb-8">
        <div className="max-w-3xl">
          <span className="badge-gold mb-3">?? Detail Desa Wisata</span>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">{desa.nama_desa}</h1>
          <p className="text-primary-100 text-lg">Kecamatan {desa.kecamatan}, Kabupaten {desa.kabupaten}</p>
          <div className="flex gap-6 mt-6 text-sm text-gold-200">
            <div>
              <span className="font-bold text-white text-xl block">{umkms.length}</span>
              UMKM Lokal terdaftar
            </div>
            <div>
              <span className="font-bold text-white text-xl block">{produks.length}</span>
              Produk unggulan desa
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: UMKM & Produk List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daftar Produk */}
          <div>
            <h3 className="section-title mb-4">Produk Unggulan Desa</h3>
            {produks.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">Belum ada produk terdaftar dari desa ini.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {produks.map((produk) => (
                  <Link href={`/produk/${produk.id}`} key={produk.id} className="card group overflow-hidden flex flex-col">
                    <div className="relative h-40 w-full bg-gray-100">
                      <Image src={produk.gambar} alt={produk.nama} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="badge mb-2">{produk.kategori?.nama}</span>
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">{produk.nama}</h4>
                        <p className="text-xs text-gray-400">Oleh: {produk.umkm?.nama}</p>
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

          {/* Daftar UMKM */}
          <div>
            <h3 className="section-title mb-4">Daftar UMKM Lokal</h3>
            {umkms.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">Belum ada UMKM terdaftar dari desa ini.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {umkms.map((umkm) => (
                  <Link href={`/umkm/${umkm.id}`} key={umkm.id} className="card p-5 hover:border-primary-500 transition-all flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                      ??
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 dark:text-white">{umkm.nama}</h4>
                      <p className="text-xs text-gray-400">Pemilik: {umkm.pemilik}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map & Lokasi */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white">Peta Lokasi Desa</h4>
            <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-[#2d4a2d]">
              <iframe src={mapIframeSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${desa.latitude},${desa.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center text-sm py-2.5 block"
            >
              ?? Buka di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
