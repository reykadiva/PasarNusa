import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { HeroSearchForm, HomeInteractiveMap } from "@/components/HomeSearchAndMap";
import { PertanianIcon, KopiIcon, MaduIcon, KerajinanIcon, SayuranIcon, SnackIcon, TehIcon, CokelatIcon, MinumanIcon, OlehOlehIcon } from "@/components/Icons";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Desa {
  id: string;
  nama_desa: string;
  kabupaten?: string;
}

interface Umkm {
  nama: string;
  desa: Desa | null;
}

interface Produk {
  id: string;
  nama: string;
  harga: number;
  gambar: string | null;
  created_at: string;
  umkm: Umkm | null;
}

interface DesaWithCount {
  id: string;
  nama_desa: string;
  kabupaten: string | null;
  umkm: { count: number }[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const categoryIcons: Record<string, React.ReactNode> = {
  Pertanian: <PertanianIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
  Kopi: <KopiIcon className="w-8 h-8 text-wood-600 dark:text-wood-400" />,
  Madu: <MaduIcon className="w-8 h-8 text-gold-600 dark:text-gold-400" />,
  Kerajinan: <KerajinanIcon className="w-8 h-8 text-wood-600 dark:text-wood-400" />,
  Sayuran: <SayuranIcon className="w-8 h-8 text-green-600 dark:text-green-400" />,
  Snack: <SnackIcon className="w-8 h-8 text-gold-700 dark:text-gold-400" />,
  Teh: <TehIcon className="w-8 h-8 text-green-700 dark:text-green-400" />,
  Cokelat: <CokelatIcon className="w-8 h-8 text-amber-700 dark:text-amber-400" />,
  Minuman: <MinumanIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
  "Oleh-Oleh": <OlehOlehIcon className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
};

const categories = [
  "Pertanian", "Kopi", "Madu", "Kerajinan", "Sayuran", "Snack", "Teh", "Cokelat", "Minuman", "Oleh-Oleh",
] as const;

const desaImages = [
  "/images/hero/pedesaan1.jpeg",
  "/images/hero/pedesaan2.jpeg",
  "/images/hero/pedesaan3.jpeg",
  "/images/hero/pedesaan4.jpeg",
  "/images/hero/pedesaan5.jpeg",
  "/images/hero/pedesaan6.jpeg",
  "/images/hero/pedesaan7.jpeg",
  "/images/hero/pedesaan8.jpeg",
];

const heroBackgrounds = [
  "/images/hero/pedesaan1.jpeg",
  "/images/hero/pedesaan2.jpeg",
  "/images/hero/pedesaan3.jpeg",
];

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  /* Fetch produk terbaru */
  const { data: produkData } = await supabase
    .from("produk")
    .select("*, umkm(nama, desa(nama_desa))")
    .order("created_at", { ascending: false })
    .limit(4);

  const produkList = (produkData ?? []) as unknown as Produk[];

  /* Fetch desa populer */
  const { data: desaData } = await supabase
    .from("desa")
    .select("*, umkm(count)")
    .limit(8);

  const desaList = (desaData ?? []) as unknown as DesaWithCount[];

  return (
    <main className="min-h-screen">
      {/* ============================================================ */}
      {/*  1 · Hero Section — Full BG Pedesaan + Glassmorphism          */}
      {/* ============================================================ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Full-screen countryside background */}
        <Image
          src="/images/hero/pedesaan3.jpeg"
          alt="Pemandangan pedesaan Indonesia"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />

        {/* Decorative light blurs */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary-400/15 blur-[100px]" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gold-400/10 blur-[120px]" />

        {/* Glass panel content */}
        <div className="section-container relative z-10 w-full py-16 md:py-24">
          <div className="mx-auto max-w-2xl animate-fade-in-up">
            {/* Liquid Glass Panel — iOS-inspired */}
            <div
              className="rounded-3xl border border-white/20 p-8 sm:p-10 md:p-12"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Tag */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Marketplace Desa Nusantara
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Belanja Lokal,
                <br />
                <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                  Bangun Desa.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">
                Temukan produk terbaik dari UMKM dan desa di seluruh Indonesia. Langsung dari petani, langsung ke rumah Anda.
              </p>

              {/* Search bar inside glass */}
              <HeroSearchForm />

              {/* Stats row */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">8</span>
                  <span>Desa<br/>Mitra</span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">126+</span>
                  <span>UMKM<br/>Terdaftar</span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">290+</span>
                  <span>Produk<br/>Lokal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream-50 dark:from-[#0f1a0f] to-transparent" />
      </section>

      {/* ============================================================ */}
      {/*  2 · Kategori Produk                                         */}
      {/* ============================================================ */}
      <section className="py-16 md:py-20 animate-fade-in-up">
        <div className="section-container">
          <h2 className="section-title text-center">Kategori Produk</h2>
          <p className="section-subtitle text-center">
            Jelajahi berbagai kategori produk unggulan dari desa-desa Indonesia
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/produk?kategori=${encodeURIComponent(cat)}`}
                className="card group flex flex-col items-center gap-3 p-6 text-center cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  {categoryIcons[cat]}
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3 · Produk Terbaru                                          */}
      {/* ============================================================ */}
      <section className="py-16 md:py-20 bg-primary-50/50 dark:bg-primary-900/10 animate-fade-in-up">
        <div className="section-container">
          {/* Header row */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Produk Terbaru</h2>
              <p className="section-subtitle">Baru ditambahkan oleh UMKM desa</p>
            </div>
            <Link
              href="/produk"
              className="hidden sm:inline-flex items-center gap-1 font-semibold text-primary-700 dark:text-primary-400 hover:underline"
            >
              Lihat Semua
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Product grid */}
          {produkList.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {produkList.map((produk) => (
                <ProductCard key={produk.id} produk={produk} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
              Belum ada produk yang tersedia.
            </p>
          )}

          {/* Mobile "Lihat Semua" */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/produk" className="btn-primary">
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4 · Desa Populer                                            */}
      {/* ============================================================ */}
      <section className="py-16 md:py-20 animate-fade-in-up">
        <div className="section-container">
          <h2 className="section-title text-center">Desa Populer</h2>
          <p className="section-subtitle text-center">
            Desa-desa dengan produk unggulan dan UMKM aktif
          </p>

          {desaList.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {desaList.map((desa, idx) => (
                <DesaCard
                  key={desa.id}
                  desa={desa}
                  imageUrl={desaImages[idx % desaImages.length]}
                />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
              Belum ada desa yang terdaftar.
            </p>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5 · Peta UMKM                                               */}
      {/* ============================================================ */}
      <section className="py-16 md:py-20 bg-primary-50/50 dark:bg-primary-900/10 animate-fade-in-up">
        <div className="section-container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="section-title">Peta UMKM Terdekat</h2>
              <p className="section-subtitle">Temukan UMKM di sekitar Anda</p>
            </div>
            <Link href="/peta" className="btn-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Lihat Peta Lengkap
            </Link>
          </div>

          <div className="mt-8">
            <HomeInteractiveMap />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  6 · CTA Section                                             */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 py-20 md:py-28 animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-[800px] rounded-full bg-gold-400/10 blur-3xl" />

        <div className="section-container relative z-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Dukung UMKM Desa,
            <br />
            Mulai Dari Belanja
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100/90">
            Setiap pembelian Anda membantu perekonomian desa dan keberlanjutan
            UMKM lokal.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/produk" className="btn-gold text-base px-8 py-4">
              Jelajahi Produk
            </Link>
            <Link
              href="/desa"
              className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 text-base px-8 py-4"
            >
              Lihat Desa
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProductCard({ produk }: { produk: Produk }) {
  const umkmName = produk.umkm?.nama ?? "UMKM";
  const desaName = produk.umkm?.desa?.nama_desa ?? "";

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="card group overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-primary-900/20">
        {produk.gambar ? (
          <Image
            src={produk.gambar}
            alt={produk.nama}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
          {produk.nama}
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
          {umkmName}
          {desaName ? ` · ${desaName}` : ""}
        </p>

        <p className="mt-auto pt-3 text-lg font-bold text-primary-700 dark:text-primary-400">
          {priceFormatter.format(produk.harga)}
        </p>
      </div>
    </Link>
  );
}

function DesaCard({
  desa,
  imageUrl,
}: {
  desa: DesaWithCount;
  imageUrl: string;
}) {
  const umkmCount =
    desa.umkm && desa.umkm.length > 0 ? desa.umkm[0].count : 0;

  return (
    <Link
      href={`/desa/${desa.id}`}
      className="card group overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-2xl">
        <Image
          src={imageUrl}
          alt={desa.nama_desa}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* UMKM count badge */}
        <div className="absolute bottom-3 left-3">
          <span className="badge-gold">
            {umkmCount} UMKM
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
          {desa.nama_desa}
        </h3>
        {desa.kabupaten && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {desa.kabupaten}
          </p>
        )}
      </div>
    </Link>
  );
}
