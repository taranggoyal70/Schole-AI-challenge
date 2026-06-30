import {
  ArrowsClockwise,
  CheckCircle,
  Flask,
  MagnifyingGlass,
  Play,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { conceptById, concepts } from "../data/concepts";
import {
  ROBUSTNESS_COHORT_COUNT,
  ROBUSTNESS_SEED_STRIDE,
  robustnessConfigSignature,
  runRobustnessCohort,
  summarizeRobustnessStudy,
  type RobustnessCohort,
  type RobustnessStudy,
} from "../lib/robustness";
import type { DecisionPolicy, SimulatorConfig } from "../types";

function pct(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

function signedPoints(value: number) {
  const points = value * 100;
  return `${points >= 0 ? "+" : ""}${points.toFixed(2)} pts`;
}

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      channel.port2.close();
      resolve();
    };
    channel.port2.postMessage(undefined);
  });
}

function decisionExplanation(cohort: RobustnessCohort, mode: "discovery" | "holdout") {
  const decision =
    mode === "discovery"
      ? cohort.discovery.decision
      : cohort.holdout.decision;

  if (decision === "no_decision_practical") {
    return "The observed leader has not established the declared minimum worthwhile lift.";
  }
  if (decision === "no_decision_probability") {
    return "The observed leader has not cleared every declared probability threshold.";
  }
  if (decision === "no_decision_volume") {
    return "The cohort has not produced the minimum number of qualified demos.";
  }
  return "This cohort clears the complete probability, practical-lift, and volume policy.";
}

