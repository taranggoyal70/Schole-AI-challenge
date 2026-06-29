import {
  CheckCircle,
  Info,
  Medal,
  TrendUp,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { conceptById } from "../data/concepts";
import type { ExperimentResult } from "../types";

function percent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function ResultsPanel({
  result,
  compact = false,
}: {
  result: ExperimentResult;
  compact?: boolean;
}) {
  const rows = result.metrics.map((metric) => ({
    ...metric,
    name: conceptById[metric.conceptId].name,
    color: conceptById[metric.conceptId].color,
    ratePct: metric.qualifiedDemoRate * 100,
  }));
  const winner = result.winnerId ? conceptById[result.winnerId] : null;

  return (
    <div className={`results-panel ${compact ? "is-compact" : ""}`}>
      <div className="decision-banner" aria-live="polite">
        <div className={winner ? "decision-icon is-winner" : "decision-icon"}>
          {winner ? <Medal weight="duotone" /> : <WarningCircle weight="duotone" />}
        </div>
        <div>
          <span>Decision</span>
          <strong>
            {winner
              ? `Variant ${winner.shortLabel}: ${winner.name}`
              : "No winner yet"}
          </strong>
          <p>
            {winner
              ? "Evidence threshold met. Use this concept as the incumbent for generation."
              : "The leading concept has not cleared every probability, interval, and volume threshold."}
          </p>
        </div>
        {winner && (
          <div className="winner-confidence">
            <CheckCircle weight="fill" />
            <span>
              {percent(
                result.metrics.find(
                  (metric) => metric.conceptId === winner.id,
                )!.probabilityBest,
                0,
              )}{" "}
              probability best
            </span>
          </div>
        )}
      </div>

      <div className="results-body">
        <div className="chart-card">
          <div className="card-heading">
            <div>
              <span>Primary outcome</span>
              <strong>Qualified-demo rate</strong>
            </div>
            <span className="synthetic-pill">
              <Info weight="fill" />
              Synthetic
            </span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece7e9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  unit="%"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(190, 47, 145, 0.05)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #eee4e8",
                    boxShadow: "0 12px 36px rgba(15,23,42,.08)",
                  }}
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, "Qualified demos"]}
                />
                <Bar dataKey="ratePct" radius={[8, 8, 2, 2]}>
                  {rows.map((entry) => (
                    <Cell key={entry.conceptId} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="threshold-card">
          <div className="card-heading">
            <div>
              <span>Selection policy</span>
              <strong>A winner must earn the title</strong>
            </div>
            <TrendUp weight="duotone" />
          </div>
          {[
            ["≥90%", "Probability vs. control"],
            ["≥80%", "Probability of being best"],
            [">0", "95% uplift interval"],
            ["≥20", "Qualified demos"],
          ].map(([value, label]) => (
            <div className="threshold-row" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
              <CheckCircle weight="fill" />
            </div>
          ))}
          <p>
            “No decision” is a valid state. The system never crowns the largest
            observed percentage by default.
          </p>
        </div>
      </div>

      {!compact && (
        <div className="metrics-table-wrap">
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Concept</th>
                <th>Qualified demos</th>
                <th>Demo rate</th>
                <th>95% credible interval</th>
                <th>P(best)</th>
                <th>Deep scroll</th>
                <th>CTA rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.conceptId}
                  className={result.winnerId === row.conceptId ? "is-winner" : ""}
                >
                  <td>
                    <i style={{ backgroundColor: row.color }} />
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.qualifiedDemos}</td>
                  <td>{percent(row.qualifiedDemoRate, 2)}</td>
                  <td>
                    {percent(row.credibleLow, 2)}–{percent(row.credibleHigh, 2)}
                  </td>
                  <td>{percent(row.probabilityBest, 0)}</td>
                  <td>{percent(row.deepScrollRate, 0)}</td>
                  <td>{percent(row.ctaRate, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
