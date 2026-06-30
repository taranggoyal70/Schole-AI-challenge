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

function noDecisionReason(result: ExperimentResult) {
  if (result.decision === "no_decision_volume") {
    return "Every arm must reach the declared qualified-meeting volume before a decision.";
  }
  if (result.decision === "no_decision_probability") {
    return "The observed leader has not cleared the multi-arm probability threshold.";
  }
  return "Neither side has established the declared minimum worthwhile lift with enough probability.";
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
  const policy = result.design.policy;
  const baseline = conceptById[result.design.baselineId];
  const decisionMetric =
    result.metrics.find((metric) => metric.conceptId === result.winnerId) ??
    [...result.metrics].sort(
      (a, b) => b.qualifiedDemoRate - a.qualifiedDemoRate,
    )[0];
  const rankedMetrics = [...result.metrics].sort(
    (a, b) => b.qualifiedDemoRate - a.qualifiedDemoRate,
  );
  const observedLeader = rankedMetrics[0];
  const challenger = result.metrics.find(
    (metric) => metric.conceptId !== result.design.baselineId,
  );
  const practicalLiftPass =
    result.design.mode === "pairwise"
      ? Boolean(
          challenger &&
            (challenger.probabilityOfPracticalLift >=
              policy.minimumProbabilityOfPracticalLift ||
              challenger.probabilityBaselineHasPracticalLift >=
                policy.minimumProbabilityOfPracticalLift),
        )
      : observedLeader.conceptId === result.design.baselineId
        ? rankedMetrics[1].probabilityBaselineHasPracticalLift >=
          policy.minimumProbabilityOfPracticalLift
        : observedLeader.probabilityOfPracticalLift >=
          policy.minimumProbabilityOfPracticalLift;
  const probabilityBestPass =
    observedLeader.probabilityBest >= policy.minimumProbabilityBest;
  const volumePass = result.metrics.every(
    (metric) =>
      metric.qualifiedDemos >= policy.minimumQualifiedDemosPerArm,
  );

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
              ? "The complete volume, probability, and practical-lift policy is satisfied."
              : noDecisionReason(result)}
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
              <strong>Qualified meeting conversion rate</strong>
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
                  formatter={(value) => [
                    `${Number(value).toFixed(2)}%`,
                    "Qualified meetings",
                  ]}
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
            {
              value:
              `≥${percent(policy.minimumProbabilityOfPracticalLift, 0)}`,
              label: `P(lift ≥ ${percent(policy.minimumPracticalLift, 2)} vs. ${baseline.name})`,
              passes: practicalLiftPass,
            },
            {
              value:
              `≥${percent(policy.minimumProbabilityBest, 0)}`,
              label: result.design.mode === "multi_arm"
                ? "Probability of being best"
                : "Discovery-only P(best) threshold",
              passes:
                result.design.mode === "multi_arm"
                  ? probabilityBestPass
                  : null,
            },
            {
              value:
              `≥${policy.minimumQualifiedDemosPerArm}/arm`,
              label: "Qualified meetings in every arm",
              passes: volumePass,
            },
            {
              value: result.sampleRatioMismatch ? "Fail" : "Pass",
              label: "Blocked-allocation integrity",
              passes: !result.sampleRatioMismatch,
            },
          ].map((item) => (
            <div className="threshold-row" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              {item.passes === null ? (
                <Info weight="fill" />
              ) : item.passes ? (
                <CheckCircle weight="fill" />
              ) : (
                <WarningCircle weight="fill" />
              )}
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
                <th>Qualified meetings</th>
                <th>Meeting rate</th>
                <th>Lead quality</th>
                <th>P(practical lift)</th>
                <th>95% uplift interval</th>
                <th>P(best)</th>
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
                  <td>{percent(row.qualificationRate, 0)}</td>
                  <td>
                    {row.conceptId === result.design.baselineId
                      ? "Baseline"
                      : percent(row.probabilityOfPracticalLift, 0)}
                  </td>
                  <td>
                    {row.conceptId === result.design.baselineId
                      ? "—"
                      : `${percent(row.upliftLow, 2)}–${percent(row.upliftHigh, 2)}`}
                  </td>
                  <td>{percent(row.probabilityBest, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!compact && (
        <div className="guardrail-readout">
          <div>
            <span>Quality diagnostics · {conceptById[decisionMetric.conceptId].name}</span>
            <strong>Primary outcome with funnel and device context</strong>
          </div>
          <dl>
            <div>
              <dt>Lead qualification</dt>
              <dd>{percent(decisionMetric.qualificationRate, 0)}</dd>
            </div>
            <div>
              <dt>Unqualified meetings</dt>
              <dd>{percent(decisionMetric.unqualifiedDemoShare, 0)}</dd>
            </div>
            <div>
              <dt>Mobile meeting rate</dt>
              <dd>{percent(decisionMetric.mobileQualifiedDemoRate, 2)}</dd>
            </div>
            <div>
              <dt>Desktop meeting rate</dt>
              <dd>{percent(decisionMetric.desktopQualifiedDemoRate, 2)}</dd>
            </div>
          </dl>
          <p>
            These diagnostics expose lead-quality or device regressions; they
            do not secretly override the declared winner policy.
          </p>
        </div>
      )}
    </div>
  );
}
