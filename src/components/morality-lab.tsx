"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, LoaderCircle, Play, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AbmDistributionChart,
  AbmEquilibriumChart,
  AbmMonteCarloChart,
  AbmTrajectoryChart,
  FixedPointsChart,
  SweepResultsChart,
} from "@/components/interactive-simulation-charts";
import {
  MeanFieldPhaseFieldChart,
  MeanFieldTrajectoryChart,
  type MeanFieldPhasePoint as ChartPhasePoint,
  type MeanFieldTrajectoryPoint as ChartTrajectoryPoint,
} from "@/components/mean-field-charts";

type JsonObject = Record<string, unknown>;
type ModelMode = "abm" | "mean-field";
type SweepName = "tourist-hub" | "propagation" | "policing-vs-gossip" | "warm-glow";
type MeanFieldTrajectoryResponsePoint = {
  t: number;
  x1: number;
  x2: number;
  x3: number;
  x4: number;
};
type MeanFieldPhaseResponsePoint = MeanFieldTrajectoryResponsePoint & {
  nullcline_dz: boolean;
  nullcline_dmL: boolean;
  mD: number;
  R: number;
};

const sweepNames: { value: SweepName; label: string }[] = [
  { value: "tourist-hub", label: "1 · Tourist hub" },
  { value: "propagation", label: "2 · Gossip propagation" },
  { value: "policing-vs-gossip", label: "3 · Policing vs gossip" },
  { value: "warm-glow", label: "4 · Warm glow & stranger effect" },
];

function asObject(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

function asNumbers(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item))
    : [];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isMeanFieldTrajectoryPoint(value: unknown): value is MeanFieldTrajectoryResponsePoint {
  const point = asObject(value);
  return !!point &&
    isFiniteNumber(point.t) &&
    isFiniteNumber(point.x1) &&
    isFiniteNumber(point.x2) &&
    isFiniteNumber(point.x3) &&
    isFiniteNumber(point.x4);
}

function isMeanFieldPhasePoint(value: unknown): value is MeanFieldPhaseResponsePoint {
  const point = asObject(value);
  return !!point &&
    isFiniteNumber(point.t) &&
    isFiniteNumber(point.x1) &&
    isFiniteNumber(point.x2) &&
    isFiniteNumber(point.x3) &&
    isFiniteNumber(point.x4) &&
    typeof point.nullcline_dz === "boolean" &&
    typeof point.nullcline_dmL === "boolean" &&
    isFiniteNumber(point.mD) &&
    isFiniteNumber(point.R);
}

function isChartTrajectoryPoint(value: unknown): value is ChartTrajectoryPoint {
  const point = asObject(value);
  return !!point &&
    isFiniteNumber(point.time) &&
    isFiniteNumber(point.z) &&
    isFiniteNumber(point.mL) &&
    isFiniteNumber(point.mD) &&
    isFiniteNumber(point.R);
}

function isChartPhasePoint(value: unknown): value is ChartPhasePoint {
  const point = asObject(value);
  return !!point &&
    isFiniteNumber(point.z) &&
    isFiniteNumber(point.mL) &&
    isFiniteNumber(point.dz) &&
    isFiniteNumber(point.dmL) &&
    typeof point.nullcline_dz === "boolean" &&
    typeof point.nullcline_dmL === "boolean" &&
    isFiniteNumber(point.mD) &&
    isFiniteNumber(point.R);
}

function receivedDiagnostic(value: unknown): string {
  if (Array.isArray(value)) {
    const preview = JSON.stringify(value.slice(0, 2));
    return `Received an array with ${value.length} item(s): ${preview}`;
  }
  const object = asObject(value);
  if (object) {
    const previewObject = Object.fromEntries(
      Object.entries(object).map(([key, item]) => [
        key,
        Array.isArray(item)
          ? { length: item.length, preview: item.slice(0, 2) }
          : item,
      ]),
    );
    const preview = JSON.stringify(previewObject).slice(0, 500);
    return `Received object keys: ${Object.keys(object).join(", ") || "(none)"}. Preview: ${preview}`;
  }
  return `Received ${value === null ? "null" : typeof value}: ${String(value).slice(0, 200)}`;
}

