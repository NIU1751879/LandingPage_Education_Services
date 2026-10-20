"use client";

import { useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
} from "chart.js";
import { Bar, Line, Scatter } from "react-chartjs-2";
import { useLanguage } from "@/contexts/LanguageContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

type JsonObject = Record<string, unknown>;

const chartColors = [
  "#8b9bff",
  "#60d8bd",
  "#f59e0b",
  "#fb7185",
  "#c084fc",
  "#38bdf8",
  "#f472b6",
  "#a3e635",
];

function asObject(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function numberSeries(value: unknown): number[] {
  return Array.isArray(value)
    ? value.map(numberValue).filter((item): item is number => item !== undefined)
    : [];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const darkChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#cbd5e1", usePointStyle: true, boxWidth: 8, padding: 16 },
    },
    tooltip: {
      backgroundColor: "#0b1220",
      borderColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      titleColor: "#f8fafc",
      bodyColor: "#cbd5e1",
      padding: 12,
    },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8", maxRotation: 0, autoSkip: true },
      grid: { color: "rgba(148,163,184,0.08)" },
    },
    y: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148,163,184,0.12)" },
    },
  },
};

const darkBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#cbd5e1", usePointStyle: true, boxWidth: 8, padding: 16 },
    },
    tooltip: {
      backgroundColor: "#0b1220",
      borderColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      titleColor: "#f8fafc",
      bodyColor: "#cbd5e1",
      padding: 12,
    },
  },
  scales: {
    x: { ticks: { color: "#94a3b8", maxRotation: 35, minRotation: 0 }, grid: { color: "rgba(148,163,184,0.08)" } },
    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
  },
};

export type PortfolioChartRow = {
  scenario: string | number;
  horizon: string | number;
  mean_pnl: number | string;
  VaR95: number | string;
  ES95: number | string;
};

export type GeoRiskDistributions = Record<
  string,
  Record<string, { grid: number[]; density: number[] }>
>;

