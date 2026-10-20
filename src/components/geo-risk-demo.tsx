"use client";

import { useState, type FormEvent } from "react";
import { Activity, LoaderCircle, Play } from "lucide-react";

type SimulationRow = {
  scenario: string | number;
  horizon: string | number;
  mean_pnl: number | string;
  VaR95: number | string;
  ES95: number | string;
};

function isSimulationRow(value: unknown): value is SimulationRow {
  if (!value || typeof value !== "object") return false;

  const row = value as Record<string, unknown>;
  return (
    "scenario" in row &&
    "horizon" in row &&
    "mean_pnl" in row &&
    "VaR95" in row &&
    "ES95" in row
  );
}

function formatMetric(value: number | string) {
  const numericValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(numericValue)
    ? new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(numericValue)
    : String(value);
}

export function GeoRiskDemo() {
  const [portfolioValue, setPortfolioValue] = useState("100000");
  const [horizonsInput, setHorizonsInput] = useState("1, 3");
  const [gprShock, setGprShock] = useState("1.5");
  const [simulations, setSimulations] = useState("1000");
  const [seed, setSeed] = useState("42");
  const [results, setResults] = useState<SimulationRow[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResults([]);

    const apiUrl = process.env.NEXT_PUBLIC_GEO_RISK_API_URL?.replace(/\/+$/, "");
    if (!apiUrl) {
      setError("The simulator API is not configured. Please try again later.");
      return;
    }

    const horizonValues = horizonsInput.split(",").map((value) => Number(value.trim()));
    const horizons = horizonValues.filter((value) => Number.isFinite(value) && value > 0);

    if (horizons.length === 0 || horizons.length !== horizonValues.length) {
      setError("Enter one or more positive horizons, separated by commas.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/geoalpha/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_value: Number(portfolioValue),
          horizons,
          gpr_shock_multiplier: Number(gprShock),
          n_simulations: Number(simulations),
          seed: Number(seed),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `The simulator returned an error (${response.status}). Please try again.`,
        );
      }

      const payload: unknown = await response.json();
      if (
        !payload ||
        typeof payload !== "object" ||
        !("table" in payload) ||
        !Array.isArray(payload.table) ||
        !payload.table.every(isSimulationRow)
      ) {
        throw new Error("The simulator returned results in an unexpected format.");
      }

      setResults(payload.table);
      if (payload.table.length === 0) {
        setError("No results were returned for these simulation settings.");
      }
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Could not reach the simulator. Check your connection or try again later."
          : requestError instanceof SyntaxError
            ? "The simulator returned an invalid response. Please try again later."
            : requestError instanceof Error
              ? requestError.message
              : "Something went wrong while running the simulation. Please try again.",
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
            Geo-Risk Lab
          </p>
          <h2 id="geo-risk-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
            Financial simulator
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Explore portfolio outcomes under geopolitical risk shocks with a reproducible Monte Carlo simulation.
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
                <h3 className="font-semibold text-white">Simulation parameters</h3>
                <p className="text-sm text-slate-400">Set the portfolio and shock profile</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-200 sm:col-span-2">
                Portfolio value
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
                    aria-label="Portfolio value in dollars"
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                Horizons
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
                  Comma-separated, e.g. 1, 3
                </span>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-200">
                GPR shock multiplier
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
                Number of simulations
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
                Seed
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
                  Running simulation…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Run simulation
                </>
              )}
            </button>
          </form>

          <div className="min-w-0 rounded-3xl border border-white/10 bg-[#101827] p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">Scenario results</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Mean P&amp;L and 95% tail-risk estimates
                </p>
              </div>
              {results.length > 0 && (
                <span className="shrink-0 rounded-full border border-indigo-300/20 bg-indigo-300/10 px-3 py-1 text-xs font-medium text-indigo-200">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center text-slate-300" role="status">
                <LoaderCircle className="h-8 w-8 animate-spin text-indigo-300" aria-hidden="true" />
                <p>Running your simulation…</p>
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                  <thead className="bg-[#0B1220] text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Scenario</th>
                      <th scope="col" className="px-4 py-3 font-medium">Horizon</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Mean P&amp;L</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">VaR95</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">ES95</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((row, index) => (
                      <tr key={`${row.scenario}-${row.horizon}-${index}`} className="text-slate-200">
                        <th scope="row" className="whitespace-nowrap px-4 py-4 font-medium text-white">
                          {row.scenario}
                        </th>
                        <td className="whitespace-nowrap px-4 py-4">{row.horizon}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums">
                          {formatMetric(row.mean_pnl)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums">
                          {formatMetric(row.VaR95)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums">
                          {formatMetric(row.ES95)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                  <Activity className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="font-medium text-slate-200">Your results will appear here</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                  Adjust the parameters and run a simulation to see scenario-level risk estimates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
