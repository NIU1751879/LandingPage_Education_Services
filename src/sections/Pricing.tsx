"use client";
import Image from "next/image";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useLanguage } from "@/contexts/LanguageContext";

import methodologyImg from "@/assets/gorro_graduacion.png";
import resultsImg from "@/assets/trophy-front-color.png";
import softwareImg from "@/assets/cog.png";
import TrackedCTAButton from "@/components/TrackedCTAButton";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RoadmapIcon = () => (
  <svg
    viewBox="0 0 128 128"
    aria-hidden="true"
    className="w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="roadmap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0F4C81" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <circle cx="64" cy="64" r="58" fill="url(#roadmap-gradient)" />
    <circle cx="64" cy="64" r="38" fill="#FFFFFF" opacity="0.95" />
    <path d="M64 30L72 56L98 64L72 72L64 98L56 72L30 64L56 56Z" fill="#0F4C81" />
    <circle cx="64" cy="64" r="8" fill="#3B82F6" />
    <path d="M87 41L76 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const Pricing = () => {
  const { t } = useLanguage();
  const [userScore, setUserScore] = useState(6);
  const averageImprovement = 0.422;

  const projectedScore = () => {
    const b = 0.35;
    const t = userScore === 0 ? 0.1 : userScore;
    let newScore = 10 * Math.pow(t / 10, b);
    if (newScore > 10) newScore = 10;
    return parseFloat(newScore.toFixed(2));
  };

  const data = {
    labels: ["Tiempo 0", "Tiempo 1"],
    datasets: [
      {
        label: t("pricing.tuNotaActual"),
        data: [userScore, userScore],
        borderColor: "#F87171",
        backgroundColor: "#F87171",
        tension: 0.3,
      },
      {
        label: t("pricing.notaProyectadaMetodologia"),
        data: [userScore, projectedScore()],
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: t("pricing.proyeccionNota") },
    },
    scales: { y: { beginAtZero: true, max: 10 } },
  };

  // Construir el texto de metodología con el enlace en "probada"
  const metodologiaText = () => {
    const baseText = t("pricing.metodologia.texto");
    const probadaText = t("pricing.metodologia.probada");
    // Enlace "probada" al documento de fuentes (PDF)
    const pdfUrl = "/Multiple_Bibliographies_study_techniques.pdf";
    const linkHtml = `<a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" class="text-[#3B82F6] font-semibold underline hover:text-blue-700">${probadaText}</a>`;
    
    // Buscar y reemplazar la palabra "probada" en el texto (case-insensitive)
    const regex = new RegExp(`\\b${probadaText}\\b`, 'gi');
    return baseText.replace(regex, linkHtml);
  };

  const helpBoxes = [
    {
      title: t("pricing.roadmap.title"),
      description: t("pricing.roadmap.description"),
      roadmapItems: [
        {
          title: t("pricing.roadmap.item1.title"),
          text: t("pricing.roadmap.item1.text"),
        },
        {
          title: t("pricing.roadmap.item2.title"),
          text: t("pricing.roadmap.item2.text"),
        },
        {
          title: t("pricing.roadmap.item3.title"),
          text: t("pricing.roadmap.item3.text"),
        },
      ],
      button: null,
    },
    {
      image: methodologyImg,
      title: t("pricing.metodologia.titulo"),
      text: metodologiaText(),
      button: null,
    },
    {
      image: resultsImg,
      title: t("pricing.adaptabilidad.titulo"),
      text: t("pricing.adaptabilidad.texto"),
      button: null,
      isScoreBox: true,
    },
    {
      image: softwareImg,
      imageSrc: "/images/logo-tutortrack.png",
      imageAlt: "TutorTrack",
      title: t("pricing.softwarePersonalizado.titulo"),
      text: t("pricing.softwarePersonalizado.texto"),
      button: null,
      featured: true, // <--- Nueva bandera para identificarlo
      customClass: "scale-200 z-10 shadow-xl border-2 border-blue-500" // Ejemplo de énfasis
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-28 py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#001738]">
          {t("pricing.titulo")}
        </h2>

        <div className="flex flex-col gap-12 md:gap-16">
          {helpBoxes.map(({ image, imageSrc, imageAlt, title, text, description, roadmapItems, button, isScoreBox }, index) => {
            const isReversed = index % 2 === 1;
            const imgAlt = imageAlt ?? title;
            const isRoadmapBox = index === 0;

            return (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center bg-[#f3f5f8] p-8 md:p-10 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 ${
                  isReversed ? "md:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`relative flex-shrink-0 mb-6 md:mb-0 ${
                    index === 0 ? "w-32 h-32 md:mr-12" : "w-48 h-48 md:mx-8"
                  }`}
                >
                  {isRoadmapBox ? (
                    <RoadmapIcon />
                  ) : imageSrc ? (
                    <Image src={imageSrc} alt={imgAlt} fill className="object-contain rounded-xl" />
                  ) : image ? (
                    <Image src={image} alt={title} className="w-full h-full object-contain rounded-xl" />
                  ) : null}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-[#001738]">{title}</h3>
                  {isRoadmapBox ? (
                    <>
                      <p
                        className="text-gray-700 text-base md:text-lg leading-relaxed mb-6"
                        dangerouslySetInnerHTML={{ __html: description ?? "" }}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
                        {roadmapItems?.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
                          >
                            <h4
                              className="text-base md:text-lg font-semibold text-[#001738] mb-2"
                              dangerouslySetInnerHTML={{ __html: item.title }}
                            />
                            <p
                              className="text-sm md:text-base text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: item.text }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p
                      className="text-gray-700 text-base md:text-lg leading-relaxed mb-6"
                      dangerouslySetInnerHTML={{ __html: text ?? "" }}
                    />
                  )}

                  {isScoreBox && (
                    <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                      <div className="flex flex-col mb-4 md:mb-0">
                        <label className="font-semibold mb-2">{t("pricing.notaActual")}</label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          value={userScore}
                          onChange={(e) => setUserScore(parseFloat(e.target.value))}
                          className="border rounded px-3 py-1 w-24"
                        />
                        <p className="mt-2">
                          {t("pricing.notaProyectadaTexto")} <strong>{projectedScore()}</strong> / 10
                        </p>
                        <p className="text-sm text-gray-500 italic mt-1">
                          {t("pricing.aproximacion")}
                        </p>
                      </div>

                      <div className="flex-1 max-w-md">
                        <Line data={data} options={options} />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <TrackedCTAButton
            href="#contacta"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#001738] bg-transparent px-6 py-3 text-base font-semibold text-[#001738] transition-all duration-300 hover:bg-[#001738] hover:text-white"
          >
            {t("pricing.ctaReserva")}
          </TrackedCTAButton>
        </div>
      </div>
    </section>
  );
};
