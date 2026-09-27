import {
  CheckCircle,
  DownloadSimple,
  FileCsv,
  ShieldWarning,
  UploadSimple,
} from "@phosphor-icons/react";
import { useState, type ChangeEvent } from "react";

import {
  analyzeObservedExperiment,
  parseObservedCsv,
  type ObservedAnalysis,
} from "../lib/observed";
import type { DecisionPolicy } from "../types";

const example = `variant,sessions,qualified_meetings
Control,2000,80
Challenger,2000,130`;

function pct(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function points(value: number) {
  const amount = value * 100;
  return `${amount >= 0 ? "+" : ""}${amount.toFixed(2)} pts`;
}

function decisionCopy(analysis: ObservedAnalysis) {
  if (analysis.decision === "challenger") {
    return `${analysis.challenger.variant} clears the decision policy.`;
  }
  if (analysis.decision === "baseline") {
    return `${analysis.baseline.variant} retains the seat.`;
  }
  if (analysis.decision === "no_decision_volume") {
    return "No decision: collect more qualified outcomes in both arms.";
  }
  return "No decision: the observed evidence does not clear the lift threshold.";
}

export function ObservedExperimentPanel({ policy }: { policy: DecisionPolicy }) {
  const [csv, setCsv] = useState(example);
  const [analysis, setAnalysis] = useState<ObservedAnalysis | null>(null);
  const [error, setError] = useState("");

  function analyze() {
    try {
      setAnalysis(analyzeObservedExperiment(parseObservedCsv(csv), policy));
      setError("");
    } catch (caught) {
      setAnalysis(null);
      setError(caught instanceof Error ? caught.message : "The CSV could not be analyzed.");
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv") || file.size > 1_000_000) {
      setError("Choose a CSV file smaller than 1 MB.");
      return;
    }
    setCsv(await file.text());
    setAnalysis(null);
    setError("");
  }

  function downloadResult() {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify({ policy, analysis }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "evolve-observed-experiment.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <section className="observed-panel">
      <div className="observed-heading">
        <div>
          <span className="kicker"><FileCsv weight="duotone" /> Observed results</span>
          <h2>Bring the real experiment back.</h2>
          <p>
            Import aggregate A/B outcomes from your analytics stack. The file stays in
            this browser and is evaluated against the same decision contract above.
          </p>
        </div>
        <label className="observed-upload">
          <UploadSimple weight="bold" /> Import CSV
          <input type="file" accept=".csv,text/csv" onChange={importFile} />
        </label>
      </div>

      <div className="observed-workspace">
        <div>
          <label className="observed-input">
            <span>Two-arm summary · first row is the baseline</span>
            <textarea value={csv} onChange={(event) => setCsv(event.target.value)} spellCheck={false} />
          </label>
          {error ? <p className="observed-error" role="alert">{error}</p> : null}
          <button className="observed-primary" type="button" onClick={analyze}>
            Analyze observed results
          </button>
        </div>

        {analysis ? (
          <div className="observed-result">
            <div className={`observed-verdict is-${analysis.decision}`}>
              {analysis.decision === "challenger" || analysis.decision === "baseline" ? (
                <CheckCircle weight="fill" />
              ) : (
                <ShieldWarning weight="fill" />
              )}
              <div><span>Decision</span><strong>{decisionCopy(analysis)}</strong></div>
            </div>
            <div className="observed-metrics">
              <article><span>{analysis.baseline.variant}</span><strong>{pct(analysis.baselineRate, 2)}</strong><small>{analysis.baseline.qualifiedMeetings} / {analysis.baseline.sessions}</small></article>
              <article><span>{analysis.challenger.variant}</span><strong>{pct(analysis.challengerRate, 2)}</strong><small>{analysis.challenger.qualifiedMeetings} / {analysis.challenger.sessions}</small></article>
              <article><span>P(practical lift)</span><strong>{pct(analysis.probabilityOfPracticalLift, 0)}</strong><small>{points(analysis.upliftLow)} to {points(analysis.upliftHigh)}</small></article>
            </div>
            {analysis.sampleRatioMismatch ? <p className="observed-warning">Allocation differs by more than 10%; investigate sample-ratio mismatch before shipping.</p> : null}
            <button className="observed-export" type="button" onClick={downloadResult}><DownloadSimple weight="bold" /> Export decision record</button>
          </div>
        ) : (
          <div className="observed-empty">
            <ShieldWarning weight="duotone" />
            <strong>No result is assumed.</strong>
            <p>Analyze an observed export to get a decision, uncertainty interval, volume check, and allocation guardrail.</p>
          </div>
        )}
      </div>
    </section>
  );
}
