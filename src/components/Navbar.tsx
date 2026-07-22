"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { LogoIcon, SearchIcon, CartIcon, SunIcon, MoonIcon, UserIcon } from "@/components/Icons";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  const userInitial = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 dark:bg-[#1a2e1a]/80 backdrop-blur-md shadow-md border-b border-gray-100 dark:border-[#2d4a2d]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold text-gradient">
            <LogoIcon className="w-8 h-8" />
            <span>PasarNusa</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors">Beranda</Link>
            <Link href="/produk" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors">Produk</Link>
            <Link href="/desa" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors">Desa</Link>
            <Link href="/umkm" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors">UMKM</Link>
          </div>

          {/* Right Menu Icons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/produk" aria-label="Cari Produk" className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors">
              <SearchIcon className="w-5 h-5" />
            </Link>

            {/* Cart Icon */}
            <Link href="/keranjang" aria-label="Keranjang" className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors">
              <CartIcon className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-wood-900 text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Mode"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors"
            >
              {darkMode ? <SunIcon className="w-5 h-5 text-gold-400" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">{userInitial}</div>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a2e1a] border border-gray-100 dark:border-[#2d4a2d] rounded-xl shadow-lg py-1 z-50">
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20">Data Diri</Link>
                    <Link href="/faq" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20">FAQ</Link>
                    {user.user_metadata?.role === "admin" && (
                      <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm font-semibold text-gold-600 dark:text-gold-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">Dashboard Admin</Link>
                    )}
                    <hr className="my-1 border-gray-100 dark:border-[#2d4a2d]" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">Keluar</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-xs py-2 px-4 rounded-xl">
                Masuk
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Dark Mode Icon */}
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors" aria-label="Toggle dark mode">
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile Cart Icon */}
            <Link href="/keranjang" className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-wood-900 text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-gray-600 dark:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#1a2e1a] border-b border-gray-100 dark:border-[#2d4a2d] px-4 pt-2 pb-4 space-y-1">
          <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Beranda</Link>
          <Link href="/produk" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Produk</Link>
          <Link href="/desa" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Desa</Link>
          <Link href="/umkm" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">UMKM</Link>
          <hr className="my-2 border-gray-100 dark:border-[#2d4a2d]" />
          <Link href="/faq" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">FAQ</Link>
          {user ? (
            <>
              <Link href="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Data Diri</Link>
              {user.user_metadata?.role === "admin" && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-gold-600 dark:text-gold-400">Dashboard Admin</Link>
              )}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-semibold text-red-600">Keluar</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-center rounded-xl btn-primary text-sm">
              Masuk
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