function parseLegacyMeanFieldResponse(
  value: JsonObject,
  kind: "trajectory" | "phase-field",
  expectedPoints: number,
  t: (key: string) => string,
): JsonObject | undefined {
  const nestedData = asObject(value.data);
  const source = nestedData ?? value;
  if (kind === "trajectory") {
    const keys = ["time", "z", "mL", "mD", "R"] as const;
    if (!keys.every((key) => Array.isArray(source[key]))) return undefined;
    const arrays = keys.map((key) => source[key] as unknown[]);
    const complete = arrays.every(
      (series) =>
        series.length === expectedPoints &&
        series.every(isFiniteNumber),
    );
    if (!complete) {
      throw new Error(t("productLab.morality.errors.legacyInvalid").replace("{diagnostic}", receivedDiagnostic(value)));
    }
    const [time, z, mL, mD, reputation] = arrays as number[][];
    const points: ChartTrajectoryPoint[] = time.map((timestamp, index) => ({
      time: timestamp,
      z: z[index],
      mL: mL[index],
      mD: mD[index],
      R: reputation[index],
    }));
    if (points.some((point, index) => index > 0 && point.time <= points[index - 1].time)) {
      throw new Error(t("productLab.morality.errors.invalidTimes").replace("{diagnostic}", receivedDiagnostic(value)));
    }
    return { mean_field_trajectory: points };
  }

  const gridKeys = ["z", "mL", "dz", "dmL", "nullcline_dz", "nullcline_dmL"] as const;
  if (!gridKeys.every((key) => Array.isArray(source[key]))) return undefined;
  const [zValues, mLValues, dzGrid, dmLGrid, nullclineZGrid, nullclineMGrid] =
    gridKeys.map((key) => source[key]);
  const gridSize = Math.sqrt(expectedPoints);
  const isAxis = (axis: unknown): axis is number[] =>
    Array.isArray(axis) &&
    axis.length === gridSize &&
    axis.every(isFiniteNumber);
  const isGrid = (grid: unknown): grid is unknown[][] =>
    Array.isArray(grid) &&
    grid.length === gridSize &&
    grid.every((row) => Array.isArray(row) && row.length === gridSize);
  if (
    !isAxis(zValues) ||
    !isAxis(mLValues) ||
    !isGrid(dzGrid) ||
    !isGrid(dmLGrid) ||
    !isGrid(nullclineZGrid) ||
    !isGrid(nullclineMGrid)
  ) {
    throw new Error(t("productLab.morality.errors.legacyInvalid").replace("{diagnostic}", receivedDiagnostic(value)));
  }
  const slice = asObject(source.slice) ?? asObject(value.slice);
  const mD = isFiniteNumber(source.mD) ? source.mD : slice?.mD;
  const reputation = isFiniteNumber(source.R) ? source.R : slice?.R;
  if (!isFiniteNumber(mD) || !isFiniteNumber(reputation)) {
    throw new Error(t("productLab.morality.errors.legacyInvalid").replace("{diagnostic}", receivedDiagnostic(value)));
  }
  const points: ChartPhasePoint[] = [];
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const point = {
        z: zValues[column],
        mL: mLValues[row],
        dz: dzGrid[row][column],
        dmL: dmLGrid[row][column],
        nullcline_dz: nullclineZGrid[row][column],
        nullcline_dmL: nullclineMGrid[row][column],
        mD,
        R: reputation,
      };
      if (!isChartPhasePoint(point)) {
        throw new Error(t("productLab.morality.errors.legacyInvalid").replace("{diagnostic}", receivedDiagnostic(value)));
      }
      points.push(point);
    }
  }
  return { mean_field_phase_field: points, phase_slice: { mD, R: reputation } };
}

function parseMeanFieldResponse(
  value: unknown,
  kind: "trajectory" | "phase-field",
  expectedPoints: number,
  t: (key: string) => string,
): JsonObject {
  const envelope = asObject(value);
  const legacyResult = envelope
    ? parseLegacyMeanFieldResponse(envelope, kind, expectedPoints, t)
    : undefined;
  if (legacyResult) return legacyResult;
  let responseData: unknown[] | undefined;
  if (Array.isArray(envelope?.data)) {
    responseData = envelope.data;
  } else {
    const nestedData = asObject(envelope?.data);
    if (Array.isArray(nestedData?.results)) responseData = nestedData.results;
  }
  if (
    envelope?.status !== "completed" ||
    (typeof envelope.job_id !== "string" && typeof envelope.jobId !== "string") ||
    !String(envelope.job_id ?? envelope.jobId).trim() ||
    !responseData
  ) {
    throw new Error(t("productLab.morality.errors.responseInvalid")
      .replace("{count}", String(expectedPoints))
      .replace("{diagnostic}", receivedDiagnostic(value)));
  }
  const points = responseData;
  const jobId = String(envelope.job_id ?? envelope.jobId);

  if (kind === "trajectory") {
    if (points.length !== expectedPoints || !points.every(isMeanFieldTrajectoryPoint)) {
      throw new Error(t("productLab.morality.errors.responseInvalid")
        .replace("{count}", String(expectedPoints))
        .replace("{diagnostic}", receivedDiagnostic(value)));
    }
    const chartPoints: ChartTrajectoryPoint[] = points.map((point) => ({
      time: point.t,
      z: point.x1,
      mL: point.x2,
      mD: point.x3,
      R: point.x4,
    }));
    if (chartPoints.some((point, index) => index > 0 && point.time <= chartPoints[index - 1].time)) {
      throw new Error(t("productLab.morality.errors.invalidTimes").replace("{diagnostic}", receivedDiagnostic(value)));
    }
    return { mean_field_trajectory: chartPoints, job_id: jobId };
  }

  const gridSize = Math.sqrt(expectedPoints);
  if (
    points.length !== expectedPoints ||
    !Number.isInteger(gridSize) ||
    !points.every(isMeanFieldPhasePoint)
  ) {
    throw new Error(t("productLab.morality.errors.responseInvalid")
      .replace("{count}", String(expectedPoints))
      .replace("{diagnostic}", receivedDiagnostic(value)));
  }
  const chartPoints: ChartPhasePoint[] = points.map((point) => ({
    z: point.x1,
    mL: point.x2,
    dz: point.x3,
    dmL: point.x4,
    nullcline_dz: point.nullcline_dz,
    nullcline_dmL: point.nullcline_dmL,
    mD: point.mD,
    R: point.R,
  }));
  return {
    mean_field_phase_field: chartPoints,
    phase_slice: { mD: chartPoints[0].mD, R: chartPoints[0].R },
    job_id: jobId,
  };
}

