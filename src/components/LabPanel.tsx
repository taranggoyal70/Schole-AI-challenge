import {
  ArrowClockwise,
  Info,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import type {
  DecisionPolicy,
  ExperimentResult,
  SimulatorConfig,
} from "../types";
import { RobustnessObservatory } from "./RobustnessObservatory";
import { ResultsPanel } from "./ResultsPanel";

interface SliderDefinition {
  key: keyof Pick<
    SimulatorConfig,
    | "sessionsPerVariant"
    | "decisionMakerShare"
    | "roiPriority"
    | "trustPriority"
    | "mobileShare"
  >;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}

const sliders: SliderDefinition[] = [
  {
    key: "sessionsPerVariant",
    label: "Sessions per concept",
    description: "Controls evidence volume.",
    min: 400,
    max: 5000,
    step: 200,
    format: (value) => value.toLocaleString(),
  },
  {
    key: "decisionMakerShare",
    label: "Decision-maker traffic",
    description: "HR, L&D, and AI transformation leaders.",
    min: 0.45,
    max: 0.9,
    step: 0.01,
    format: (value) => `${Math.round(value * 100)}%`,
  },
  {
    key: "roiPriority",
    label: "ROI-first buyers",
    description: "Visitors most concerned about tool utilization.",
    min: 0.15,
    max: 0.7,
    step: 0.01,
    format: (value) => `${Math.round(value * 100)}%`,
  },
  {
    key: "trustPriority",
    label: "Research-first buyers",
    description: "Visitors seeking scientific and enterprise proof.",
    min: 0.08,
    max: 0.55,
    step: 0.01,
    format: (value) => `${Math.round(value * 100)}%`,
  },
  {
    key: "mobileShare",
    label: "Mobile traffic",
    description: "Adds form and attention friction.",
    min: 0.1,
    max: 0.75,
    step: 0.01,
    format: (value) => `${Math.round(value * 100)}%`,
  },
];

export function LabPanel({
  config,
  policy,
  result,
  onConfig,
  onPolicy,
  onRerun,
}: {
  config: SimulatorConfig;
  policy: DecisionPolicy;
  result: ExperimentResult;
  onConfig: (config: SimulatorConfig) => void;
  onPolicy: (policy: DecisionPolicy) => void;
  onRerun: () => void;
}) {
  return (
    <main className="lab-page">
      <div className="lab-heading">
        <div>
          <span className="kicker">
            <SlidersHorizontal weight="duotone" />
            Counterfactual lab
          </span>
          <h1>Challenge the assumptions.</h1>
          <p>
            Change the synthetic traffic mix and evidence volume. A robust
            system should sometimes change its mind—and sometimes refuse to
            decide.
          </p>
        </div>
        <div className="lab-seed">
          <span>Seed</span>
          <strong>{config.seed}</strong>
          <button type="button" onClick={onRerun}>
            <ArrowClockwise weight="bold" />
            New cohort
          </button>
        </div>
      </div>

      <div className="lab-layout">
        <aside className="assumptions-card">
          <div className="card-heading">
            <div>
              <span>Inspectable inputs</span>
              <strong>Simulation assumptions</strong>
            </div>
            <Info weight="fill" />
          </div>
          <div className="scenario-presets" aria-label="Traffic scenarios">
            <button
              type="button"
              aria-pressed={
                config.sessionsPerVariant === 2400 &&
                config.decisionMakerShare === 0.72 &&
                config.roiPriority === 0.48 &&
                config.trustPriority === 0.23 &&
                config.mobileShare === 0.34
              }
              onClick={() =>
                onConfig({
                  ...config,
                  sessionsPerVariant: 2400,
                  decisionMakerShare: 0.72,
                  roiPriority: 0.48,
                  trustPriority: 0.23,
                  mobileShare: 0.34,
                })
              }
            >
              Baseline
            </button>
            <button
              type="button"
              aria-pressed={
                config.decisionMakerShare === 0.84 &&
                config.trustPriority === 0.5
              }
              onClick={() =>
                onConfig({
                  ...config,
                  sessionsPerVariant: 2400,
                  decisionMakerShare: 0.84,
                  roiPriority: 0.3,
                  trustPriority: 0.5,
                  mobileShare: 0.5,
                })
              }
            >
              Skeptical enterprise
            </button>
            <button
              type="button"
              aria-pressed={config.sessionsPerVariant === 400}
              onClick={() =>
                onConfig({
                  ...config,
                  sessionsPerVariant: 400,
                })
              }
            >
              Low evidence
            </button>
          </div>
          {sliders.map((slider) => {
            const value = config[slider.key];
            return (
              <label className="lab-slider" key={slider.key}>
                <span>
                  <strong>{slider.label}</strong>
                  <output>{slider.format(value)}</output>
                </span>
                <small>{slider.description}</small>
                <input
                  type="range"
                  aria-label={slider.label}
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={value}
                  onChange={(event) =>
                    onConfig({
                      ...config,
                      [slider.key]: Number(event.target.value),
                    })
                  }
                />
              </label>
            );
          })}
          <div className="lab-policy-heading">
            <span>Decision contract</span>
            <strong>Pre-declared policy</strong>
          </div>
          <label className="lab-slider">
            <span>
              <strong>Minimum worthwhile lift</strong>
              <output>
                {(policy.minimumPracticalLift * 100).toFixed(2)} pts
              </output>
            </span>
            <small>Absolute qualified-meeting conversion lift.</small>
            <input
              type="range"
              aria-label="Minimum worthwhile lift"
              min={0.001}
              max={0.03}
              step={0.001}
              value={policy.minimumPracticalLift}
              onChange={(event) =>
                onPolicy({
                  ...policy,
                  minimumPracticalLift: Number(event.target.value),
                })
              }
            />
          </label>
          <label className="lab-slider">
            <span>
              <strong>Practical-lift confidence</strong>
              <output>
                {Math.round(
                  policy.minimumProbabilityOfPracticalLift * 100,
                )}
                %
              </output>
            </span>
            <small>Required posterior probability of clearing the lift.</small>
            <input
              type="range"
              aria-label="Practical-lift confidence"
              min={0.8}
              max={0.99}
              step={0.01}
              value={policy.minimumProbabilityOfPracticalLift}
              onChange={(event) =>
                onPolicy({
                  ...policy,
                  minimumProbabilityOfPracticalLift: Number(
                    event.target.value,
                  ),
                })
              }
            />
          </label>
          <label className="lab-slider">
            <span>
              <strong>Probability-best threshold</strong>
              <output>
                {Math.round(policy.minimumProbabilityBest * 100)}%
              </output>
            </span>
            <small>Discovery-only protection against a noisy leader.</small>
            <input
              type="range"
              aria-label="Probability-best threshold"
              min={0.5}
              max={0.99}
              step={0.01}
              value={policy.minimumProbabilityBest}
              onChange={(event) =>
                onPolicy({
                  ...policy,
                  minimumProbabilityBest: Number(event.target.value),
                })
              }
            />
          </label>
          <label className="lab-slider">
            <span>
              <strong>Minimum outcome volume</strong>
              <output>{policy.minimumQualifiedDemosPerArm}/arm</output>
            </span>
            <small>Qualified meetings required in every treatment arm.</small>
            <input
              type="range"
              aria-label="Minimum outcome volume"
              min={5}
              max={100}
              step={5}
              value={policy.minimumQualifiedDemosPerArm}
              onChange={(event) =>
                onPolicy({
                  ...policy,
                  minimumQualifiedDemosPerArm: Number(event.target.value),
                })
              }
            />
          </label>
          <div className="assumption-note">
            <Info weight="fill" />
            <span>
              These controls alter model assumptions—not observed customer
              facts. The same seed reproduces the same result.
            </span>
          </div>
        </aside>

        <ResultsPanel result={result} compact />
      </div>

      <RobustnessObservatory
        config={config}
        policy={policy}
        onInspectSeed={(seed) => onConfig({ ...config, seed })}
      />
    </main>
  );
}
