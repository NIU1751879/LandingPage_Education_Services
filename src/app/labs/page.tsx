"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import { GeoRiskDemo } from "@/components/geo-risk-demo";
import { MoralityLab } from "@/components/morality-lab";

type Lab = "morality" | "geoalpha";

export default function LabsPage() {
  const [selectedLab, setSelectedLab] = useState<Lab>("morality");

  useEffect(() => {
    const model = new URLSearchParams(window.location.search).get("model");
    if (model === "morality" || model === "geoalpha") setSelectedLab(model);
  }, []);

  function selectLab(lab: Lab) {
    setSelectedLab(lab);
    const url = new URL(window.location.href);
    url.searchParams.set("model", lab);
    window.history.replaceState(null, "", url);
  }

  return (
    <main className="min-h-screen bg-[#080D18]">
      <Header />
      <section className="bg-[#080D18] px-4 pt-10 text-white sm:pt-14">
        <div className="container">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Interactive research tools</p>
          <nav className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2" aria-label="Select simulation lab">
            <button
              type="button"
              onClick={() => selectLab("morality")}
              aria-pressed={selectedLab === "morality"}
              className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${selectedLab === "morality" ? "border-emerald-300 bg-emerald-300 text-[#07111c]" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
            >
              Situational Morality Lab
            </button>
            <button
              type="button"
              onClick={() => selectLab("geoalpha")}
              aria-pressed={selectedLab === "geoalpha"}
              className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${selectedLab === "geoalpha" ? "border-indigo-300 bg-indigo-300 text-[#07111c]" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
            >
              Geo-Risk Lab / Geo-Alpha
            </button>
          </nav>
        </div>
      </section>
      <div aria-live="polite">
        {selectedLab === "morality" ? <MoralityLab /> : <GeoRiskDemo />}
      </div>
      <Footer />
    </main>
  );
}
