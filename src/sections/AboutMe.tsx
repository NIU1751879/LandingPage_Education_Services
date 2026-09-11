"use client";

import Image from "next/image";
import Link from "next/link";
import Speechpicture from "@/assets/Speech.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SobreMi({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      className={`scroll-mt-32 bg-[#e8ebef] px-6 ${
        compact ? "py-12" : "py-24"
      }`}
    >
      <div className="container mx-auto">
        <h2
          className={`text-3xl md:text-4xl font-bold text-black text-center ${
            compact ? "mb-8" : "mb-12"
          }`}
        >
          {t("aboutMe.summary.title")}
        </h2>
        <div
          className={`flex flex-col md:flex-row items-center max-w-5xl mx-auto ${
            compact ? "gap-8" : "gap-12"
          }`}
        >
          <Image
            src={Speechpicture}
            alt={t("aboutMe.summary.title")}
            className="w-full max-w-sm h-auto rounded-2xl shadow-lg"
            priority
          />
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-md w-full">
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              {t("aboutMe.summary.text")}
            </p>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              {t("aboutMe.summary.interests")}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center font-semibold text-[#001738] underline underline-offset-4 hover:text-[#002d6d]"
            >
              {t("aboutMe.summary.readMore")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}