function formatNumber(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(3) : "—";
}

const resultKeys = [
  "history",
  "mean_field_trajectory",
  "mean_field_phase_field",
  "job_id",
  "time",
  "final",
  "equilibrium",
  "summary",
  "bands95",
  "trajectories",
  "fixed_points",
  "points",
  "dz",
  "matrix",
  "matrices",
  "median_selection_gradient",
  "median_opportunism_gap",
];

function isResultPayload(value: unknown): value is JsonObject {
  const object = asObject(value);
  return !!object && resultKeys.some((key) => key in object);
}

function findJobId(value: unknown, depth = 0, allowGenericId = false): string | undefined {
  const object = asObject(value);
  if (!object || depth > 4) return undefined;

  for (const key of ["job_id", "jobId", "jobID", "task_id", "taskId", "taskID"]) {
    const id = object[key];
    if ((typeof id === "string" && id.trim()) || (typeof id === "number" && Number.isFinite(id))) {
      return String(id);
    }
  }

  if (allowGenericId || "status" in object || "state" in object) {
    const id = object.id;
    if ((typeof id === "string" && id.trim()) || (typeof id === "number" && Number.isFinite(id))) {
      return String(id);
    }
  }

  for (const key of ["job", "task", "data", "meta"]) {
    const id = findJobId(
      object[key],
      depth + 1,
      allowGenericId || key === "job" || key === "task",
    );
    if (id) return id;
  }
  return undefined;
}

function unwrapResult(value: unknown, depth = 0): JsonObject | undefined {
  const object = asObject(value);
  if (!object || depth > 4) return undefined;
  if (isResultPayload(object)) return object;
  for (const key of ["result", "output", "data"]) {
    const nested = unwrapResult(object[key], depth + 1);
    if (nested) return nested;
  }
  return undefined;
}

function NetworkGraph({ network }: { network: JsonObject }) {
  const { t } = useLanguage();
  const agents = asObject(network.agents);
  const z = asNumbers(agents?.z);
  const mLocal = asNumbers(agents?.m_local);
  const mDistant = asNumbers(agents?.m_distant);
  const edges = Array.isArray(network.edges) ? network.edges : [];
  if (!z.length) return null;

  const positions = z.map((_, index) => {
    const angle = (index / z.length) * Math.PI * 2;
    const radius = 160;
    return { x: 200 + Math.cos(angle) * radius, y: 200 + Math.sin(angle) * radius };
  });
  const edgePairs = edges.flatMap((edge) =>
    Array.isArray(edge) && edge.length === 2 && typeof edge[0] === "number" && typeof edge[1] === "number"
      ? [[edge[0], edge[1]] as const]
      : [],
  );

  return (
    <svg viewBox="0 0 400 400" className="mx-auto h-auto max-h-[360px] w-full" role="img" aria-label={t("productLab.morality.networkChart")}>
      {edgePairs.map(([from, to], index) => (
        <line
          key={`${from}-${to}-${index}`}
          x1={positions[from]?.x ?? 0}
          y1={positions[from]?.y ?? 0}
          x2={positions[to]?.x ?? 0}
          y2={positions[to]?.y ?? 0}
          stroke="#52627a"
          strokeOpacity="0.34"
          strokeWidth="1"
        />
      ))}
      {positions.map((position, index) => {
        const gap = (mDistant[index] ?? 0) - (mLocal[index] ?? 0);
        const red = Math.round(130 + Math.max(0, gap) * 100);
        const blue = Math.round(130 + Math.max(0, -gap) * 100);
        return (
          <circle
            key={index}
            cx={position.x}
            cy={position.y}
            r="4.2"
            fill={`rgb(${red}, 115, ${blue})`}
            stroke="#e2e8f0"
            strokeWidth="0.7"
          />
        );
      })}
    </svg>
  );
}