export function RobustnessObservatory({
  config,
  policy,
  onInspectSeed,
}: {
  config: SimulatorConfig;
  policy: DecisionPolicy;
  onInspectSeed: (seed: number) => void;
}) {
  const [study, setStudy] = useState<RobustnessStudy | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [counterexampleMode, setCounterexampleMode] = useState<
    "discovery" | "holdout"
  >("holdout");
  const runToken = useRef(0);
  const currentSignature = robustnessConfigSignature(config, policy);
  const isStale = Boolean(
    study && study.configSignature !== currentSignature,
  );
  const projectedSessions =
    ROBUSTNESS_COHORT_COUNT *
    config.sessionsPerVariant *
    (concepts.length + 2);

  useEffect(
    () => () => {
      runToken.current += 1;
    },
    [],
  );

  async function runStudy() {
    const token = runToken.current + 1;
    runToken.current = token;
    const snapshot = { ...config };
    const policySnapshot = { ...policy };
    const cohorts: RobustnessCohort[] = [];

    setIsRunning(true);
    setProgress(0);

    for (let index = 0; index < ROBUSTNESS_COHORT_COUNT; index += 1) {
      cohorts.push(runRobustnessCohort(snapshot, index, policySnapshot));
      if (runToken.current !== token) return;
      setProgress(index + 1);

      if ((index + 1) % 2 === 0) {
        await yieldToBrowser();
      }
    }

    if (runToken.current !== token) return;
    setStudy(summarizeRobustnessStudy(snapshot, cohorts, policySnapshot));
    setCounterexampleMode("holdout");
    setIsRunning(false);
  }

  const discoveryRows = study
    ? [
        ...concepts.map((concept) => ({
          id: concept.id,
          label: `Variant ${concept.shortLabel}`,
          name: concept.name,
          color: concept.color,
          count:
            concept.id === "evolved"
              ? 0
              : study.discoveryCounts[concept.id],
        })),
        {
          id: "no_decision",
          label: "Policy",
          name: "No decision",
          color: "#7b8793",
          count: study.discoveryCounts.no_decision,
        },
      ]
    : [];

  const selectedCounterexample =
    counterexampleMode === "discovery"
      ? study?.discoveryCounterexample
      : study?.holdoutCounterexample;
  const studyIncumbent = study ? conceptById[study.incumbentId] : null;

  return (
    <section
      className="robustness-observatory"
      aria-labelledby="robustness-title"
      aria-busy={isRunning}
    >
      <div className="robustness-heading">
        <div>
          <span className="kicker">
            <ShieldCheck weight="duotone" />
            Robustness observatory
          </span>
          <h2 id="robustness-title">
            One seed can flatter you. Fifty have to agree.
          </h2>
          <p>
            Repeat discovery and holdout across independent deterministic
            cohorts. Stability matters; honest exceptions matter more.
          </p>
        </div>
        <div className="robustness-action">
          <button type="button" onClick={runStudy} disabled={isRunning}>
            {isRunning ? (
              <ArrowsClockwise className="spin" weight="bold" />
            ) : study ? (
              <ArrowsClockwise weight="bold" />
            ) : (
              <Play weight="fill" />
            )}
            {isRunning
              ? `Testing cohort ${progress} / ${ROBUSTNESS_COHORT_COUNT}`
              : study
                ? "Rerun current assumptions"
                : `Stress-test ${ROBUSTNESS_COHORT_COUNT} cohorts`}
          </button>
          <small>
            {projectedSessions.toLocaleString()} synthetic sessions · no API
          </small>
        </div>
      </div>

      {isRunning && (
        <div className="robustness-progress" role="status" aria-live="polite">
          <div>
            <i
              style={{
                width: `${(progress / ROBUSTNESS_COHORT_COUNT) * 100}%`,
              }}
            />
          </div>
          <span>
            Running discovery and unseen holdout for seed{" "}
            {config.seed +
              Math.max(0, progress - 1) * ROBUSTNESS_SEED_STRIDE}
          </span>
        </div>
      )}

      {!study && !isRunning && (
        <div className="robustness-empty">
          <Flask weight="duotone" />
          <div>
            <strong>Test whether the headline result survives repetition.</strong>
            <span>
              The study keeps every assumption fixed and changes only the
              reproducible cohort seed.
            </span>
          </div>
        </div>
      )}

      {study && (
        <div className="robustness-results">
          {isStale && (
            <div className="robustness-stale" role="status">
              <WarningCircle weight="fill" />
              Inputs changed after this study. Results remain inspectable; rerun
              to test the current assumptions.
            </div>
          )}

          <div className="robustness-kpis">
            <article>
              <span>Incumbent stability</span>
              <strong>{pct(study.incumbentStability)}</strong>
              <small>
                {studyIncumbent?.name} selected in{" "}
                {study.discoveryCounts[study.incumbentId]}/
                {study.cohortCount} cohorts
              </small>
            </article>
            <article>
              <span>Valid no-decisions</span>
              <strong>{pct(study.discoveryNoDecisionRate)}</strong>
              <small>
                {study.discoveryCounts.no_decision}/{study.cohortCount} discovery
                cohorts refused to crown a winner
              </small>
            </article>
            <article>
              <span>Challenger holdout</span>
              <strong>{pct(study.challengerHoldoutRate)}</strong>
              <small>
                The challenger cleared {study.holdoutCounts.challenger}/
                {study.cohortCount} unseen cohorts
              </small>
            </article>
            <article>
              <span>Average holdout uplift</span>
              <strong>{signedPoints(study.averageChallengerUplift)}</strong>
              <small>
                Across {study.totalSessions.toLocaleString()} simulated sessions
              </small>
            </article>
          </div>

          <div className="robustness-grid">
            <article className="stability-card">
              <header>
                <div>
                  <span>Discovery winner distribution</span>
                  <strong>Did the incumbent depend on a lucky draw?</strong>
                </div>
                <small>
                  Seeds {study.seedStart}–{study.seedEnd}
                </small>
              </header>
              <div className="stability-bars">
                {discoveryRows.map((row) => (
                  <div className="stability-row" key={row.id}>
                    <span>{row.label}</span>
                    <div>
                      <i
                        style={{
                          width: `${(row.count / study.cohortCount) * 100}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </div>
                    <strong>{row.count}</strong>
                    <small>{row.name}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="holdout-reliability-card">
              <header>
                <span>Holdout reliability</span>
                <strong>Exceptions are part of the result.</strong>
              </header>
              <div
                className="holdout-stack"
                aria-label={`${study.holdoutCounts.challenger} challenger wins, ${study.holdoutCounts.incumbent} incumbent wins, ${study.holdoutCounts.no_decision} no decisions`}
              >
                <i
                  className="challenger"
                  style={{
                    width: `${(study.holdoutCounts.challenger / study.cohortCount) * 100}%`,
                  }}
                />
                <i
                  className="incumbent"
                  style={{
                    width: `${(study.holdoutCounts.incumbent / study.cohortCount) * 100}%`,
                  }}
                />
                <i
                  className="no-decision"
                  style={{
                    width: `${(study.holdoutCounts.no_decision / study.cohortCount) * 100}%`,
                  }}
                />
              </div>
              <div className="holdout-legend">
                <span>
                  <i className="challenger" />
                  Challenger <strong>{study.holdoutCounts.challenger}</strong>
                </span>
                <span>
                  <i className="incumbent" />
                  Incumbent <strong>{study.holdoutCounts.incumbent}</strong>
                </span>
                <span>
                  <i className="no-decision" />
                  No decision <strong>{study.holdoutCounts.no_decision}</strong>
                </span>
              </div>
              <p>
                Repeated synthetic cohorts test model stability—not real-market
                lift. A real randomized experiment remains the shipping gate.
              </p>
            </article>
          </div>

          <article className="counterexample-card">
            <div className="counterexample-header">
              <div>
                <span>Counterexample inspector</span>
                <strong>Open the run that resists the tidy story.</strong>
              </div>
              <div
                className="counterexample-tabs"
                role="group"
                aria-label="Counterexample type"
              >
                <button
                  type="button"
                  aria-pressed={counterexampleMode === "discovery"}
                  onClick={() => setCounterexampleMode("discovery")}
                >
                  Discovery exception
                </button>
                <button
                  type="button"
                  aria-pressed={counterexampleMode === "holdout"}
                  onClick={() => setCounterexampleMode("holdout")}
                >
                  Holdout exception
                </button>
              </div>
            </div>

            {selectedCounterexample ? (
              <div className="counterexample-detail" aria-live="polite">
                <div className="counterexample-seed">
                  <WarningCircle weight="duotone" />
                  <span>Inspectable seed</span>
                  <strong>{selectedCounterexample.seed}</strong>
                </div>
                <div className="counterexample-copy">
                  <span>
                    {counterexampleMode === "discovery"
                      ? selectedCounterexample.discovery.winnerId
                        ? `${conceptById[selectedCounterexample.discovery.winnerId].name} wins`
                        : "Discovery returns no winner"
                      : selectedCounterexample.holdout.winnerId ===
                          selectedCounterexample.holdout.incumbentId
                        ? "Incumbent retains the seat"
                        : "Holdout returns no decision"}
                  </span>
                  <strong>
                    {decisionExplanation(
                      selectedCounterexample,
                      counterexampleMode,
                    )}
                  </strong>
                  <small>
                    {counterexampleMode === "discovery"
                      ? `${conceptById[selectedCounterexample.discovery.leaderId].name} leads at ${pct(selectedCounterexample.discovery.leaderRate, 2)} with ${pct(selectedCounterexample.discovery.leaderProbabilityBest)} probability best.`
                      : `${conceptById[selectedCounterexample.holdout.challengerId].name}: ${pct(selectedCounterexample.holdout.challengerRate, 2)} vs. ${conceptById[selectedCounterexample.holdout.incumbentId].name}: ${pct(selectedCounterexample.holdout.incumbentRate, 2)} · uplift interval ${signedPoints(selectedCounterexample.holdout.challengerUpliftLow)} to ${signedPoints(selectedCounterexample.holdout.challengerUpliftHigh)}.`}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onInspectSeed(selectedCounterexample.seed);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <MagnifyingGlass weight="bold" />
                  Inspect seed in Lab
                </button>
              </div>
            ) : (
              <div className="counterexample-clean">
                <CheckCircle weight="fill" />
                No exception appeared in this 50-cohort study.
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
