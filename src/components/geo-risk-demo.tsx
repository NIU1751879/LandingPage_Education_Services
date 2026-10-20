"use client";

import { useState, type FormEvent } from "react";
import { Activity, LoaderCircle, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  GeoRiskResultsChart,
  type GeoRiskDistributions,
  type PortfolioChartRow as SimulationRow,
} from "@/components/interactive-simulation-charts";

function isScalar(value: unknown): value is string | number {
  return typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
}

function isNumericValue(value: unknown): boolean {
  return (
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
  );
}

function isSimulationRow(value: unknown): value is SimulationRow {
  if (!value || typeof value !== "object") return false;

  const row = value as Record<string, unknown>;
  return (
    isScalar(row.scenario) &&
    isNumericValue(row.horizon) &&
    isNumericValue(row.mean_pnl) &&
    isNumericValue(row.VaR95) &&
    isNumericValue(row.ES95)
  );
}

function isGeoRiskDistributions(value: unknown): value is GeoRiskDistributions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.values(value).every((scenario) => {
    if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) return false;
    return Object.values(scenario).every((distribution) => {
      if (!distribution || typeof distribution !== "object" || Array.isArray(distribution)) return false;
      const { grid, density } = distribution as Record<string, unknown>;
      return (
        Array.isArray(grid) &&
        Array.isArray(density) &&
        grid.length === density.length &&
        grid.every((item) => typeof item === "number" && Number.isFinite(item)) &&
        density.every((item) => typeof item === "number" && Number.isFinite(item))
      );
    });
  });
}

export function GeoRiskDemo() {
  const { t } = useLanguage();
  const [portfolioValue, setPortfolioValue] = useState("100000");
  const [horizonsInput, setHorizonsInput] = useState("1, 3");
  const [gprShock, setGprShock] = useState("1.5");
  const [simulations, setSimulations] = useState("1000");
  const [seed, setSeed] = useState("42");
  const [results, setResults] = useState<SimulationRow[]>([]);
  const [distributions, setDistributions] = useState<GeoRiskDistributions>({});
  const [selectedHorizon, setSelectedHorizon] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResults([]);
    setDistributions({});

    const apiUrl = process.env.NEXT_PUBLIC_GEO_RISK_API_URL?.replace(/\/+$/, "");
    if (!apiUrl) {
      setError(
        t("productLab.geo.notConfigured"),
      );
      return;
    }

    const horizonValues = horizonsInput.split(",").map((value) => Number(value.trim()));
    const horizons = horizonValues.filter((value) => Number.isFinite(value) && value > 0);

    if (horizons.length === 0 || horizons.length !== horizonValues.length) {
      setError(t("productLab.geo.invalidHorizons"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/geoalpha/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: Number(portfolioValue),
          horizons,
          gpr_shock: Number(gprShock),
          n_sim: Number(simulations),
          seed: Number(seed),
        }),
      });

      if (!response.ok) {
        throw new Error(
          t("productLab.geo.requestError").replace("{status}", String(response.status)),
        );
      }

      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("table" in payload) ||
        !Array.isArray(payload.table) || !payload.table.every(isSimulationRow)) {
        throw new Error(t("productLab.geo.invalidFormat"));
      }

      setResults(payload.table);
      if ("distributions" in payload && isGeoRiskDistributions(payload.distributions)) {
        setDistributions(payload.distributions);
      }
      if (payload.table.length === 0) {
        setError(t("productLab.geo.noResults"));
      }
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? t("productLab.geo.connectionError")
          : requestError instanceof SyntaxError
            ? t("productLab.geo.invalidResponse")
            : requestError instanceof Error
              ? requestError.message
              : t("productLab.geo.genericError"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      id="geo-risk"
      className="scroll-mt-32 bg-[#080D18] py-24 text-white"
      aria-labelledby="geo-risk-heading"
    >
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8B9BFF]">
            {t("productLab.geo.lab")}
          </p>
          <h2 id="geo-risk-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
            {t("productLab.geo.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            {t("productLab.geo.subtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-[#101827] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
                <Activity className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-white">{t("productLab.geo.parameters")}</h3>
                <p className="text-sm text-slate-400">{t("productLab.geo.parametersHelp")}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-200 sm:col-span-2">
                {t("productLab.geo.portfolio")}
                <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#0B1220] focus-within:border-indigo-400">
                  <span className="flex items-center border-r border-white/10 px-3 text-slate-400">$</span>
                  <input
                    required
                    min="1"
                    step="any"
                    type="number"
                    value={portfolioValue}
                    onChange={(event) => setPortfolioValue(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-white outline-none"
                    aria-label={t("productLab.geo.portfolioAria")}
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                {t("productLab.geo.horizons")}
                <input
                  required
                  type="text"
                  value={horizonsInput}
                  onChange={(event) => setHorizonsInput(event.target.value)}
                  placeholder="1, 3"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-indigo-400"
                  aria-describedby="horizons-help"
                />
                <span id="horizons-help" className="block text-xs font-normal text-slate-500">
                  {t("productLab.geo.horizonsHelp")}
                </span>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                {t("productLab.geo.shock")}
                <input
                  required
                  min="0"
                  step="any"
                  type="number"
                  value={gprShock}
                  onChange={(event) => setGprShock(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-indigo-400"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                {t("productLab.geo.simulations")}
                <input
                  required
                  min="1"
                  step="1"
                  type="number"
                  value={simulations}
                  onChange={(event) => setSimulations(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-indigo-400"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                {t("productLab.geo.seed")}
                <input
                  required
                  min="0"
                  step="1"
                  type="number"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none transition focus:border-indigo-400"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-400 px-5 py-3.5 font-semibold text-[#080D18] transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                  {t("productLab.geo.running")}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {t("productLab.geo.run")}
                </>
              )}
            </button>
          </form>

          <div className="min-w-0 rounded-3xl border border-white/10 bg-[#101827] p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{t("productLab.geo.results")}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {t("productLab.geo.resultsSubtitle")}
                </p>
              </div>
              {results.length > 0 && (
                <span className="shrink-0 rounded-full border border-indigo-300/20 bg-indigo-300/10 px-3 py-1 text-xs font-medium text-indigo-200">
                  {results.length} {results.length === 1 ? t("productLab.geo.result") : t("productLab.geo.resultsPlural")}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center text-slate-300" role="status">
                <LoaderCircle className="h-8 w-8 animate-spin text-indigo-300" aria-hidden="true" />
                <p>{t("productLab.geo.wait")}</p>
              </div>
            ) : results.length > 0 ? (
              <GeoRiskResultsChart
                rows={results}
                distributions={distributions}
                horizon={selectedHorizon}
                onHorizonChange={setSelectedHorizon}
              />
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                  <Activity className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="font-medium text-slate-200">{t("productLab.geo.emptyTitle")}</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                  {t("productLab.geo.emptyDescription")}
                </p>
              </div>
            )}
          </div>
        </div>
        <details className="mx-auto mt-8 max-w-6xl rounded-2xl border border-white/10 bg-[#101827] p-5 text-sm leading-relaxed text-slate-300 sm:p-6">
          <summary className="cursor-pointer font-semibold text-indigo-200">{t("productLab.geo.aboutTitle")}</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <p>
              {t("productLab.geo.aboutGpr")}
            </p>
            <p>
              {t("productLab.geo.aboutRisk")}
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
