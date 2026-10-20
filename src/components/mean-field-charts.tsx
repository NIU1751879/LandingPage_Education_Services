"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

export type MeanFieldTrajectoryPoint = {
  time: number;
  z: number;
  mL: number;
  mD: number;
  R: number;
};

export type MeanFieldPhasePoint = {
  z: number;
  mL: number;
  dz: number;
  dmL: number;
  nullcline_dz: boolean;
  nullcline_dmL: boolean;
  mD: number;
  R: number;
};

const axisStyle = { fill: "#94a3b8", fontSize: 12 };

export function MeanFieldTrajectoryChart({
  points,
}: {
  points: MeanFieldTrajectoryPoint[];
}) {
  const { t } = useLanguage();
  return (
    <div className="h-[320px] w-full" role="img" aria-label={t("productLab.morality.trajectory")}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
          <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} tick={axisStyle} tickLine={false} axisLine={{ stroke: "#475569" }} label={{ value: t("productLab.charts.time"), position: "insideBottom", offset: -4, fill: "#94a3b8" }} />
          <YAxis type="number" domain={[0, 1]} tick={axisStyle} tickLine={false} axisLine={{ stroke: "#475569" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0b1220", borderColor: "rgba(255,255,255,0.15)", borderRadius: 12, color: "#e2e8f0" }}
            labelFormatter={(value) => t("productLab.charts.timeValue").replace("{value}", Number(value).toFixed(2))}
            formatter={(value, name) => [Number(value).toFixed(4), name]}
          />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          <Line type="monotone" dataKey="z" name={t("productLab.charts.otherRegarding")} stroke="#8b9bff" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line type="monotone" dataKey="mL" name={t("productLab.charts.local")} stroke="#60d8bd" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line type="monotone" dataKey="mD" name={t("productLab.charts.distant")} stroke="#f59e0b" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line type="monotone" dataKey="R" name={t("productLab.charts.reputation")} stroke="#fb7185" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MeanFieldPhaseFieldChart({
  points,
}: {
  points: MeanFieldPhasePoint[];
}) {
  const { t } = useLanguage();
  const positiveDz = points.filter((point) => point.dz >= 0 && !point.nullcline_dz);
  const negativeDz = points.filter((point) => point.dz < 0 && !point.nullcline_dz);
  const dzNullcline = points.filter((point) => point.nullcline_dz);
  const dmLNullcline = points.filter((point) => point.nullcline_dmL);

  return (
    <div className="h-[360px] w-full" role="img" aria-label={t("productLab.charts.phaseChart")}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 16, left: 4, bottom: 16 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
          <XAxis type="number" dataKey="z" name="z" domain={[0, 1]} tick={axisStyle} tickLine={false} axisLine={{ stroke: "#475569" }} label={{ value: t("productLab.charts.z"), position: "insideBottom", offset: -8, fill: "#94a3b8" }} />
          <YAxis type="number" dataKey="mL" name="mL" domain={[0, 1]} tick={axisStyle} tickLine={false} axisLine={{ stroke: "#475569" }} label={{ value: t("productLab.charts.mL"), angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ backgroundColor: "#0b1220", borderColor: "rgba(255,255,255,0.15)", borderRadius: 12, color: "#e2e8f0" }}
            formatter={(value, name) => [
              typeof value === "number" ? value.toExponential(3) : value,
              name,
            ]}
          />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
          <Scatter name={t("productLab.charts.positiveDz")} data={positiveDz} fill="#fb7185" isAnimationActive={false} />
          <Scatter name={t("productLab.charts.negativeDz")} data={negativeDz} fill="#60a5fa" isAnimationActive={false} />
          <Scatter name={t("productLab.charts.dzNullcline")} data={dzNullcline} fill="#f8fafc" shape="cross" isAnimationActive={false} />
          <Scatter name={t("productLab.charts.dmLNullcline")} data={dmLNullcline} fill="#fbbf24" shape="diamond" isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
