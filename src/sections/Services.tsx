"use client";

import Link from "next/link";
import { Code2, GraduationCap, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { services } from "@/data/services";

export const Services = () => {
  const { t } = useLanguage();

  const icons = {
    code: Code2,
    sparkles: Sparkles,
    graduation: GraduationCap,
  } as const;

  return (
    <section id="services" className="scroll-mt-32 py-24 bg-white">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="section-title text-3xl md:text-5xl">{t("services.title")}</h2>
          <p className="section-des mt-4">{t("services.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = icons[service.icon];
            return (
              <article
                key={service.id}
                className="rounded-3xl border border-[#F1F1F1] bg-[#EAEEFE]/40 p-8 shadow-[0_7px_14px_#EAEAEA] flex flex-col"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#001738] text-white flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-[#001738] mb-3">
                  {t(`services.${service.translationKey}.title`)}
                </h3>
                <p className="text-gray-700 leading-relaxed flex-1">
                  {t(`services.${service.translationKey}.text`)}
                </p>
                {service.href && service.ctaTranslationKey && (
                  <Link
                    href={service.href}
                    className="mt-6 inline-flex font-semibold text-[#3B82F6] hover:text-blue-700"
                  >
                    {t(`services.${service.ctaTranslationKey}`)}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
