import {
  Funnel,
  GridNine,
  Lightning,
} from "@phosphor-icons/react";
import { useState } from "react";
import { conceptById } from "../data/concepts";
import type { ExperimentResult, PersonaId } from "../types";

type InsightTab = "funnel" | "segments" | "sensitivity";

const personaLabels: Record<PersonaId, string> = {
  ld_leader: "L&D leader",
  hr_exec: "HR exec",
  ai_lead: "AI lead",
  team_manager: "Team mgr",
  learner: "Learner",
};

const personaOrder: PersonaId[] = [
  "ld_leader",
  "hr_exec",
  "ai_lead",
  "team_manager",
  "learner",
];

interface FunnelStage {
  label: string;
  key: string;
}

const funnelStages: FunnelStage[] = [
  { label: "Visitors", key: "total" },
  { label: "Not bounced", key: "notBounced" },
  { label: "Deep scroll", key: "deepScroll" },
  { label: "Proof engaged", key: "proofEngaged" },
  { label: "Interaction", key: "interaction" },
  { label: "CTA clicked", key: "ctaClicked" },
  { label: "Demo done", key: "demoCompleted" },
  { label: "Qualified", key: "qualifiedDemo" },
];

function computeFunnel(result: ExperimentResult) {
  const conceptIds = result.metrics.map((m) => m.conceptId);
  return conceptIds.map((cid) => {
    const sessions = result.sessions.filter((s) => s.conceptId === cid);
    const total = sessions.length;
    return {
      conceptId: cid,
      stages: {
        total,
        notBounced: sessions.filter((s) => !s.bounced).length,
        deepScroll: sessions.filter((s) => s.scrollDepth >= 0.75).length,
        proofEngaged: sessions.filter((s) => s.proofEngaged).length,
        interaction: sessions.filter((s) => s.interactionCompleted).length,
        ctaClicked: sessions.filter((s) => s.ctaClicked).length,
        demoCompleted: sessions.filter((s) => s.demoCompleted).length,
        qualifiedDemo: sessions.filter((s) => s.qualifiedDemo).length,
      } as Record<string, number>,
      total,
    };
  });
}

function computeSegments(result: ExperimentResult) {
  const conceptIds = result.metrics.map((m) => m.conceptId);
  const grid: Record<string, { demos: number; total: number }> = {};

  for (const cid of conceptIds) {
    for (const pid of personaOrder) {
      grid[`${cid}:${pid}`] = { demos: 0, total: 0 };
    }
  }

  for (const session of result.sessions) {
    const key = `${session.conceptId}:${session.visitor.persona}`;
    if (grid[key]) {
      grid[key].total += 1;
      if (session.qualifiedDemo) grid[key].demos += 1;
    }
  }

  return { conceptIds, grid };
}

