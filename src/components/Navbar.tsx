"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${isScrolled ? "bg-white/80 dark:bg-[#1a2e1a]/80 backdrop-blur-md shadow-md border-b border-gray-100 dark:border-[#2d4a2d]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-gradient">
            <span>??</span> PasarNusa
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
            <Link href="/produk" className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors">
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

            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-primary-900/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">U</div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a2e1a] border border-gray-100 dark:border-[#2d4a2d] rounded-xl shadow-lg py-1 z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20">Data Diri</Link>
                  <Link href="/faq" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20">FAQ</Link>
                  <hr className="my-1 border-gray-100 dark:border-[#2d4a2d]" />
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">Keluar</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-gray-600 dark:text-gray-300">
              {darkMode ? "??" : "??"}
            </button>
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
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Beranda</Link>
          <Link href="/produk" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Produk</Link>
          <Link href="/desa" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Desa</Link>
          <Link href="/umkm" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">UMKM</Link>
          <hr className="my-2 border-gray-100 dark:border-[#2d4a2d]" />
          <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">Data Diri</Link>
          <Link href="/faq" className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 dark:text-gray-300">FAQ</Link>
          <button className="w-full text-left px-3 py-2 rounded-md text-base font-semibold text-red-600">Keluar</button>
        </div>
      )}
    </nav>
  );
}
