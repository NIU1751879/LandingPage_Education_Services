"use client";
import Logo from "@/assets/firma.jpeg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { href: "/about", key: "header.about" },
  { href: "/projects", key: "header.portfolio" },
  { href: "/writing", key: "header.writing" },
  { href: "/services/tutoring", key: "header.tutoring" },
] as const;

export const Header = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const contactHref = pathname === "/" ? "#contact" : "/#contact";

  return (
    <header className="sticky top-0 backdrop-blur-sm z-20 bg-white shadow-sm">
      <div className="flex justify-between items-center py-2 px-6 bg-gray-100 text-black text-sm">
        <LanguageSelector />
        <p className="font-medium">Jan Gómez Escobar</p>
      </div>

      <div className="py-5">
        <div className="container flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href="/">
              <Image src={Logo} alt="Logo Jan Gómez Escobar" height={80} width={80} />
            </Link>
          </motion.div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -m-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label={t("header.menu")}
            aria-expanded={mobileMenuOpen}
          >
            <Image
              src="/images/menu.svg"
              alt={t("header.menu")}
              width={20}
              height={20}
              className="h-5 w-5"
            />
          </button>

          <nav className="hidden md:flex gap-6 items-center">
            {NAV_ITEMS.map((item) => (
              <motion.div key={item.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={item.href}
                  className="text-black/80 hover:text-black font-medium transition-colors"
                >
                  {t(item.key)}
                </Link>
              </motion.div>
            ))}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 text-black/80 font-medium transition-colors hover:text-black [&::-webkit-details-marker]:hidden">
                {t("header.products")}
                <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="absolute right-0 top-full z-30 mt-3 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <Link
                  href="/labs?model=morality"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#001738]"
                >
                  ABM Situational Morality
                </Link>
                <Link
                  href="/labs?model=geoalpha"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#001738]"
                >
                  Geo Risk Tool
                </Link>
              </div>
            </details>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={contactHref}
                className="bg-[#001738] text-white px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1 transition-all duration-300 hover:bg-[#002d6d] shadow-md hover:shadow-lg"
              >
                <span>{t("header.contact")}</span>
                <Image
                  src="/images/arrow-right.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 inline-flex"
                />
              </Link>
            </motion.div>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-full max-w-sm bg-white shadow-xl md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <span className="font-medium text-black">{t("header.menu")}</span>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={t("header.closeMenu")}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="py-3 px-4 text-black/80 hover:text-black font-medium rounded-lg hover:bg-gray-100"
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <details className="group rounded-lg">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-3 font-medium text-black/80 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
                    {t("header.products")}
                    <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="ml-3 flex flex-col border-l border-gray-200 pl-3">
                    <Link
                      href="/labs?model=morality"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-2.5 text-sm text-black/70 hover:bg-gray-100"
                    >
                      ABM Situational Morality
                    </Link>
                    <Link
                      href="/labs?model=geoalpha"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-3 py-2.5 text-sm text-black/70 hover:bg-gray-100"
                    >
                      Geo Risk Tool
                    </Link>
                  </div>
                </details>
                <Link
                  href={contactHref}
                  onClick={closeMobileMenu}
                  className="mt-2 py-3 px-4 bg-[#001738] text-white rounded-lg font-medium text-center inline-flex items-center justify-center gap-1 hover:bg-[#002d6d]"
                >
                  <span>{t("header.contact")}</span>
                  <Image src="/images/arrow-right.svg" alt="" width={16} height={16} className="h-4 w-4" />
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
