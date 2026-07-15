import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary-950 to-primary-900 text-white pt-16 pb-8 border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <span className="flex items-center gap-2 font-display text-2xl font-bold text-gradient-gold">
              <span>🌾</span> Pasar Desa
            </span>
            <p className="text-primary-100 text-sm leading-relaxed">
              Platform terpercaya menghubungkan Anda langsung dengan produk-produk asli karya UMKM dan desa di seluruh penjuru Indonesia.
            </p>
            <p className="text-gold-400 font-bold text-sm italic">
              "Belanja Lokal, Bangun Desa."
            </p>
          </div>

          {/* Quick Menu */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold-300">Menu</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><Link href="/" className="hover:text-gold-400 transition-colors">Beranda</Link></li>
              <li><Link href="/produk" className="hover:text-gold-400 transition-colors">Semua Produk</Link></li>
              <li><Link href="/desa" className="hover:text-gold-400 transition-colors">Daftar Desa</Link></li>
              <li><Link href="/umkm" className="hover:text-gold-400 transition-colors">Daftar UMKM</Link></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold-300">Bantuan</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><Link href="/faq" className="hover:text-gold-400 transition-colors">FAQ / Panduan</Link></li>
              <li><Link href="/kebijakan" className="hover:text-gold-400 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat" className="hover:text-gold-400 transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold-300">Hubungi Kami</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li className="flex items-center gap-2">
                <span>📧</span> pasardesa@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span> +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Desa Wisata Indonesia
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-primary-800 my-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-primary-300 gap-4">
          <p>© 2024 Pasar Desa Digital. Semua hak dilindungi.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-gold-400">🌐 Instagram</span>
            <span className="cursor-pointer hover:text-gold-400">📘 Facebook</span>
            <span className="cursor-pointer hover:text-gold-400">🐦 Twitter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}