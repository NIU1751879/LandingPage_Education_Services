"use client";
import fotoprofesional from "@/assets/ProfesionaPicture.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import TrackedCTAButton from "@/components/TrackedCTAButton";

type HeroProps = {
  variant?: "tutoring" | "portfolio";
};

export const Hero = ({ variant = "tutoring" }: HeroProps) => {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const isPortfolio = variant === "portfolio";

  return (
    <section
      ref={heroRef}
      className="pt-8 pb-20 md:pt-5 md:pb-10 overflow-x-clip relative"
      style={{
        background:
          "radial-gradient(ellipse 200% 100% at bottom left, #183EC2, #EAEEFE 100%)",
      }}
    >
      <div className="container">
        <div className="md:flex items-center justify-between">
          <div className="md:w-[478px]">
            {isPortfolio ? (
              <>
                <p className="text-sm md:text-base font-semibold text-[#001738]/80 mt-2 tracking-wide uppercase">
                  {t("hero.portfolio.eyebrow")}
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-4 mt-3 leading-tight">
                  {t("hero.portfolio.headline")}{" "}
                  <span className="inline bg-blue-200 text-black px-0.5 py-0.5">
                    {t("hero.portfolio.highlight")}
                  </span>
                </h1>
                <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                  {t("hero.portfolio.bio")}
                </p>
                <div className="flex flex-wrap gap-3 items-center mt-[30px]">
                  <motion.a
                    href="#portfolio"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary transition-all duration-300"
                  >
                    {t("hero.portfolio.viewWork")}
                  </motion.a>
                  <motion.a
                    href="#contact"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-text flex gap-1 transition-all duration-300"
                  >
                    {t("hero.portfolio.getInTouch")}
                  </motion.a>
                </div>
                <Link
                  href="/services/tutoring"
                  className="inline-block mt-5 text-sm font-semibold text-[#001738] underline underline-offset-4 hover:text-[#002d6d]"
                >
                  {t("hero.portfolio.tutoringCta")}
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-lg md:text-xl font-bold text-black mt-2 tracking-wide">
                  {t("hero.soy")}
                </h2>
                <div className="lg:w-2/3 md:w-full">
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    {t("hero.titulo")}
                    <span className="inline bg-blue-200 text-black px-0.5 py-0.5">
                      {" "}
                      {t("hero.tusSueños")}
                    </span>
                  </h2>
                </div>
                <div className="flex gap-1 items-center mt-[30px]">
                  <TrackedCTAButton
                    href="#contacta"
                    className="btn btn-primary transition-all duration-300"
                  >
                    {t("hero.descubreAyuda")}
                  </TrackedCTAButton>
                  <motion.a
                    href="#pricing"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-text flex gap-1 transition-all duration-300"
                  >
                    <span>{t("hero.learnMore")}</span>
                  </motion.a>
                  <motion.a
                    href="https://wa.me/61416191284?text=Hi%20Jan!%20I%27m%20interested%20in%20your%20classes."
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-text flex gap-1 transition-all duration-300"
                  >
                    WhatsApp: +61 416 191 284
                  </motion.a>
                </div>
              </>
            )}
          </div>

          <div className="mt-20 md:mt-0 md:flex-1 flex justify-center md:justify-end relative">
            <motion.div
              style={{ translateY }}
              className="
                relative 
                p-4
                rounded-2xl 
                backdrop-blur-md
                bg-white/20 
                shadow-lg 
                border border-white/30
                max-w-[320px] 
                flex 
                justify-center
                items-center
              "
            >
              <motion.img
                src={fotoprofesional.src}
                width={630}
                height={630}
                alt="Jan Gómez Escobar"
                className="rounded-xl w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
