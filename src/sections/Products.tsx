"use client";

import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import { motion } from "framer-motion";
import { portfolioProjects, type Project } from "@/data/portfolio";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const productIds = ["abm-situational-morality", "geo-risk-tool"];
const products = portfolioProjects.filter(
  (project): project is Project & { repoUrl: string } =>
    productIds.includes(project.id) && project.repoUrl !== undefined,
);

export const Products = () => {
  const { t } = useLanguage();

  return (
    <section id="products" className="scroll-mt-32 bg-white py-24" aria-labelledby="products-heading">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-3xl text-center"
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          {t("productLab.showcase.eyebrow")}
        </p>
        <h2 id="products-heading" className="section-title text-3xl md:text-5xl">
          {t("productLab.showcase.title")}
        </h2>
        <p className="section-des mt-4">
          {t("productLab.showcase.subtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {products.map((product, index) => {
          const isMorality = product.id === "abm-situational-morality";
          const keyPrefix = isMorality ? "productLab.showcase.abm" : "productLab.showcase.geo";
          const features = t(`${keyPrefix}Features`).split("|");
          return (
          <motion.article
            key={product.id}
            id={`product-${product.id}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_7px_14px_#EAEAEA]"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <Image
                src={product.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-8">
              <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {t(`${keyPrefix}Type`)}
              </span>
              <h3 className="mt-4 text-2xl font-bold text-[#001738]">{isMorality ? "ABM Situational Morality" : "Geo Risk Tool"}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">{t(`${keyPrefix}Description`)}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${t("productLab.showcase.featuresLabel")} ${product.title}`}>
                {features.map((feature) => (
                  <li key={feature} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={product.id === "abm-situational-morality" ? "/labs?model=morality" : "/labs?model=geoalpha"}
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-[#001738]/15 px-4 py-2.5 font-medium text-[#001738] transition-colors hover:bg-slate-50"
              >
                {t("productLab.showcase.openLab")}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={product.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-[#001738] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#002d6d]"
              >
                <Github size={17} aria-hidden="true" />
                {t("productLab.showcase.repository")}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </motion.article>
          );
        })}
      </div>
    </div>
    </section>
  );
};
