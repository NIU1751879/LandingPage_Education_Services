"use client";

import { CallToAction } from "@/sections/CallToAction";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import SobreMi from "@/sections/AboutMe";
import { Services } from "@/sections/Services";
import { Portfolio } from "@/sections/Portfolio";
import { TechStack } from "@/sections/TechStack";
import fotoprofesional from "@/assets/ProfesionaPicture.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

function HeroWithContactActions() {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [80, -80]);

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
                href="tel:+61416191284"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-text flex gap-1 transition-all duration-300"
              >
                Call me
              </motion.a>
              <motion.a
                href="https://wa.me/61416191284?text=Hi%20Jan!%20I%20found%20your%20site%20and%20I'm%20interested%20in%20working%20together.%20Could%20we%20talk%3F"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-text flex gap-1 transition-all duration-300"
              >
                WhatsApp me
              </motion.a>
            </div>
            <Link
              href="/services/tutoring"
              className="inline-block mt-5 text-sm font-semibold text-[#001738] underline underline-offset-4 hover:text-[#002d6d]"
            >
              {t("hero.portfolio.tutoringCta")}
            </Link>
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
}

export default function ContactV2Page() {
  return (
    <div>
      <Header />
      <HeroWithContactActions />
      <SobreMi compact />
      <Services />
      <Portfolio />
      <TechStack />
      <CallToAction />
      <Footer />
    </div>
  );
}
