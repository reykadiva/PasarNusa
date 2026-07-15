import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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
  gambar_url: string | null;
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

const categories = [
  { emoji: "🌾", name: "Pertanian" },
  { emoji: "☕", name: "Kopi" },
  { emoji: "🍯", name: "Madu" },
  { emoji: "🧺", name: "Kerajinan" },
  { emoji: "🥬", name: "Sayuran" },
  { emoji: "🥜", name: "Snack" },
] as const;

const desaImages = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=60",
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
    .limit(4);

  const desaList = (desaData ?? []) as unknown as DesaWithCount[];

  return (
    <main className="min-h-screen">
      {/* ============================================================ */}
      {/*  1 · Hero Section                                            */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-hero-pattern">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-gold-400/10 blur-3xl" />

        <div className="section-container relative z-10 flex flex-col items-center gap-12 py-20 md:py-28 lg:flex-row lg:gap-16">
          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left animate-fade-in-up">
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Belanja Lokal,
              <br />
              <span className="text-gradient-gold bg-clip-text text-transparent bg-gradient-to-r from-gold-300 to-gold-500">
                Bangun Desa.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-primary-100/90 mx-auto lg:mx-0">
              Temukan produk terbaik dari UMKM dan desa di seluruh Indonesia.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex max-w-xl mx-auto lg:mx-0">
              <div className="relative flex w-full items-center overflow-hidden rounded-full bg-white shadow-lg">
                <input
                  type="text"
                  placeholder="Cari produk, desa, atau UMKM..."
                  className="w-full border-0 bg-transparent py-4 pl-6 pr-4 text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700"
                  aria-label="Cari"
                >
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
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right — hero image */}
          <div className="flex-1 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=60"
                alt="Pemandangan sawah Indonesia"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent" />
            </div>
          </div>
        </div>
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

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/produk?kategori=${encodeURIComponent(cat.name)}`}
                className="card group flex flex-col items-center gap-3 p-6 text-center cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  {cat.emoji}
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {cat.name}
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
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

          {/* Map placeholder */}
          <div className="mt-8 flex h-[400px] items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10 border border-primary-200/50 dark:border-primary-800/30">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-200/60 dark:bg-primary-800/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary-600 dark:text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
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
              </div>
              <p className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                Peta interaktif akan ditampilkan di sini
              </p>
              <p className="mt-1 text-sm text-primary-500/70 dark:text-primary-400/60">
                Segera hadir dengan Leaflet.js
              </p>
            </div>
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
        {produk.gambar_url ? (
          <Image
            src={produk.gambar_url}
            alt={produk.nama}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🛒
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