function computeSensitivity(result: ExperimentResult): Array<{
  label: string;
  baseWinner: string;
  shiftedWinner: string;
  changed: boolean;
  delta: number;
}> {
  // We don't re-run the simulation here (expensive), but we can compute
  // how much each assumption correlates with qualified demo outcomes
  // by analyzing the existing sessions
  const sessions = result.sessions;
  const conceptIds = result.metrics.map((m) => m.conceptId);
  const leadingConceptFor = (
    subset: ExperimentResult["sessions"],
  ): string => {
    const leader = conceptIds
      .map((conceptId) => {
        const conceptSessions = subset.filter(
          (session) => session.conceptId === conceptId,
        );
        return {
          conceptId,
          rate:
            conceptSessions.filter((session) => session.qualifiedDemo).length /
            (conceptSessions.length || 1),
        };
      })
      .sort((left, right) => right.rate - left.rate)[0];
    return conceptById[leader.conceptId].name;
  };

  // Analyze how different visitor traits correlate with conversion
  const traits: Array<{
    label: string;
    description: string;
    impact: number;
  }> = [];

  // Decision-maker impact
  const dmSessions = sessions.filter((s) => s.visitor.qualified);
  const nonDmSessions = sessions.filter((s) => !s.visitor.qualified);
  const dmRate = dmSessions.filter((s) => s.demoCompleted).length / (dmSessions.length || 1);
  const nonDmRate = nonDmSessions.filter((s) => s.demoCompleted).length / (nonDmSessions.length || 1);
  traits.push({
    label: "Decision-maker share",
    description: "Qualified buyers convert at higher rates",
    impact: dmRate - nonDmRate,
  });

  // ROI pain priority impact
  const roiSessions = sessions.filter((s) => s.visitor.pain === "roi");
  const nonRoiSessions = sessions.filter((s) => s.visitor.pain !== "roi");
  const roiRate = roiSessions.filter((s) => s.qualifiedDemo).length / (roiSessions.length || 1);
  const nonRoiRate = nonRoiSessions.filter((s) => s.qualifiedDemo).length / (nonRoiSessions.length || 1);
  traits.push({
    label: "ROI-priority share",
    description: `${leadingConceptFor(roiSessions)} leads ROI-priority visitors`,
    impact: roiRate - nonRoiRate,
  });

  // Trust pain priority impact
  const trustSessions = sessions.filter((s) => s.visitor.pain === "trust");
  const nonTrustSessions = sessions.filter((s) => s.visitor.pain !== "trust");
  const trustRate = trustSessions.filter((s) => s.qualifiedDemo).length / (trustSessions.length || 1);
  const nonTrustRate = nonTrustSessions.filter((s) => s.qualifiedDemo).length / (nonTrustSessions.length || 1);
  traits.push({
    label: "Research-priority share",
    description: `${leadingConceptFor(trustSessions)} leads research-priority visitors`,
    impact: trustRate - nonTrustRate,
  });

  // Mobile impact
  const mobileSessions = sessions.filter((s) => s.visitor.device === "mobile");
  const desktopSessions = sessions.filter((s) => s.visitor.device === "desktop");
  const mobileRate = mobileSessions.filter((s) => s.qualifiedDemo).length / (mobileSessions.length || 1);
  const desktopRate = desktopSessions.filter((s) => s.qualifiedDemo).length / (desktopSessions.length || 1);
  traits.push({
    label: "Mobile traffic share",
    description: "Mobile adds friction to demo completion",
    impact: mobileRate - desktopRate,
  });

  // High intent vs low intent
  const highIntent = sessions.filter((s) => s.visitor.intent > 0.6);
  const lowIntent = sessions.filter((s) => s.visitor.intent <= 0.6);
  const hiRate = highIntent.filter((s) => s.qualifiedDemo).length / (highIntent.length || 1);
  const loRate = lowIntent.filter((s) => s.qualifiedDemo).length / (lowIntent.length || 1);
  traits.push({
    label: "Visitor intent level",
    description: "High-intent visitors drive most conversions",
    impact: hiRate - loRate,
  });

  // Sort by absolute impact
  traits.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return traits.map((t) => ({
    label: t.label,
    baseWinner: t.description,
    shiftedWinner: "",
    changed: false,
    delta: t.impact,
  }));
}

