"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/context/CartContext";

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
  const router = useRouter();
  const supabase = createClient();
  
  const [produk, setProduk] = useState<Produk | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

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
        // ponytail: QR links to the story page for richer scanning experience
        const origin = window.location.origin;
        const storyUrl = `${origin}/produk/${id}/cerita`;
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storyUrl)}`);
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
      {/* Back Button & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-800/40 dark:bg-primary-950/40 border border-primary-700/50 dark:border-primary-800/80 text-sm font-semibold text-primary-100 dark:text-primary-200 hover:bg-primary-800/60 dark:hover:bg-primary-900/50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>

        <div className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">Beranda</Link> &gt;{" "}
          <Link href="/produk" className="hover:underline">Produk</Link> &gt;{" "}
          <span className="text-gray-900 dark:text-white font-semibold">{produk.nama}</span>
        </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64M18 21V9.75M18 9.75v-.75A2.25 2.25 0 0 0 15.75 6.75h-7.5A2.25 2.25 0 0 0 6 9v.75m12 0a2.25 2.25 0 0 1-2.25 2.25H8.25A2.25 2.25 0 0 1 6 9.75m12 0a2.25 2.25 0 0 0-2.25-2.25H8.25A2.25 2.25 0 0 0 6 9.75M6 9.75V21m0 0H2.25m4.5 0h11.25" />
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              Hubungi Penjual
            </button>

            <button
              onClick={() => {
                addItem({
                  id: produk.id,
                  nama: produk.nama,
                  harga: produk.harga,
                  gambar: produk.gambar,
                  umkmNama: produk.umkm.nama,
                  umkmNoHp: produk.umkm.no_hp,
                });
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
              }}
              className="w-full btn-gold flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {addedToCart ? "Ditambahkan!" : "Tambah ke Keranjang"}
            </button>
          </div>

          {/* QR Story Card */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-primary-800 to-primary-700 p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gold-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
                <h4 className="font-bold text-white text-sm">Story QR</h4>
              </div>
              {qrUrl && (
                <div className="p-2.5 bg-white rounded-xl inline-block shadow-lg">
                  <img src={qrUrl} alt="QR Code Cerita Produk" className="w-36 h-36" />
                </div>
              )}
              <p className="text-primary-200 text-[11px] mt-3 leading-relaxed">
                Scan QR ini untuk melihat cerita lengkap di balik produk ini.
              </p>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 italic">
                &ldquo;{produk.deskripsi}&rdquo;
              </p>
              <Link
                href={`/produk/${produk.id}/cerita`}
                className="btn-primary w-full text-center text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                Baca Cerita Produk
              </Link>
            </div>
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
              className="btn-secondary w-full text-center text-xs py-2 flex items-center justify-center gap-2"
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
