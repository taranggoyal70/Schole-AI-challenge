import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  DownloadSimple,
  ShieldCheck,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { conceptById } from "../data/concepts";
import type { ExperimentResult, SimulatorConfig } from "../types";

function pct(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function exportPlan(
  discovery: ExperimentResult,
  holdout: ExperimentResult,
) {
  const incumbent = discovery.winnerId
    ? conceptById[discovery.winnerId]
    : null;
  const challengerMetric = holdout.metrics.find(
    (metric) => metric.conceptId === "evolved",
  );
  const plan = `# Scholé landing-page follow-up experiment

## Decision

Test the generated challenger **Variant F: The adoption plan** against ${
    incumbent ? `Variant ${incumbent.shortLabel}: ${incumbent.name}` : "the current incumbent"
  }.

## Hypothesis

Combining ROI urgency, an adoption diagnostic, and research-backed proof will increase qualified-demo conversion without sacrificing traffic quality.

## Audience

HR, L&D, and AI transformation leaders at 200–2,000-person organizations that already provide AI tools but cannot prove broad employee adoption.

## Allocation

- 50% incumbent
- 50% generated challenger
- Randomize by unique visitor
- Keep acquisition source and geography as analysis dimensions

## Primary outcome

Qualified demos / randomized unique visitors.

## Diagnostics

- Hero-to-diagnostic start rate
- Diagnostic completion
- Deep-scroll rate
- CTA-to-demo completion

## Guardrails

- Unqualified demo share
- Mobile completion
- Page performance
- Sample-ratio mismatch

## Decision policy

- ≥90% probability of beating incumbent
- ≥80% probability of being best
- Positive 95% credible interval for uplift
- ≥20 qualified demos per arm
- Otherwise: no decision, continue collecting

## Synthetic holdout result

- Challenger qualified-demo rate: ${challengerMetric ? pct(challengerMetric.qualifiedDemoRate, 2) : "n/a"}
- Probability best: ${challengerMetric ? pct(challengerMetric.probabilityBest, 0) : "n/a"}

> Synthetic results validate the system mechanics, not real-market lift.
`;

  const blob = new Blob([plan], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "schole-follow-up-experiment.md";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function HoldoutStage({
  discovery,
  holdout,
}: {
  discovery: ExperimentResult;
  holdout: ExperimentResult;
}) {
  const [exported, setExported] = useState(false);
  const incumbent = holdout.metrics.find((metric) => metric.conceptId === "roi")!;
  const challenger = holdout.metrics.find(
    (metric) => metric.conceptId === "evolved",
  )!;
  const maxRate = Math.max(
    incumbent.qualifiedDemoRate,
    challenger.qualifiedDemoRate,
  );
  const challengerPassed = holdout.winnerId === "evolved";
  const incumbentWon = holdout.winnerId === "roi";

  return (
    <div className="stage-content holdout-stage">
      <div className="stage-heading">
        <span className="kicker">
          <ShieldCheck weight="duotone" />
          Holdout gauntlet · Unseen traffic mix
        </span>
        <h1>The challenger has to generalize.</h1>
        <p>
          We shift the cohort toward skeptical enterprise buyers, more research
          scrutiny, and heavier mobile traffic. No gene was selected using this
          holdout.
        </p>
      </div>

      <div className="holdout-layout">
        <div className="holdout-card">
          <div className="holdout-shift">
            <span>
              Decision makers
              <strong>+10 pts</strong>
            </span>
            <span>
              Research priority
              <strong>+18 pts</strong>
            </span>
            <span>
              Mobile traffic
              <strong>+14 pts</strong>
            </span>
          </div>

          <div className="duel">
            {[incumbent, challenger].map((metric) => {
              const concept = conceptById[metric.conceptId];
              const width = (metric.qualifiedDemoRate / maxRate) * 100;
              return (
                <div className="duel-row" key={metric.conceptId}>
                  <div className="duel-label">
                    <span style={{ backgroundColor: concept.color }}>
                      {concept.shortLabel}
                    </span>
                    <div>
                      <strong>{concept.name}</strong>
                      <small>
                        {metric.conceptId === "roi" ? "Incumbent" : "Challenger"}
                      </small>
                    </div>
                  </div>
                  <div className="duel-track">
                    <motion.i
                      style={{ backgroundColor: concept.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <strong>{pct(metric.qualifiedDemoRate, 2)}</strong>
                </div>
              );
            })}
          </div>

          <div
            className={`holdout-verdict ${challengerPassed ? "is-pass" : "is-pending"}`}
          >
            {challengerPassed ? (
              <CheckCircle weight="fill" />
            ) : (
              <WarningCircle weight="fill" />
            )}
            <div>
              <span>
                {challengerPassed
                  ? "Challenger clears the holdout"
                  : incumbentWon
                    ? "Incumbent retains the seat"
                    : "Holdout returns no decision"}
              </span>
              <strong>
                {pct(challenger.probabilityBest, 0)} probability best ·{" "}
                {pct(challenger.upliftLow, 2)} to {pct(challenger.upliftHigh, 2)}{" "}
                uplift interval
              </strong>
            </div>
          </div>
        </div>

        <aside className="ship-card">
          <span className="ship-icon">
            <Sparkle weight="fill" />
          </span>
          <span className="kicker">The operator handoff</span>
          <h2>Turn the demo into a real experiment.</h2>
          <p>
            Export the production hypothesis, allocation, instrumentation,
            guardrails, and stopping policy.
          </p>
          <button
            type="button"
            onClick={() => {
              exportPlan(discovery, holdout);
              setExported(true);
            }}
          >
            {exported ? (
              <CheckCircle weight="fill" />
            ) : (
              <DownloadSimple weight="bold" />
            )}
            {exported ? "Plan downloaded" : "Export experiment plan"}
          </button>
          <small>
            Markdown · Contains no synthetic visitor records
          </small>
        </aside>
      </div>

      <div className="final-loop">
        <span>
          <strong>Discover</strong>
          Concept tournament
        </span>
        <ArrowRight weight="bold" />
        <span>
          <strong>Generate</strong>
          Evidence + mutation
        </span>
        <ArrowRight weight="bold" />
        <span>
          <strong>Validate</strong>
          Unseen holdout
        </span>
        <ArrowRight weight="bold" />
        <span className="active">
          <strong>Ship</strong>
          Real randomized test
        </span>
        <ArrowDown className="mobile-loop-arrow" weight="bold" />
      </div>
    </div>
  );
}
