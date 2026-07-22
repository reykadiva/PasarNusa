"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { BenefitIcon, LeafIcon, SparklesIcon, BeeIcon, TreeIcon, FlowerIcon } from "@/components/Icons";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Produk {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  gambar: string;
  deskripsi: string;
  satuan?: string;
  keunggulan?: string;
  cerita?: string;
  kategori: { nama: string };
  umkm: {
    id: string;
    nama: string;
    pemilik: string;
    no_hp: string;
    alamat: string;
    sejak?: string;
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

interface CeritaProduk {
  cerita: string;
  jenis?: string;
  habitat?: string;
  sumber_nektar?: string;
  manfaat?: string;
  proses?: string;
  fakta_unik?: string;
  petani_nama?: string;
  petani_sejak?: string;
  petani_foto?: string;
  galeri?: string;
  varietas?: string;
  ketinggian?: string;
  cita_rasa?: string;
  tanpa_pestisida?: boolean;
  nutrisi?: string;
  resep?: string;
  pengrajin?: string;
  lama_pembuatan?: string;
  filosofi?: string;
  bahan?: string;
}

/* ------------------------------------------------------------------ */
/*  SVG Icon Components                                                */
/* ------------------------------------------------------------------ */

function IconLeaf({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13V7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6" />
    </svg>
  );
}

function IconMapPin({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function IconUser({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function IconHeart({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function IconStar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

function IconCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function IconChat({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}

function IconCamera({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    </svg>
  );
}

function IconSparkles({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function CeritaProdukPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();

  const [produk, setProduk] = useState<Produk | null>(null);
  const [cerita, setCerita] = useState<CeritaProduk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Verify user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/produk/${id}/cerita`);
        return;
      }
      // Fetch produk
      const { data: produkData } = await supabase
        .from("produk")
        .select("*, kategori(nama), umkm(*, desa(*))")
        .eq("id", id)
        .single();

      if (produkData) {
        setProduk(produkData as unknown as Produk);
      }

      setLoading(false);
    }

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-900 to-primary-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400 mx-auto mb-4"></div>
          <p className="text-primary-200 text-sm">Memuat cerita produk...</p>
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-900 to-primary-950">
        <div className="card p-8 text-center max-w-sm mx-4">
          <p className="text-red-500 font-bold mb-4">Produk tidak ditemukan!</p>
          <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const storyText = produk.cerita || produk.deskripsi;
  // Parse keunggulan into a list of points
  const manfaatList = parseList(produk.keunggulan);
  const sumberList = [] as string[];
  const galeriList = [] as string[];
  const kategori = produk.kategori?.nama || "";

  const handleHubungi = () => {
    const message = `Halo, saya tertarik dengan produk *${produk.nama}* dari PasarNusa. Apakah masih tersedia?`;
    const waUrl = `https://wa.me/6285267900655?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1f0f]">

      {/* ============================================================ */}
      {/*  Navigation Bar                                               */}
      {/* ============================================================ */}
      <div className="sticky top-0 z-50 bg-primary-900/80 backdrop-blur-lg border-b border-primary-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Link href={`/produk/${produk.id}`} className="flex items-center gap-2 text-primary-200 hover:text-white transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Kembali
          </Link>
          <span className="text-xs text-primary-400 font-semibold tracking-wider uppercase">PasarNusa Story</span>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-12">

        {/* ============================================================ */}
        {/*  1 - Hero Image                                              */}
        {/* ============================================================ */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={produk.gambar}
            alt={produk.nama}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, 512px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a] via-[#1a2e1a]/20 to-transparent" />

          {/* Product name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-wood-900 mb-3">
              <IconStar className="w-3 h-3" />
              {kategori}
            </span>
            <h1 className="text-3xl font-bold text-white font-display leading-tight">
              {produk.nama}
            </h1>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  2 - Cerita Produk (Main Unified Narrative)                  */}
        {/* ============================================================ */}
        <section className="px-5 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
              <IconSparkles className="w-4 h-4 text-gold-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Kisah Produk & Asal Usul</h2>
          </div>
          <div className="bg-primary-800/30 border border-primary-700/40 rounded-2xl p-6 space-y-4">
            <p className="text-primary-100/90 leading-relaxed text-sm italic">
              &ldquo;{storyText}&rdquo;
            </p>
            
            {/* Embedded details as a unified story list */}
            <div className="pt-4 border-t border-primary-700/40 space-y-3.5 text-xs text-primary-200">
              {cerita?.jenis && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gold-400 shrink-0 min-w-[110px] inline-flex items-center gap-1.5">
                    <BeeIcon className="w-4 h-4 text-gold-400" />
                    Jenis Lebah:
                  </span>
                  <span>{cerita.jenis}</span>
                </div>
              )}
              {cerita?.habitat && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gold-400 shrink-0 min-w-[110px] inline-flex items-center gap-1.5">
                    <TreeIcon className="w-4 h-4 text-gold-400" />
                    Habitat:
                  </span>
                  <span>{cerita.habitat}</span>
                </div>
              )}
              {sumberList.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gold-400 shrink-0 min-w-[110px] inline-flex items-center gap-1.5">
                    <FlowerIcon className="w-4 h-4 text-gold-400" />
                    Nektar:
                  </span>
                  <span>{sumberList.join(", ")}</span>
                </div>
              )}
              {manfaatList.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gold-400 shrink-0 min-w-[110px] inline-flex items-center gap-1.5">
                    <BenefitIcon className="w-4 h-4 text-gold-400" />
                    Manfaat:
                  </span>
                  <span>{manfaatList.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  3 - Info Cards Grid (dynamic based on available data)        */}
        {/* ============================================================ */}
        <section className="px-5 mt-8">
          <div className="grid grid-cols-2 gap-3">
            {/* Jenis / Varietas */}
            {(cerita?.jenis || cerita?.varietas) && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-primary-600/30 flex items-center justify-center mb-2">
                  <IconLeaf className="w-4 h-4 text-primary-300" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">
                  {cerita?.jenis ? "Jenis" : "Varietas"}
                </p>
                <p className="text-sm text-white font-semibold">{cerita?.jenis || cerita?.varietas}</p>
              </div>
            )}

            {/* Habitat / Ketinggian */}
            {(cerita?.habitat || cerita?.ketinggian) && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-primary-600/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">
                  {cerita?.habitat ? "Habitat" : "Ketinggian"}
                </p>
                <p className="text-sm text-white font-semibold">{cerita?.habitat || cerita?.ketinggian}</p>
              </div>
            )}

            {/* Cita Rasa */}
            {cerita?.cita_rasa && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-gold-600/30 flex items-center justify-center mb-2">
                  <IconStar className="w-4 h-4 text-gold-300" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">Cita Rasa</p>
                <p className="text-sm text-white font-semibold">{cerita.cita_rasa}</p>
              </div>
            )}

            {/* Proses */}
            {cerita?.proses && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-wood-600/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-wood-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.048.58.024 1.194-.14 1.743" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">Proses</p>
                <p className="text-sm text-white font-semibold">{cerita.proses}</p>
              </div>
            )}

            {/* Tanpa Pestisida */}
            {cerita?.tanpa_pestisida !== undefined && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-green-600/30 flex items-center justify-center mb-2">
                  <IconCheck className="w-4 h-4 text-green-300" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">Pestisida</p>
                <p className="text-sm text-white font-semibold">{cerita.tanpa_pestisida ? "Tanpa Pestisida" : "Menggunakan Pestisida"}</p>
              </div>
            )}

            {/* Lama Pembuatan */}
            {cerita?.lama_pembuatan && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4">
                <div className="w-7 h-7 rounded-lg bg-wood-600/30 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-wood-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">Lama Pembuatan</p>
                <p className="text-sm text-white font-semibold">{cerita.lama_pembuatan}</p>
              </div>
            )}

            {/* Filosofi */}
            {cerita?.filosofi && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4 col-span-2">
                <div className="w-7 h-7 rounded-lg bg-gold-600/30 flex items-center justify-center mb-2">
                  <IconSparkles className="w-4 h-4 text-gold-300" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">Filosofi Motif</p>
                <p className="text-sm text-white font-semibold">{cerita.filosofi}</p>
              </div>
            )}

            {/* Bahan */}
            {cerita?.bahan && (
              <div className="bg-primary-800/30 border border-primary-700/30 rounded-xl p-4 col-span-2">
                <div className="w-7 h-7 rounded-lg bg-wood-600/30 flex items-center justify-center mb-2">
                  <IconLeaf className="w-4 h-4 text-wood-300" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold mb-1">Bahan yang Digunakan</p>
                <p className="text-sm text-white font-semibold">{cerita.bahan}</p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  4 - Sumber Nektar / Nutrisi                                 */}
        {/* ============================================================ */}
        {sumberList.length > 0 && (
          <section className="px-5 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <IconLeaf className="w-4 h-4 text-primary-300" />
              </div>
              <h2 className="text-lg font-bold text-white">Sumber Nektar</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {sumberList.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-primary-800/50 border border-primary-700/40 px-3.5 py-1.5 text-xs font-medium text-primary-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/*  5 - Manfaat                                                 */}
        {/* ============================================================ */}
        {manfaatList.length > 0 && (
          <section className="px-5 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <IconHeart className="w-4 h-4 text-green-300" />
              </div>
              <h2 className="text-lg font-bold text-white">Manfaat</h2>
            </div>
            <div className="space-y-2.5">
              {manfaatList.map((m, i) => (
                <div key={i} className="flex items-start gap-3 bg-primary-800/20 border border-primary-700/30 rounded-xl px-4 py-3">
                  <IconCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-primary-100">{m}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/*  6 - Asal Desa (Origin)                                      */}
        {/* ============================================================ */}
        <section className="px-5 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
              <IconMapPin className="w-4 h-4 text-gold-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Asal Produk</h2>
          </div>
          <div className="bg-primary-800/30 border border-primary-700/40 rounded-2xl overflow-hidden">
            <div className="h-40 relative">
              <iframe
                src={`https://maps.google.com/maps?q=${produk.umkm.desa.latitude},${produk.umkm.desa.longitude}&z=13&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              ></iframe>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-white font-bold">Desa {produk.umkm.desa.nama_desa}</h3>
              <p className="text-primary-300 text-sm">
                Kecamatan {produk.umkm.desa.kecamatan}, Kabupaten {produk.umkm.desa.kabupaten}
              </p>
              <Link href={`/desa/${produk.umkm.desa.id}`} className="inline-flex items-center gap-1.5 text-gold-400 hover:text-gold-300 text-xs font-semibold transition-colors mt-1">
                Jelajahi Desa Ini
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  7 - Petani / Pengrajin                                      */}
        {/* ============================================================ */}
        <section className="px-5 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-wood-500/20 flex items-center justify-center">
              <IconUser className="w-4 h-4 text-wood-300" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {cerita?.pengrajin ? "Pengrajin" : "Petani / Produsen"}
            </h2>
          </div>
          <div className="bg-primary-800/30 border border-primary-700/40 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              {cerita?.petani_foto ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500/50 shrink-0">
                  <Image src={cerita.petani_foto} alt="Foto petani" fill className="object-cover" sizes="64px" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-700/50 border-2 border-primary-600/30 flex items-center justify-center shrink-0">
                  <IconUser className="w-7 h-7 text-primary-400" />
                </div>
              )}
              <div>
                <h3 className="text-white font-bold text-lg">
                  {produk.umkm.pemilik}
                </h3>
                <p className="text-primary-300 text-sm">{produk.umkm.nama}</p>
                <p className="text-gold-400 text-xs font-semibold mt-1">
                  Usaha sejak {produk.umkm.sejak || "2015"}
                </p>
              </div>
            </div>
            <p className="text-primary-300/80 text-sm mt-4 leading-relaxed">
              Produk ini diproduksi langsung oleh {produk.umkm.nama} di bawah binaan Desa Wisata {produk.umkm.desa.nama_desa}. Setiap pembelian Anda secara langsung mendukung pertumbuhan ekonomi lokal.
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  8 - Galeri (if available)                                    */}
        {/* ============================================================ */}
        {galeriList.length > 0 && (
          <section className="px-5 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <IconCamera className="w-4 h-4 text-primary-300" />
              </div>
              <h2 className="text-lg font-bold text-white">Galeri</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {galeriList.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image src={url} alt={`Galeri ${i + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 256px" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/*  9 - Tahukah Anda? (Fun Fact)                                */}
        {/* ============================================================ */}
        {cerita?.fakta_unik && (
          <section className="px-5 mt-8">
            <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <IconHeart className="w-5 h-5 text-gold-400" />
                <h2 className="text-base font-bold text-gold-300">Tahukah Anda?</h2>
              </div>
              <p className="text-primary-100/90 text-sm italic leading-relaxed">
                &ldquo;{cerita.fakta_unik}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/*  10 - Resep (if available)                                   */}
        {/* ============================================================ */}
        {cerita?.resep && (
          <section className="px-5 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-wood-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-wood-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Resep Masakan</h2>
            </div>
            <div className="bg-primary-800/30 border border-primary-700/40 rounded-2xl p-5">
              <p className="text-primary-100/90 text-sm leading-relaxed whitespace-pre-line">{cerita.resep}</p>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/*  11 - CTA: Hubungi & Beli                                    */}
        {/* ============================================================ */}
        <section className="px-5 mt-10 mb-4">
          <div className="bg-gradient-to-br from-primary-700 to-primary-800 border border-primary-600/30 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Tertarik dengan produk ini?</h3>
            <p className="text-primary-200 text-sm mb-6">
              Hubungi langsung produsennya dan dukung perekonomian desa.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleHubungi} className="btn-gold w-full py-3 flex items-center justify-center gap-2 text-base font-bold">
                <IconChat className="w-5 h-5 text-wood-900" />
                Hubungi Penjual
              </button>
              <Link href={`/produk/${produk.id}`} className="btn-secondary w-full py-3 text-center border-primary-500/30 text-primary-200 hover:bg-primary-700/50 text-sm">
                Lihat Detail Produk
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  Footer Brand                                                */}
        {/* ============================================================ */}
        <div className="text-center py-8">
          <p className="text-primary-500 text-xs">Dipersembahkan oleh</p>
          <p className="text-primary-300 font-display font-bold text-lg mt-1">PasarNusa</p>
          <p className="text-primary-600 text-[10px] mt-1">Belanja Lokal, Bangun Desa.</p>
        </div>
      </div>
    </div>
  );
}
