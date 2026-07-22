"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchIcon, MapPinIcon } from "@/components/Icons";

export function HeroSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/produk?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/produk");
    }
  };

  return (
    <form onSubmit={handleSearch} className="mt-8">
      <div className="relative flex w-full items-center overflow-hidden rounded-2xl bg-white/95 shadow-xl ring-1 ring-white/30">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari produk, desa, atau UMKM..."
          className="w-full border-0 bg-transparent py-4 pl-6 pr-4 text-gray-700 placeholder:text-gray-400 focus:outline-none text-base"
        />
        <button
          type="submit"
          className="mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-all hover:bg-primary-700 hover:scale-105"
          aria-label="Cari"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

const desaMarkers = [
  { id: "1", nama: "Desa Sukajaya", lat: -6.6189, lng: 106.5123, location: "Bogor, Jawa Barat" },
  { id: "2", nama: "Desa Tugu Utara", lat: -6.7023, lng: 106.9512, location: "Puncak Bogor, Jawa Barat" },
  { id: "3", nama: "Desa Penglipuran", lat: -8.4522, lng: 115.3524, location: "Bangli, Bali" },
  { id: "4", nama: "Desa Cibodas", lat: -6.8123, lng: 107.6512, location: "Lembang, Jawa Barat" },
  { id: "5", nama: "Desa Wisata Nglanggeran", lat: -7.8522, lng: 110.5123, location: "Gunungkidul, Yogyakarta" },
  { id: "6", nama: "Desa Margamulya", lat: -7.1623, lng: 107.5812, location: "Pangalengan, Jawa Barat" },
  { id: "7", nama: "Desa Tambi", lat: -7.2523, lng: 109.9212, location: "Wonosobo, Jawa Tengah" },
  { id: "8", nama: "Desa Ngadas", lat: -7.9822, lng: 112.9012, location: "Bromo, Jawa Timur" },
];

export function HomeInteractiveMap() {
  const [activeDesa, setActiveDesa] = useState(desaMarkers[0]);

  const mapSrc = `https://maps.google.com/maps?q=${activeDesa.lat},${activeDesa.lng}&z=11&output=embed`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List of Villages */}
      <div className="lg:col-span-1 space-y-2 max-h-[420px] overflow-y-auto pr-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Pilih Desa Mitra:
        </h4>
        {desaMarkers.map((desa) => (
          <button
            key={desa.id}
            onClick={() => setActiveDesa(desa)}
            className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-center justify-between ${
              activeDesa.id === desa.id
                ? "bg-primary-600 text-white border-primary-500 shadow-md scale-[1.02]"
                : "bg-white/80 dark:bg-primary-900/30 text-gray-800 dark:text-gray-200 border-gray-200/60 dark:border-primary-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/50"
            }`}
          >
            <div>
              <div className="font-bold text-sm">{desa.nama}</div>
              <div className={`text-xs flex items-center gap-1 mt-0.5 ${activeDesa.id === desa.id ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{desa.location}</span>
              </div>
            </div>
            {activeDesa.id === desa.id && (
              <span className="text-xs bg-gold-400 text-wood-950 font-bold px-2 py-0.5 rounded-full">
                Terpilih
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Embedded Google Maps */}
      <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-xl border border-primary-700/30 min-h-[380px] bg-primary-950">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "380px" }}
          allowFullScreen
          loading="lazy"
          title={`Peta Lokasi ${activeDesa.nama}`}
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between text-white text-xs">
          <div>
            <span className="font-bold text-gold-400 text-sm">{activeDesa.nama}</span>
            <span className="ml-2 text-gray-300">({activeDesa.location})</span>
          </div>
          <Link href="/peta" className="btn-gold py-1 px-3 text-[11px] rounded-xl font-bold">
            Buka Peta Lengkap →
          </Link>
        </div>
      </div>
    </div>
  );
}
