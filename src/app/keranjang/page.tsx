"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

function IconTrash({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function IconMinus({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function IconPlus({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconCart({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function IconWhatsapp({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function KeranjangPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart();

  // Group items by UMKM for multi-seller checkout
  const groupedByUmkm = items.reduce((acc, item) => {
    const key = item.umkmNama;
    if (!acc[key]) {
      acc[key] = { noHp: item.umkmNoHp, items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { noHp: string; items: typeof items }>);

  const handleCheckoutAll = () => {
    // Build one WhatsApp message per seller
    Object.entries(groupedByUmkm).forEach(([umkmNama, { noHp, items: sellerItems }]) => {
      const itemLines = sellerItems
        .map((it, i) => `${i + 1}. ${it.nama} (${it.qty} ${it.satuan || 'pcs'}) = ${formatRupiah(it.harga * it.qty)}`)
        .join("\n");
      const sellerTotal = sellerItems.reduce((s, it) => s + it.harga * it.qty, 0);

      const message = `Halo ${umkmNama}, saya ingin memesan produk dari PasarNusa:\n\n${itemLines}\n\nTotal: ${formatRupiah(sellerTotal)}\n\nMohon informasi ketersediaan dan ongkos kirimnya. Terima kasih!`;
      window.open(`https://wa.me/${noHp}?text=${encodeURIComponent(message)}`, "_blank");
    });
  };

  return (
    <div className="section-container py-8">
      {/* Back Button & Title */}
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
          <span className="text-gray-900 dark:text-white font-semibold">Keranjang</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <IconCart className="w-7 h-7 text-primary-600 dark:text-primary-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
          Keranjang Belanja
        </h1>
        {totalItems > 0 && (
          <span className="badge-gold text-xs">{totalItems} item</span>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center mx-auto mb-6">
            <IconCart className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Keranjang Kosong</h2>
          <p className="text-gray-500 text-sm mb-6">
            Belum ada produk di keranjang. Yuk jelajahi produk UMKM desa!
          </p>
          <Link href="/produk" className="btn-primary inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4 items-start">
                {/* Thumbnail */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-primary-800">
                  <Image
                    src={item.gambar}
                    alt={item.nama}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <Link href={`/produk/${item.id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1">
                    {item.nama}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.umkmNama}</p>
                  <p className="text-primary-700 dark:text-primary-400 font-bold mt-1">
                    {formatRupiah(item.harga)}
                    {item.satuan && <span className="text-xs text-gray-500 font-normal"> / {item.satuan}</span>}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 dark:border-primary-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <IconMinus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white min-w-[2rem] text-center border-x border-gray-200 dark:border-primary-800">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <IconPlus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Hapus item"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-gray-400">Subtotal</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatRupiah(item.harga * item.qty)}</p>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1.5 mt-2"
            >
              <IconTrash className="w-4 h-4" />
              Kosongkan Keranjang
            </button>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Ringkasan Pesanan</h3>

              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="truncate mr-2">{item.nama} x{item.qty}</span>
                    <span className="shrink-0 font-medium">{formatRupiah(item.harga * item.qty)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 dark:border-primary-800" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-xl text-primary-700 dark:text-primary-400">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              {/* Checkout Info */}
              <div className="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-xl p-4 text-xs text-primary-800 dark:text-primary-200 leading-relaxed">
                <p className="font-semibold mb-1">Pemesanan via WhatsApp</p>
                <p>Pesanan akan dikirim langsung ke masing-masing penjual UMKM melalui WhatsApp untuk konfirmasi ketersediaan dan pengiriman.</p>
              </div>

              <button
                onClick={handleCheckoutAll}
                className="btn-gold w-full py-3 text-base font-bold flex items-center justify-center gap-2"
              >
                <IconWhatsapp className="w-5 h-5 text-wood-900" />
                Pesan via WhatsApp
              </button>

              <Link href="/produk" className="btn-secondary w-full text-center text-sm py-2.5 block">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
