"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ponytail: Simplified single interface for product detail view
interface Produk {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  gambar: string;
  deskripsi: string;
  kategori: { nama: string };
  umkm: {
    id: string;
    nama: string;
    pemilik: string;
    no_hp: string;
    alamat: string;
    desa: {
      id: string;
      nama_desa: string;
      kecamatan: string;
      kabupaten: string;
      latitude: number;
      longitude: number;
    };
  };
}

export default function DetailProdukPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  
  const [produk, setProduk] = useState<Produk | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      const { data, error } = await supabase
        .from("produk")
        .select("*, kategori(nama), umkm(*, desa(*))")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching detail:", error);
      } else if (data) {
        setProduk(data as unknown as Produk);
        // ponytail: Using native QR Server API without extra local generator libraries
        const pageUrl = window.location.href;
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pageUrl)}`);
      }
      setLoading(false);
    }

    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="section-container py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-500">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="section-container py-16 text-center card max-w-xl mx-auto my-12">
        <p className="text-red-500 font-bold mb-4">Produk tidak ditemukan!</p>
        <Link href="/produk" className="btn-primary">Kembali ke Semua Produk</Link>
      </div>
    );
  }

  const handleHubungiPenjual = () => {
    // ponytail: Dynamic prefilled WhatsApp text template as simple native action
    const message = `Halo, saya tertarik dengan produk *${produk.nama}* dari desa *${produk.umkm.desa.nama_desa}*. Apakah stok ${produk.stok} masih tersedia?`;
    const waUrl = `https://wa.me/${produk.umkm.no_hp}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  // ponytail: Simple Google Maps iframe integration instead of heavy leaflet map load
  const mapIframeSrc = `https://maps.google.com/maps?q=${produk.umkm.desa.latitude},${produk.umkm.desa.longitude}&z=15&output=embed`;

  return (
    <div className="section-container py-8">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Beranda</Link> &gt;{" "}
        <Link href="/produk" className="hover:underline">Produk</Link> &gt;{" "}
        <span className="text-gray-900 dark:text-white font-semibold">{produk.nama}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Gallery & Desc */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden relative h-96 lg:h-[480px]">
            <Image
              src={produk.gambar}
              alt={produk.nama}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Deskripsi Produk</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {produk.deskripsi}
            </p>
          </div>
        </div>

        {/* Right Column: Order Info, QR Code & Maps */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <span className="badge">{produk.kategori?.nama || "Kategori"}</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{produk.nama}</h1>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>??</span>
              <Link href={`/umkm/${produk.umkm.id}`} className="hover:underline font-semibold text-primary-600">
                {produk.umkm.nama}
              </Link>
            </div>

            <div className="text-3xl font-extrabold text-primary-700 dark:text-primary-400 my-4">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(produk.harga)}
            </div>

            <div className="flex justify-between text-sm border-t border-b border-gray-100 dark:border-[#2d4a2d] py-3 text-gray-600 dark:text-gray-300">
              <span>Stok Tersedia</span>
              <span className="font-bold">{produk.stok} unit</span>
            </div>

            <button
              onClick={handleHubungiPenjual}
              className="w-full btn-primary flex justify-center items-center gap-2"
            >
              <span>??</span> Hubungi Penjual
            </button>
          </div>

          {/* QR Code Card */}
          <div className="card p-6 flex flex-col items-center text-center space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white">QR Code Produk</h4>
            {qrUrl && (
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <img src={qrUrl} alt="QR Code Link Produk" className="w-36 h-36" />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Scan untuk membuka halaman produk ini secara cepat. Sangat cocok jika UMKM ikut bazar.
            </p>
          </div>

          {/* Maps Card */}
          <div className="card p-6 space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white">Asal Desa</h4>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-bold">{produk.umkm.desa.nama_desa}</p>
              <p>{produk.umkm.desa.kecamatan}, {produk.umkm.desa.kabupaten}</p>
            </div>
            
            <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-[#2d4a2d]">
              <iframe
                src={mapIframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${produk.umkm.desa.latitude},${produk.umkm.desa.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full text-center text-xs py-2 block"
            >
              ?? Lihat di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