function FunnelView({ result }: { result: ExperimentResult }) {
  const funnelData = computeFunnel(result);

  return (
    <div className="insight-funnel">
      <div className="funnel-header-row">
        <div className="funnel-stage-label" />
        {funnelData.map((fd) => {
          const concept = conceptById[fd.conceptId];
          return (
            <div className="funnel-concept-header" key={fd.conceptId}>
              <span style={{ backgroundColor: concept.color }}>
                {concept.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
      {funnelStages.map((stage, stageIndex) => {
        const maxValue = Math.max(
          ...funnelData.map((fd) => fd.stages[stage.key]),
        );
        return (
          <div className="funnel-row" key={stage.key}>
            <div className="funnel-stage-label">
              <span>{stage.label}</span>
            </div>
            {funnelData.map((fd) => {
              const value = fd.stages[stage.key];
              const pctOfTotal = ((value / fd.total) * 100).toFixed(1);
              const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const concept = conceptById[fd.conceptId];
              const prevKey =
                stageIndex > 0 ? funnelStages[stageIndex - 1].key : null;
              const prevValue = prevKey ? fd.stages[prevKey] : fd.total;
              const dropoff =
                prevValue > 0
                  ? (((prevValue - value) / prevValue) * 100).toFixed(0)
                  : "0";
              return (
                <div className="funnel-cell" key={fd.conceptId}>
                  <div className="funnel-bar-track">
                    <div
                      className="funnel-bar-fill"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: concept.color,
                      }}
                    />
                  </div>
                  <div className="funnel-cell-stats">
                    <strong>{value.toLocaleString()}</strong>
                    <span>
                      {stageIndex > 0 ? `${pctOfTotal}%` : ""}
                      {stageIndex > 0 && Number(dropoff) > 0 && (
                        <em> -{dropoff}%</em>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function SegmentView({ result }: { result: ExperimentResult }) {
  const { conceptIds, grid } = computeSegments(result);

  // Find max rate for color scaling
  let maxRate = 0;
  for (const cell of Object.values(grid)) {
    if (cell.total > 0) {
      const rate = cell.demos / cell.total;
      if (rate > maxRate) maxRate = rate;
    }
  }

  return (
    <div className="insight-segments">
      <div className="segment-grid">
        <div className="segment-corner" />
        {conceptIds.map((cid) => {
          const concept = conceptById[cid];
          return (
            <div className="segment-col-header" key={cid}>
              <span style={{ backgroundColor: concept.color }}>
                {concept.shortLabel}
              </span>
              <strong>{concept.name}</strong>
            </div>
          );
        })}
        {personaOrder.map((pid) => (
          <>
            <div className="segment-row-header" key={pid}>
              {personaLabels[pid]}
            </div>
            {conceptIds.map((cid) => {
              const cell = grid[`${cid}:${pid}`];
              const rate = cell.total > 0 ? cell.demos / cell.total : 0;
              const intensity =
                maxRate > 0 ? Math.min(1, rate / maxRate) : 0;
              const isQualified = ["ld_leader", "hr_exec", "ai_lead"].includes(
                pid,
              );
              return (
                <div
                  className="segment-cell"
                  key={`${cid}:${pid}`}
                  style={{
                    backgroundColor: isQualified
                      ? `rgba(189, 50, 146, ${intensity * 0.28})`
                      : `rgba(100, 116, 139, ${intensity * 0.15})`,
                  }}
                >
                  <strong>
                    {cell.total > 0 ? `${(rate * 100).toFixed(1)}%` : "—"}
                  </strong>
                  <span>
                    {cell.demos}/{cell.total}
                  </span>
                </div>
              );
            })}
          </>
        ))}
      </div>
      <div className="segment-legend">
        <span>
          <i style={{ backgroundColor: "rgba(189, 50, 146, 0.25)" }} />
          Qualified buyer personas
        </span>
        <span>
          <i style={{ backgroundColor: "rgba(100, 116, 139, 0.12)" }} />
          Non-target personas
        </span>
      </div>
    </div>
  );
}

function SensitivityView({ result }: { result: ExperimentResult }) {
  const factors = computeSensitivity(result);
  const maxAbsDelta = Math.max(...factors.map((f) => Math.abs(f.delta)));

  return (
    <div className="insight-sensitivity">
      <p className="sensitivity-intro">
        Impact of each visitor trait on qualified-demo conversion. Longer bars
        mean the assumption has more leverage over your experiment outcome.
      </p>
      {factors.map((factor) => {
        const barWidth =
          maxAbsDelta > 0
            ? (Math.abs(factor.delta) / maxAbsDelta) * 100
            : 0;
        const isPositive = factor.delta >= 0;
        return (
          <div className="sensitivity-row" key={factor.label}>
            <div className="sensitivity-label">
              <strong>{factor.label}</strong>
              <span>{factor.baseWinner}</span>
            </div>
            <div className="sensitivity-bar-wrap">
              <div
                className={`sensitivity-bar ${isPositive ? "positive" : "negative"}`}
                style={{ width: `${barWidth}%` }}
              />
              <span>
                {isPositive ? "+" : ""}
                {(factor.delta * 100).toFixed(1)}pp
              </span>
            </div>
          </div>
        );
      })}
      <div className="sensitivity-note">
        Values show the difference in qualified-demo rate between the high and
        low cohort for each trait. These are correlations from the current
        simulation, not causal claims.
      </div>
    </div>
  );
}

export function InsightsPanel({ result }: { result: ExperimentResult }) {
  const [tab, setTab] = useState<InsightTab>("funnel");

  return (
    <div className="insights-panel">
      <div className="insights-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "funnel"}
          className={tab === "funnel" ? "active" : ""}
          onClick={() => setTab("funnel")}
        >
          <Funnel weight="duotone" />
          Behavioral funnel
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "segments"}
          className={tab === "segments" ? "active" : ""}
          onClick={() => setTab("segments")}
        >
          <GridNine weight="duotone" />
          Segment heatmap
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "sensitivity"}
          className={tab === "sensitivity" ? "active" : ""}
          onClick={() => setTab("sensitivity")}
        >
          <Lightning weight="duotone" />
          Sensitivity
        </button>
      </div>

      <div className="insights-body" role="tabpanel">
        {tab === "funnel" && <FunnelView result={result} />}
        {tab === "segments" && <SegmentView result={result} />}
        {tab === "sensitivity" && <SensitivityView result={result} />}
      </div>
    </div>
  );
}
