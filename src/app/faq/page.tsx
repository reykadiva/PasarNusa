"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                          */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: "Apa itu PasarNusa?",
    a: "PasarNusa adalah platform digital yang dikembangkan untuk menghubungkan produk-produk asli buatan UMKM lokal dan desa wisata di seluruh Indonesia secara langsung dengan konsumen, guna memajukan perekonomian desa."
  },
  {
    q: "Bagaimana cara memesan produk di PasarNusa?",
    a: "Cari produk yang Anda inginkan di halaman katalog Produk, masukkan ke dalam keranjang, lalu pilih 'Pesan via WhatsApp'. Pesanan Anda akan dikompilasikan dan diteruskan secara otomatis ke admin pusat / penjual terkait."
  },
  {
    q: "Berapa biaya pengiriman dan metode pembayarannya?",
    a: "Biaya pengiriman ditentukan berdasarkan lokasi desa asal produk dan lokasi pengiriman Anda. Metode pembayaran, pengiriman, dan ongkos kirim akan dikoordinasikan langsung melalui chat WhatsApp saat Anda melakukan checkout."
  },
  {
    q: "Bagaimana cara mendaftarkan desa atau UMKM saya?",
    a: "Untuk mendaftarkan desa wisata atau produk UMKM baru di platform PasarNusa, silakan hubungi admin kami melalui nomor WhatsApp (+62 852-6790-0655) dengan menyertakan detail legalitas usaha dan produk Anda."
  },
  {
    q: "Apa itu fitur Story QR?",
    a: "Story QR adalah QR Code unik pada setiap kemasan produk PasarNusa. Saat dipindai, pembeli akan diarahkan ke halaman cerita interaktif mengenai kisah di balik pembuatan produk, profil petani/pengrajin, asal-usul geografis, dan habitat bahan baku produk tersebut."
  }
];

export default function FAQPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="section-container py-8 max-w-3xl">
      {/* Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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
          <span className="text-gray-900 dark:text-white font-semibold">FAQ</span>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-display mb-3">
          Pertanyaan Umum (FAQ)
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-lg mx-auto">
          Temukan jawaban atas pertanyaan umum mengenai penggunaan platform digital PasarNusa.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div
              key={index}
              className="card overflow-hidden transition-all duration-300 border border-gray-100 dark:border-primary-800/50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left text-gray-900 dark:text-white font-bold hover:bg-primary-50/20 transition-colors"
              >
                <span>{faq.q}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className={`w-4 h-4 text-primary-600 dark:text-primary-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-[300px] border-t border-gray-100 dark:border-primary-800/50" : "max-h-0"
                }`}
              >
                <div className="p-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-primary-950/20">
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