export function GeoRiskResultsChart({
  rows,
  distributions,
  horizon,
  onHorizonChange,
}: {
  rows: PortfolioChartRow[];
  distributions: GeoRiskDistributions;
  horizon: string;
  onHorizonChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  const horizons = Array.from(new Set(rows.map((row) => String(row.horizon))));
  const selectedHorizon = horizons.includes(horizon) ? horizon : horizons[0] ?? "";
  const visibleRows = rows.filter((row) => String(row.horizon) === selectedHorizon);
  const labels = visibleRows.map((row) => `${row.scenario} · ${row.horizon}m`);

  const metricsData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: t("productLab.charts.meanPnl"),
        data: visibleRows.map((row) => numberValue(row.mean_pnl) ?? 0),
        backgroundColor: "rgba(139,155,255,0.78)",
        borderColor: "#8b9bff",
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        label: t("productLab.charts.varLoss"),
        data: visibleRows.map((row) => numberValue(row.VaR95) ?? 0),
        backgroundColor: "rgba(245,158,11,0.78)",
        borderColor: "#f59e0b",
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        label: t("productLab.charts.esLoss"),
        data: visibleRows.map((row) => numberValue(row.ES95) ?? 0),
        backgroundColor: "rgba(251,113,133,0.78)",
        borderColor: "#fb7185",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const distributionDatasets = Object.entries(distributions)
    .flatMap(([scenario, byHorizon], index) => {
      const distribution = byHorizon[selectedHorizon];
      if (!distribution || distribution.grid.length === 0 || distribution.density.length === 0) {
        return [];
      }
      const count = Math.min(distribution.grid.length, distribution.density.length);
      return [{
        label: scenario,
        data: Array.from({ length: count }, (_, point) => ({
          x: distribution.grid[point],
          y: distribution.density[point],
        })),
        borderColor: chartColors[index % chartColors.length],
        backgroundColor: `${chartColors[index % chartColors.length]}22`,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 8,
        tension: 0.22,
        fill: false,
      }];
    });

  const distributionOptions: ChartOptions<"line"> = {
    ...darkChartOptions,
    parsing: false,
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: t("productLab.charts.portfolioPnl"), color: "#94a3b8" },
        ticks: { color: "#94a3b8", callback: (value) => formatCurrency(Number(value)) },
        grid: { color: "rgba(148,163,184,0.08)" },
      },
      y: {
        title: { display: true, text: t("productLab.charts.density"), color: "#94a3b8" },
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148,163,184,0.12)" },
      },
    },
    plugins: {
      ...darkChartOptions.plugins,
      tooltip: {
        ...darkChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => `${context.dataset.label}: P&L ${formatCurrency(Number(context.parsed.x))}`,
        },
      },
    },
  };

  const metricsOptions: ChartOptions<"bar"> = {
    ...darkBarOptions,
    plugins: {
      ...darkBarOptions.plugins,
      tooltip: {
        ...darkBarOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(Number(context.parsed.y))}`,
        },
      },
    },
    scales: {
      ...darkBarOptions.scales,
      y: {
        ...darkBarOptions.scales?.y,
        ticks: {
          ...darkBarOptions.scales?.y?.ticks,
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <label className="flex w-fit items-center gap-3 text-sm text-slate-300">
        {t("productLab.charts.horizon")}
        <select
          value={selectedHorizon}
          onChange={(event) => onHorizonChange(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#0B1220] px-3 py-2 text-white outline-none focus:border-indigo-400"
        >
          {horizons.map((value) => <option key={value} value={value}>{value} {value === "1" ? t("productLab.charts.month") : t("productLab.charts.months")}</option>)}
        </select>
      </label>
      <div>
        <h4 className="mb-2 text-sm font-medium text-slate-200">{t("productLab.charts.scenarioComparison")}</h4>
        <div className="h-[340px]">
          <Bar
            data={metricsData}
            options={metricsOptions}
            aria-label={t("productLab.charts.chartScenario")}
          />
        </div>
      </div>
      {distributionDatasets.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-200">{t("productLab.charts.pnlDistribution")}</h4>
          <div className="h-[310px]">
            <Line
              data={{ datasets: distributionDatasets }}
              options={distributionOptions}
              aria-label={t("productLab.charts.chartDistribution")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AbmTrajectoryChart({
  history,
  bands,
}: {
  history: JsonObject;
  bands?: JsonObject;
}) {
  const { t } = useLanguage();
  const source = bands ?? history;
  const keys = Object.keys(source).filter((key) => {
    if (key === "time") return false;
    const value = asObject(source[key]);
    return bands
      ? numberSeries(value?.mean).length > 0
      : numberSeries(source[key]).length > 0;
  });
  const series = keys.flatMap((key, index) => {
    const data = bands
      ? numberSeries(asObject(bands[key])?.mean)
      : numberSeries(history[key]);
    if (data.length === 0) return [];
    const paletteIndex = index % chartColors.length;
    const chartSets: ChartDataset<"line", number[]>[] = [{
      label: key.replaceAll("_", " "),
      data,
      borderColor: chartColors[paletteIndex],
      backgroundColor: `${chartColors[paletteIndex]}22`,
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 8,
      tension: 0.2,
    }];
    if (bands) {
      const interval = asObject(bands[key]);
      const lower = numberSeries(interval?.lower95);
      const upper = numberSeries(interval?.upper95);
      if (lower.length === data.length && upper.length === data.length) {
        chartSets.push(
          {
            label: `${key.replaceAll("_", " ")} lower 95%`,
            data: lower,
            borderColor: `${chartColors[paletteIndex]}66`,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
          },
          {
            label: `${key.replaceAll("_", " ")} upper 95%`,
            data: upper,
            borderColor: `${chartColors[paletteIndex]}66`,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
          },
        );
      }
    }
    return chartSets;
  });
  if (series.length === 0) return null;
  const length = Math.max(...series.map((item) => item.data.length));
  const data: ChartData<"line"> = {
    labels: Array.from({ length }, (_, index) => index + 1),
    datasets: series,
  };
  return (
    <div className="h-[320px]">
      <Line
        data={data}
        options={{
          ...darkChartOptions,
          plugins: {
            ...darkChartOptions.plugins,
            tooltip: {
              ...darkChartOptions.plugins?.tooltip,
              callbacks: { title: (items) => `Step ${items[0]?.label ?? ""}` },
            },
          },
          scales: {
            ...darkChartOptions.scales,
            x: {
              ...darkChartOptions.scales?.x,
              title: { display: true, text: t("productLab.charts.simulationStep"), color: "#94a3b8" },
            },
            y: {
              ...darkChartOptions.scales?.y,
              title: { display: true, text: t("productLab.charts.populationMean"), color: "#94a3b8" },
            },
          },
        }}
        aria-label={t("productLab.charts.abmTrajectory")}
      />
    </div>
  );
}

export function AbmEquilibriumChart({ equilibrium }: { equilibrium: JsonObject }) {
  const { t } = useLanguage();
  const entries = Object.entries(equilibrium)
    .map(([label, value]) => [label, numberValue(value)] as const)
    .filter((entry): entry is readonly [string, number] => entry[1] !== undefined);
  if (entries.length === 0) return null;
  return (
    <div className="h-[260px]">
      <Bar
        data={{
          labels: entries.map(([label]) => label.replaceAll("_", " ")),
          datasets: [{
            label: t("productLab.charts.equilibriumAverage"),
            data: entries.map(([, value]) => value),
            backgroundColor: entries.map((_, index) => `${chartColors[index % chartColors.length]}bb`),
            borderColor: entries.map((_, index) => chartColors[index % chartColors.length]),
            borderWidth: 1,
            borderRadius: 5,
          }],
        }}
        options={{
          ...darkBarOptions,
          plugins: { ...darkBarOptions.plugins, legend: { display: false } },
        }}
        aria-label={t("productLab.charts.equilibriumChart")}
      />
    </div>
  );
}

export function AbmDistributionChart({ final }: { final: JsonObject }) {
  const { t } = useLanguage();
  const available = Object.entries(final).flatMap(([name, value]) => {
    const histogram = asObject(asObject(value)?.histogram);
    const bins = numberSeries(histogram?.bins);
    const counts = numberSeries(histogram?.counts);
    if (!bins.length || bins.length !== counts.length) return [];
    return [{ name, bins, counts }];
  });
  const [selected, setSelected] = useState(available[0]?.name ?? "");
  const active = available.find((item) => item.name === selected) ?? available[0];
  if (!active) return null;
  return (
    <div>
      <label className="mb-3 flex w-fit items-center gap-3 text-sm text-slate-300">
        {t("productLab.charts.traitMetric")}
        <select
          value={active.name}
          onChange={(event) => setSelected(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#0B1220] px-3 py-2 text-white outline-none focus:border-emerald-300"
        >
          {available.map((item) => <option key={item.name} value={item.name}>{item.name.replaceAll("_", " ")}</option>)}
        </select>
      </label>
      <div className="h-[270px]">
        <Bar
          data={{
            labels: active.bins.map((value) => value.toFixed(2)),
            datasets: [{
              label: `${active.name.replaceAll("_", " ")} · agent count`,
              data: active.counts,
              backgroundColor: "rgba(96,216,189,0.72)",
              borderColor: "#60d8bd",
              borderWidth: 1,
              borderRadius: 2,
            }],
          }}
          options={{
            ...darkBarOptions,
            plugins: {
              ...darkBarOptions.plugins,
              legend: { display: false },
              tooltip: {
                ...darkBarOptions.plugins?.tooltip,
                callbacks: {
                  title: (items) => `${active.name.replaceAll("_", " ")} ≈ ${items[0]?.label ?? ""}`,
                },
              },
            },
            scales: {
              ...darkBarOptions.scales,
              x: { ...darkBarOptions.scales?.x, title: { display: true, text: t("productLab.charts.agentValue"), color: "#94a3b8" } },
              y: { ...darkBarOptions.scales?.y, title: { display: true, text: t("productLab.charts.agentCount"), color: "#94a3b8" } },
            },
          }}
          aria-label={`${t("productLab.charts.traitMetric")}: ${active.name}`}
        />
      </div>
    </div>
  );
}

export function AbmMonteCarloChart({ summary }: { summary: JsonObject }) {
  const { t } = useLanguage();
  const entries = Object.entries(summary).flatMap(([metric, value]) => {
    const stats = asObject(value);
    const ci = numberSeries(stats?.ci95);
    const median = numberValue(stats?.median);
    return median === undefined ? [] : [{
      metric,
      median,
      lower: ci[0] ?? median,
      upper: ci[1] ?? median,
    }];
  });
  if (entries.length === 0) return null;
  const data: ChartData<"bar"> = {
    labels: entries.map((item) => item.metric.replaceAll("_", " ")),
    datasets: [
      {
        label: t("productLab.charts.medianEquilibrium"),
        data: entries.map((item) => item.median),
        backgroundColor: "rgba(139,155,255,0.72)",
        borderColor: "#8b9bff",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: t("productLab.charts.confidenceLower"),
        data: entries.map((item) => item.lower),
        type: "line",
        pointRadius: 4,
        borderColor: "#60d8bd",
        backgroundColor: "#60d8bd",
      },
      {
        label: t("productLab.charts.confidenceUpper"),
        data: entries.map((item) => item.upper),
        type: "line",
        pointRadius: 4,
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
      },
    ],
  } as ChartData<"bar">;
  return (
    <div className="h-[300px]">
      <Bar data={data} options={darkBarOptions} aria-label={t("productLab.charts.monteCarloChart")} />
    </div>
  );
}

export function SweepResultsChart({ result }: { result: JsonObject }) {
  const { t } = useLanguage();
  const experiment = String(result.exp ?? "");
  const axisObject = asObject(result.axes);
  const xAxis = numberSeries(axisObject?.p_long ?? axisObject?.p_prop ?? axisObject?.stranger_effect_mean);
  const rowAxis = numberSeries(axisObject?.rewiring_probability ?? axisObject?.propagation_hops ?? axisObject?.warm_glow);
  const matrixValue = result.matrix ?? result.median_selection_gradient;
  const matrix = Array.isArray(matrixValue) ? matrixValue.map(numberSeries) : [];
  const touristMatrices = asObject(result.matrices);
  const experimentResults = asObject(result.median_opportunism_gap);

  if (experiment === "policing-vs-gossip" && experimentResults) {
    const datasets = (["gossip", "policing"] as const).flatMap((key, index) => {
      const values = Array.isArray(experimentResults[key]) ? experimentResults[key] : [];
      const points = values.flatMap((value) => {
        const point = asObject(value);
        const x = numberValue(point?.intensity);
        const y = numberValue(point?.median_gap);
        return x === undefined || y === undefined ? [] : [{ x, y }];
      });
      return points.length > 0 ? [{
        label: key === "gossip" ? t("productLab.charts.gossip") : t("productLab.charts.institutionalPolicing"),
        data: points,
        borderColor: chartColors[index],
        backgroundColor: chartColors[index],
        pointRadius: 4,
        tension: 0.15,
      }] : [];
    });
    if (datasets.length === 0) return null;
    const options: ChartOptions<"line"> = {
      ...darkChartOptions,
      parsing: false,
      scales: {
        x: { type: "linear", title: { display: true, text: t("productLab.charts.deterrence"), color: "#94a3b8" }, ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.08)" } },
        y: { title: { display: true, text: t("productLab.charts.opportunismGap"), color: "#94a3b8" }, ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
      },
    };
    return <div className="h-[320px]"><Line data={{ datasets }} options={options} aria-label={t("productLab.charts.policingComparison")} /></div>;
  }

  const matrixFor = (data: number[][], label: string) => {
    if (data.length === 0) return null;
    const columnCount = Math.max(...data.map((row) => row.length));
    const labels = xAxis.length === columnCount
      ? xAxis.map((value) => value.toFixed(2))
      : Array.from({ length: columnCount }, (_, index) => String(index + 1));
    const chartData: ChartData<"line"> = {
      labels,
      datasets: data.map((row, index) => ({
        label: `${label} ${rowAxis[index] !== undefined ? rowAxis[index].toFixed(2) : index + 1}`,
        data: row,
        borderColor: chartColors[index % chartColors.length],
        backgroundColor: `${chartColors[index % chartColors.length]}22`,
        pointRadius: 3,
        borderWidth: 2,
        tension: 0.12,
      })),
    };
    return <div className="h-[300px]"><Line data={chartData} options={darkChartOptions} aria-label={`${t("productLab.charts.chartScenario")}: ${label}`} /></div>;
  };

  if (touristMatrices) {
    return (
      <div className="space-y-6">
        {Object.entries(touristMatrices).map(([name, value]) => (
          <div key={name}>
            <h4 className="mb-2 text-sm font-medium text-slate-200">{name.replaceAll("_", " ")}</h4>
            {matrixFor(Array.isArray(value) ? value.map(numberSeries) : [], name)}
          </div>
        ))}
      </div>
    );
  }

  if (experiment === "warm-glow") {
    const warmGlow = numberSeries(axisObject?.warm_glow);
    const stranger = numberSeries(axisObject?.stranger_effect_mean);
    const labels = stranger.map((value) => value.toFixed(2));
    const chartData: ChartData<"bar"> = {
      labels,
      datasets: matrix.map((row, index) => ({
        label: `Warm glow ${warmGlow[index]?.toFixed(2) ?? index + 1}`,
        data: row,
        backgroundColor: `${chartColors[index % chartColors.length]}bb`,
        borderColor: chartColors[index % chartColors.length],
        borderWidth: 1,
        borderRadius: 3,
      })),
    };
    return (
      <div>
        <p className="mb-2 text-xs text-slate-400">{t("productLab.charts.warmGlowAxis")}</p>
        <div className="h-[320px]"><Bar data={chartData} options={darkBarOptions} aria-label={t("productLab.charts.warmGlowChart")} /></div>
      </div>
    );
  }

  return matrixFor(matrix, experiment === "propagation" ? t("productLab.charts.propagationHops") : t("productLab.charts.parameterRow"));
}

export function FixedPointsChart({ points }: { points: unknown[] }) {
  const { t } = useLanguage();
  const mapped = points.flatMap((value) => {
    const point = asObject(value);
    const state = numberSeries(point?.state);
    return state.length >= 4
      ? [{ x: state[0], y: state[2], stable: point?.stable === true, mL: state[1], reputation: state[3] }]
      : [];
  });
  if (mapped.length === 0) return null;
  const data: ChartData<"scatter"> = {
    datasets: [
      {
        label: t("productLab.charts.stable"),
        data: mapped.filter((point) => point.stable),
        backgroundColor: "#60d8bd",
        pointRadius: 6,
      },
      {
        label: t("productLab.charts.unstable"),
        data: mapped.filter((point) => !point.stable),
        backgroundColor: "#f59e0b",
        pointRadius: 6,
      },
    ],
  };
  const options: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: true },
    scales: {
      x: { type: "linear", min: 0, max: 1, title: { display: true, text: "z*", color: "#94a3b8" }, ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.08)" } },
      y: { type: "linear", min: 0, max: 1, title: { display: true, text: "mD*", color: "#94a3b8" }, ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#cbd5e1", usePointStyle: true, boxWidth: 8, padding: 16 },
      },
      tooltip: {
        backgroundColor: "#0b1220",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        padding: 12,
        callbacks: {
          label: (context) => {
            const point = mapped.find(
              (candidate) =>
                candidate.x === context.parsed.x &&
                candidate.y === context.parsed.y,
            );
            return `z=${point?.x.toFixed(3)}, mD=${point?.y.toFixed(3)}, mL=${point?.mL.toFixed(3)}, R=${point?.reputation.toFixed(3)}`;
          },
        },
      },
    },
  };
  return <div className="h-[300px]"><Scatter data={data} options={options} aria-label={t("productLab.charts.fixedPointsChart")} /></div>;
}