function BifurcationPlot({ result }: { result: JsonObject }) {
  const { t } = useLanguage();
  const parameter = typeof result.parameter === "string" ? result.parameter : "p_audit";
  const points = Array.isArray(result.points)
    ? result.points.flatMap((item) => {
        const point = asObject(item);
        return typeof point?.parameter === "number" && typeof point.mD === "number"
          ? [{ parameter: point.parameter, mD: point.mD, stable: point.stable === true }]
          : [];
      })
    : [];
  const threshold = typeof result.analytical_threshold === "number" ? result.analytical_threshold : undefined;
  const axis = asNumbers(result.axis);
  if (!points.length || !axis.length) return null;

  const minX = Math.min(...axis);
  const maxX = Math.max(...axis);
  const rangeX = maxX - minX || 1;
  const left = 42;
  const right = 590;
  const top = 20;
  const bottom = 235;
  const xCoordinate = (value: number) => left + ((value - minX) / rangeX) * (right - left);
  const yCoordinate = (value: number) => bottom - Math.max(0, Math.min(1, value)) * (bottom - top);

  return (
    <div>
      <svg viewBox="0 0 620 270" className="h-auto w-full" role="img" aria-label={`Bifurcation diagram over ${parameter}`}>
        <line x1={left} x2={right} y1={bottom} y2={bottom} stroke="#64748b" />
        <line x1={left} x2={left} y1={top} y2={bottom} stroke="#64748b" />
        {threshold !== undefined && threshold >= minX && threshold <= maxX && (
          <line x1={xCoordinate(threshold)} x2={xCoordinate(threshold)} y1={top} y2={bottom} stroke="#fbbf24" strokeDasharray="5 4" />
        )}
        {points.map((point, index) => (
          <circle key={index} cx={xCoordinate(point.parameter)} cy={yCoordinate(point.mD)} r="4" fill={point.stable ? "#6ee7b7" : "#fb923c"} stroke="#07111c" strokeWidth="1" />
        ))}
        <text x={left} y="258" fill="#94a3b8" fontSize="11">{parameter}</text>
        <text x="5" y={top + 5} fill="#94a3b8" fontSize="11">mD*</text>
        <text x={right - 45} y={bottom + 18} fill="#94a3b8" fontSize="10">{maxX.toFixed(2)}</text>
        <text x={left} y={bottom + 18} fill="#94a3b8" fontSize="10">{minX.toFixed(2)}</text>
      </svg>
      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-300" />{t("productLab.charts.stableEquilibrium")}</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400" />{t("productLab.charts.unstableEquilibrium")}</span>
        {threshold !== undefined && <span className="text-amber-200">{t("productLab.charts.analyticalThreshold").replace("{value}", threshold.toFixed(3))}</span>}
      </div>
    </div>
  );
}

export function MoralityLab() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<ModelMode>("abm");
  const [apiUrl, setApiUrl] = useState("");
  const [abm, setAbm] = useState({
    N: "80",
    steps: "200",
    seed: "123",
    k_neighbors: "6",
    rewire_prob_init: "0.1",
    mu_z: "0.6",
    mu_m_local: "0.3",
    stranger_effect_mean: "0.3",
    p_long: "0.05",
    p_prop: "0.2",
    propagation_hops: "1",
    warm_glow: "0.5",
    p_audit: "0",
    fine: "2",
    n_seeds: "5",
    burn_in: "100",
  });
  const [mf, setMf] = useState({
    z: "0.5",
    mL: "0.5",
    mD: "0.5",
    R: "0.5",
    K: "0.4",
    betaR: "0.8",
    g: "0.5",
    p_audit: "0",
    fine: "2",
    t_max: "40",
    n_steps: "200",
    n: "25",
  });
  const [result, setResult] = useState<JsonObject>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobProgress, setJobProgress] = useState<number>();
  const [jobStatus, setJobStatus] = useState("");
  const [sweep, setSweep] = useState<SweepName>("tourist-hub");
  const [activeView, setActiveView] = useState<"run" | "monte-carlo" | "sweep">("run");

  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_GEO_RISK_API_URL?.replace(/\/+$/, "") ?? "");
  }, []);

  const abmPayload = useMemo(
    () => ({
      N: Number(abm.N),
      steps: Number(abm.steps),
      seed: Number(abm.seed),
      k_neighbors: Number(abm.k_neighbors),
      rewire_prob_init: Number(abm.rewire_prob_init),
      mu_z: Number(abm.mu_z),
      mu_m_local: Number(abm.mu_m_local),
      stranger_effect_mean: Number(abm.stranger_effect_mean),
      p_long: Number(abm.p_long),
      p_prop: Number(abm.p_prop),
      propagation_hops: Number(abm.propagation_hops),
      warm_glow: Number(abm.warm_glow),
      p_audit: Number(abm.p_audit),
      fine: Number(abm.fine),
    }),
    [abm],
  );

  async function request(path: string, body: JsonObject, isJob = false) {
    setError("");
    setResult(undefined);
    if (!apiUrl) {
      setError(t("productLab.morality.errors.apiNotConfigured"));
      return;
    }
    setLoading(true);
    setJobProgress(undefined);
    setJobStatus(t("productLab.morality.statuses.submitting"));
    try {
      const response = await fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => undefined);
        const detail = asObject(payload)?.detail;
        throw new Error(typeof detail === "string" ? detail : t("productLab.morality.errors.requestFailed").replace("{status}", String(response.status)));
      }
      let payload: unknown = await response.json();
      if (path === "/api/morality/mf/trajectory" || path === "/api/morality/mf/phase-field") {
        const kind = path.endsWith("/trajectory") ? "trajectory" : "phase-field";
        const expectedPoints = kind === "trajectory"
          ? Number(body.n_steps)
          : Number(body.n) ** 2;
        const envelope = asObject(payload);
        if (envelope?.status !== "completed") {
          const legacyResult = envelope
            ? parseLegacyMeanFieldResponse(envelope, kind, expectedPoints, t)
            : undefined;
          if (legacyResult) {
            setResult(legacyResult);
            return;
          }
          const jobId = findJobId(payload, 0, true);
          if (!jobId) {
            throw new Error(t("productLab.morality.errors.responseInvalid")
              .replace("{count}", String(expectedPoints))
              .replace("{diagnostic}", receivedDiagnostic(payload)));
          }
          setJobStatus(t("productLab.morality.statuses.queuedMf"));
          const deadline = Date.now() + 300_000;
          let completed = false;
          while (Date.now() < deadline) {
            await new Promise((resolve) => window.setTimeout(resolve, 800));
            const jobResponse = await fetch(`${apiUrl}/api/jobs/${encodeURIComponent(jobId)}`);
            if (!jobResponse.ok) {
              throw new Error(t("productLab.morality.errors.jobStatusError").replace("{status}", String(jobResponse.status)));
            }
            const job = asObject(await jobResponse.json());
            if (!job) {
              throw new Error(`${t("productLab.morality.errors.invalidJobState")} ${receivedDiagnostic(job)}`);
            }
            if (isFiniteNumber(job.progress)) setJobProgress(Math.max(0, Math.min(1, job.progress)));
            const status = String(job.status ?? job.state ?? "").toLowerCase();
            setJobStatus(
              status === "queued" || status === "pending"
                ? t("productLab.morality.statuses.queuedMf")
                : status === "running" || status === "processing"
                  ? t("productLab.morality.statuses.runningMf")
                  : t("productLab.morality.statuses.waitingMf"),
            );
            if (["error", "failed", "cancelled", "canceled"].includes(status)) {
              throw new Error(
                typeof job.error === "string" ? job.error : t("productLab.morality.errors.meanFieldFailed"),
              );
            }
            if (["done", "complete", "completed", "success", "succeeded"].includes(status)) {
              payload = job.result ?? job.output ?? job.data;
              completed = true;
              break;
            }
          }
          if (!completed) {
            throw new Error(t("productLab.morality.errors.meanFieldTimeout"));
          }
        }
        setResult(parseMeanFieldResponse(payload, kind, expectedPoints, t));
        return;
      }
      const directResult = unwrapResult(payload);
      const jobId = directResult ? undefined : findJobId(payload, 0, true);
      if (jobId) {
        const deadline = Date.now() + 300_000;
        let completedResult: JsonObject | undefined;
        while (Date.now() < deadline) {
          await new Promise((resolve) => window.setTimeout(resolve, 800));
          const jobResponse = await fetch(`${apiUrl}/api/jobs/${encodeURIComponent(jobId)}`);
          if (!jobResponse.ok) throw new Error(t("productLab.morality.errors.jobStatusError").replace("{status}", String(jobResponse.status)));
          const job = asObject(await jobResponse.json());
          if (!job) throw new Error(t("productLab.morality.errors.invalidJobState"));
          if (typeof job.progress === "number" && Number.isFinite(job.progress)) {
            setJobProgress(Math.max(0, Math.min(1, job.progress)));
          }
          const status = String(job.status ?? job.state ?? "").toLowerCase();
          setJobStatus(
            status === "queued" || status === "pending"
              ? t("productLab.morality.statuses.queued")
              : status === "running" || status === "processing"
                ? t("productLab.morality.statuses.running")
                : t("productLab.morality.statuses.waiting"),
          );
          completedResult =
            unwrapResult(job.result ?? job.output ?? job.data) ??
            (isResultPayload(job) ? job : undefined);
          if (["done", "complete", "completed", "success", "succeeded"].includes(status) ||
            (!status && completedResult)) {
            if (!completedResult) {
              throw new Error(t("productLab.morality.errors.invalidJobResult"));
            }
            payload = completedResult;
            break;
          }
          if (["error", "failed", "cancelled", "canceled"].includes(status)) {
            throw new Error(
              typeof job.error === "string"
                ? job.error
                : typeof job.message === "string"
                  ? job.message
                  : t("productLab.morality.errors.jobFailed"),
            );
          }
        }
        if (payload !== completedResult) {
          throw new Error(t("productLab.morality.errors.timeout"));
        }
      } else if (!directResult) {
        if (isJob) {
          throw new Error(t("productLab.morality.errors.noJob"));
        }
        throw new Error(t("productLab.morality.errors.unexpected"));
      }
      const data = unwrapResult(payload);
      if (!data) throw new Error(t("productLab.morality.errors.unexpected"));
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? t("productLab.morality.errors.connection").replace("{path}", path)
          : requestError instanceof SyntaxError
            ? `${t("productLab.morality.errors.invalidJson")} ${requestError.message}`
          : requestError instanceof Error
            ? requestError.message
            : t("productLab.morality.errors.generic"),
      );
    } finally {
      setLoading(false);
      setJobProgress(undefined);
      setJobStatus("");
    }
  }

  function submitAbm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveView("run");
    void request("/api/morality/abm/run", abmPayload, abmPayload.N * abmPayload.steps > 100_000);
  }

  function submitMeanField(event: FormEvent<HTMLFormElement>, endpoint: "trajectory" | "fixed-points" | "phase-field") {
    event.preventDefault();
    runMeanField(endpoint);
  }

  function runMeanField(endpoint: "trajectory" | "fixed-points" | "phase-field" | "bifurcation") {
    setActiveView("run");
    const payload = {
      z: Number(mf.z),
      mL: Number(mf.mL),
      mD: Number(mf.mD),
      R: Number(mf.R),
      K: Number(mf.K),
      betaR: Number(mf.betaR),
      g: Number(mf.g),
      p_audit: Number(mf.p_audit),
      fine: Number(mf.fine),
      t_max: Number(mf.t_max),
      n_steps: Number(mf.n_steps),
      n: Number(mf.n),
    };
    const endpointPayload = endpoint === "fixed-points"
      ? { ...payload, n_seeds: 50 }
      : endpoint === "bifurcation"
        ? { ...payload, parameter: "p_audit", start: 0, stop: 1, n_points: 10, n_seeds: 10 }
        : payload;
    void request(`/api/morality/mf/${endpoint}`, endpointPayload, endpoint === "bifurcation");
  }

  function updateAbm(key: keyof typeof abm, value: string) {
    setAbm((current) => ({ ...current, [key]: value }));
  }

  function updateMf(key: keyof typeof mf, value: string) {
    setMf((current) => ({ ...current, [key]: value }));
  }

  const history = asObject(result?.history);
  const final = asObject(result?.final);
  const equilibrium = asObject(result?.equilibrium);
  const bands95 = asObject(result?.bands95);
  const theorem = asObject(result?.theorems);
  const fixedPoints = Array.isArray(result?.fixed_points) ? result.fixed_points : [];
  const monteSummary = asObject(result?.summary);
  const isSweepResult = typeof result?.exp === "string";
  const trajectoryPoints = Array.isArray(result?.mean_field_trajectory)
    ? result.mean_field_trajectory.filter(isChartTrajectoryPoint)
    : [];
  const phasePoints = Array.isArray(result?.mean_field_phase_field)
    ? result.mean_field_phase_field.filter(isChartPhasePoint)
    : [];
  const bifurcationResult = result && typeof result.parameter === "string" && Array.isArray(result.points) ? result : undefined;

  return (
    <section className="min-h-[70vh] bg-[#080D18] py-14 text-white sm:py-20" aria-labelledby="morality-heading">
      <div className="container">
        <header className="mx-auto mb-10 max-w-4xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">{t("productLab.morality.lab")}</p>
          <h1 id="morality-heading" className="text-3xl font-bold tracking-tight sm:text-5xl">{t("productLab.morality.title")}</h1>
          <p className="mx-auto mt-4 max-w-3xl leading-relaxed text-slate-300">
            {t("productLab.morality.subtitle")}
          </p>
        </header>

        <nav className="mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-2" aria-label={t("productLab.morality.modes")}>
          {([
            ["abm", t("productLab.morality.abmMode")],
            ["mean-field", t("productLab.morality.mfMode")],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setMode(value); setResult(undefined); setError(""); }}
              aria-pressed={mode === value}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${mode === value ? "border-emerald-300 bg-emerald-300 text-[#07111c]" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <details className="mx-auto mb-8 max-w-5xl rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6">
          <summary className="cursor-pointer font-semibold text-emerald-200">{t("productLab.morality.about")}</summary>
          <div className="mt-4 grid gap-5 text-sm leading-relaxed text-slate-300 md:grid-cols-2">
            <div>
              <h2 className="font-semibold text-white">{t("productLab.morality.gygesTitle")}</h2>
              <p className="mt-1">{t("productLab.morality.gygesText")}</p>
              <h2 className="mt-4 font-semibold text-white">{t("productLab.morality.traitsTitle")}</h2>
              <p className="mt-1">{t("productLab.morality.traitsText")}</p>
            </div>
            <div>
              <h2 className="font-semibold text-white">{t("productLab.morality.theoryTitle")}</h2>
              <p className="mt-1">{t("productLab.morality.theoryText")}</p>
            </div>
          </div>
        </details>

        <div className="grid gap-7 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-white/10 bg-[#101827] p-5 shadow-2xl sm:p-7">
            {mode === "abm" ? (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200"><Activity className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <h2 className="font-semibold">{t("productLab.morality.network")}</h2>
                    <p className="text-sm text-slate-400">{t("productLab.morality.networkHelp")}</p>
                  </div>
                </div>
                <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={t("productLab.morality.analysis")}>
                  {(["run", "monte-carlo", "sweep"] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => { setActiveView(view); setResult(undefined); setError(""); }}
                      aria-pressed={activeView === view}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeView === view ? "bg-indigo-300 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    >
                      {view === "run" ? t("productLab.morality.oneRun") : view === "monte-carlo" ? t("productLab.morality.monteCarlo") : t("productLab.morality.experiments")}
                    </button>
                  ))}
                </div>
                <form onSubmit={submitAbm} className="grid gap-4 sm:grid-cols-2">
                  {([
                    ["N", "agents", "50", "300", "1"],
                    ["steps", "steps", "50", "1500", "1"],
                    ["seed", "seed", "0", "2147483647", "1"],
                    ["k_neighbors", "degree", "2", "30", "2"],
                    ["rewire_prob_init", "rewiring", "0", "1", "0.01"],
                    ["mu_z", "zMean", "0", "1", "0.01"],
                    ["mu_m_local", "localMean", "0", "1", "0.01"],
                    ["stranger_effect_mean", "strangerMean", "0", "1", "0.01"],
                    ["p_long", "distant", "0", "0.5", "0.01"],
                    ["p_prop", "gossipDecay", "0", "1", "0.05"],
                    ["propagation_hops", "gossipRadius", "0", "4", "1"],
                    ["warm_glow", "warmGlow", "0", "2", "0.1"],
                    ["p_audit", "auditProbability", "0", "1", "0.05"],
                    ["fine", "auditFine", "0", "5", "0.1"],
                    ...(activeView === "monte-carlo" ? [["n_seeds", "independentSeeds", "1", "10", "1"], ["burn_in", "burnIn", "0", "500", "1"]] : []),
                  ] as [keyof typeof abm, string, string, string, string][]).map(([key, label, min, max, step]) => (
                    <label key={key} className="space-y-1.5 text-sm text-slate-200">
                      {t(`productLab.morality.abmFields.${label}`)}
                      <input
                        type="number"
                        required
                        min={min}
                        max={max}
                        step={step}
                        value={abm[key]}
                        onChange={(event) => updateAbm(key, event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2.5 text-white outline-none focus:border-emerald-300"
                      />
                    </label>
                  ))}
                  {activeView === "sweep" && (
                    <label className="space-y-1.5 text-sm text-slate-200 sm:col-span-2">
                      {t("productLab.morality.abmFields.experiment")}
                      <select value={sweep} onChange={(event) => setSweep(event.target.value as SweepName)} className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2.5 text-white outline-none focus:border-emerald-300">
                        {sweepNames.map((item) => {
                          const key = item.value === "tourist-hub"
                            ? "tourist"
                            : item.value === "policing-vs-gossip"
                              ? "policing"
                              : item.value === "warm-glow"
                                ? "warmGlow"
                                : "propagation";
                          return <option key={item.value} value={item.value}>{t(`productLab.morality.sweepNames.${key}`)}</option>;
                        })}
                      </select>
                    </label>
                  )}
                  <button
                    type={activeView === "run" ? "submit" : "button"}
                    onClick={activeView === "run" ? undefined : () => {
                      const body = { ...abmPayload, n_seeds: Number(abm.n_seeds), burn_in: Number(abm.burn_in) };
                      if (activeView === "monte-carlo") void request("/api/morality/abm/monte-carlo", body, true);
                      else void request(`/api/morality/abm/sweep/${sweep}`, body, true);
                    }}
                    disabled={loading}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 font-semibold text-[#07111c] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                  >
                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : activeView === "run" ? <Play className="h-4 w-4" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                    {loading ? `${t("productLab.morality.running")}${jobProgress === undefined ? "…" : ` · ${Math.round(jobProgress * 100)}%`}` : activeView === "run" ? t("productLab.morality.abmSubmit") : activeView === "monte-carlo" ? t("productLab.morality.monteSubmit") : t("productLab.morality.experimentSubmit")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-300/10 text-indigo-200"><Activity className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <h2 className="font-semibold">{t("productLab.morality.meanField")}</h2>
                    <p className="text-sm text-slate-400">{t("productLab.morality.meanFieldHelp")}</p>
                  </div>
                </div>
                <form onSubmit={(event) => submitMeanField(event, "trajectory")} className="grid gap-4 sm:grid-cols-2">
                  {([
                    ["z", "z", "0", "1", "0.01"],
                    ["mL", "mL", "0", "1", "0.01"],
                    ["mD", "mD", "0", "1", "0.01"],
                    ["R", "R", "0", "1", "0.01"],
                    ["K", "K", "0.051", "1", "0.01"],
                    ["betaR", "betaR", "0", "5", "0.1"],
                    ["g", "g", "0", "5", "0.1"],
                    ["p_audit", "auditProbability", "0", "1", "0.05"],
                    ["fine", "auditFine", "0", "10", "0.1"],
                    ["t_max", "horizon", "0.1", "500", "1"],
                    ["n_steps", "points", "10", "2000", "10"],
                    ["n", "grid", "5", "100", "1"],
                  ] as [keyof typeof mf, string, string, string, string][]).map(([key, label, min, max, step]) => (
                    <label key={key} className="space-y-1.5 text-sm text-slate-200">
                      {t(`productLab.morality.mfFields.${label}`)}
                      <input type="number" required min={min} max={max} step={step} value={mf[key]} onChange={(event) => updateMf(key, event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2.5 text-white outline-none focus:border-indigo-300" />
                    </label>
                  ))}
                  <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-300 px-4 py-3 font-semibold text-[#07111c] transition hover:bg-indigo-200 disabled:opacity-60">
                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                    {t("productLab.morality.integrate")}
                  </button>
                </form>
              </>
            )}
            {error && <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
          </div>

          <div className="min-w-0 rounded-3xl border border-white/10 bg-[#101827] p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{t("productLab.morality.output")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("productLab.morality.outputHelp")}</p>
              </div>
              {result && <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">{t("productLab.morality.complete")}</span>}
            </div>
            {loading ? (
              <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-3 text-slate-300">
                <LoaderCircle className="h-8 w-8 animate-spin text-emerald-200" aria-hidden="true" />
                <span>{t("productLab.morality.computing")}</span>
                <span className="text-sm">{jobStatus || t("productLab.morality.computing")}</span>
                {jobProgress !== undefined && <span className="text-xs text-slate-500">{Math.round(jobProgress * 100)}{t("productLab.morality.percentComplete")}</span>}
              </div>
            ) : !result ? (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 text-center">
                <Activity className="mb-3 h-7 w-7 text-slate-500" aria-hidden="true" />
                <p className="font-medium text-slate-200">{t("productLab.morality.choose")}</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{t("productLab.morality.chooseHelp")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {trajectoryPoints.length > 0 && <div><h3 className="mb-3 text-sm font-semibold text-slate-200">{t("productLab.morality.trajectory")}</h3><MeanFieldTrajectoryChart points={trajectoryPoints} /></div>}
                {(history || bands95) && <div><h3 className="mb-3 text-sm font-semibold text-slate-200">{t("productLab.morality.timeSeries")}</h3><AbmTrajectoryChart history={history ?? {}} bands={bands95} /></div>}
                {asObject(result.network) && <div><h3 className="mb-2 text-sm font-semibold text-slate-200">{t("productLab.morality.networkChart")}</h3><NetworkGraph network={asObject(result.network)!} /></div>}
                {final && <div><h3 className="mb-3 text-sm font-semibold text-slate-200">{t("productLab.morality.distributions")}</h3><AbmDistributionChart final={final} /></div>}
                {equilibrium && <div><h3 className="mb-3 text-sm font-semibold text-slate-200">{t("productLab.morality.equilibrium")}</h3><AbmEquilibriumChart equilibrium={equilibrium} /></div>}
                {monteSummary && <div><h3 className="mb-3 text-sm font-semibold text-slate-200">{t("productLab.morality.monteSummary")}</h3><AbmMonteCarloChart summary={monteSummary} /><div className="mt-3 flex flex-wrap gap-2">{Object.entries(monteSummary).map(([key, value]) => { const stats = asObject(value); return <span key={key} className="rounded-full border border-white/10 bg-[#0B1220] px-3 py-1 text-xs text-slate-300">{key.replaceAll("_", " ")}: {String(stats?.diagnostic ?? "no diagnostic")}</span>; })}</div></div>}
                {phasePoints.length > 0 && <div><h3 className="mb-2 text-sm font-semibold text-slate-200">{t("productLab.morality.phaseField")}</h3><MeanFieldPhaseFieldChart points={phasePoints} /><p className="mt-2 text-center text-xs text-slate-500">{t("productLab.morality.phaseExplanation").replace("{mD}", formatNumber(asObject(result.phase_slice)?.mD)).replace("{R}", formatNumber(asObject(result.phase_slice)?.R))}</p></div>}
                {bifurcationResult && <div><h3 className="mb-2 text-sm font-semibold text-slate-200">{t("productLab.morality.bifurcation")}</h3><BifurcationPlot result={bifurcationResult} /></div>}
                {Array.isArray(result.fixed_points) && <div><h3 className="mb-3 text-sm font-semibold text-slate-200">{t("productLab.morality.fixedPoints")}</h3>{fixedPoints.length > 0 ? <><FixedPointsChart points={fixedPoints} /><p className="mt-2 text-xs text-slate-400">{fixedPoints.filter((value) => asObject(value)?.stable === true).length} {t("productLab.morality.stableOf")} {fixedPoints.length}</p></> : <p className="text-sm text-slate-400">{t("productLab.morality.noFixedPoints")}</p>}</div>}
                {theorem && <div className="rounded-xl border border-emerald-300/10 bg-emerald-300/5 p-4 text-xs leading-relaxed text-slate-300"><p className="font-semibold text-emerald-200">{t("productLab.morality.gradientTheorem")}</p><p className="mt-1">{String(asObject(theorem.gradient_sum_theorem)?.gradient_sum ?? "")}</p><p className="mt-2">{String(asObject(theorem.gradient_sum_theorem)?.interpretation ?? "")}</p></div>}
                {isSweepResult && <div><h3 className="mb-3 text-sm font-semibold text-slate-200">{t("productLab.morality.sweepResults")}</h3><SweepResultsChart result={result} /></div>}
                {result.analytical_audit_threshold !== undefined && <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">{t("productLab.morality.auditThreshold").replace("{value}", formatNumber(result.analytical_audit_threshold))}</p>}
                {trajectoryPoints.length === 0 && phasePoints.length === 0 && !history && !bands95 && !final && !equilibrium && !monteSummary && !bifurcationResult && !Array.isArray(result.fixed_points) && !theorem && !isSweepResult && <p className="text-sm text-slate-400">{t("productLab.morality.incompatible")}</p>}
              </div>
            )}
          </div>
        </div>

        <details className="mx-auto mt-8 max-w-5xl rounded-2xl border border-white/10 bg-[#101827] p-5 text-sm leading-relaxed text-slate-300">
          <summary className="cursor-pointer font-semibold text-white">{t("productLab.morality.assumptions")}</summary>
          <p className="mt-3">{t("productLab.morality.assumptionsText")}</p>
          <p className="mt-3 text-slate-400">{t("productLab.morality.reference")}</p>
        </details>
      </div>
    </section>
  );
}
