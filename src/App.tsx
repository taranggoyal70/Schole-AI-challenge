import {
  ArrowLeft,
  ArrowRight,
  ChartBar,
  Flask,
  Info,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Brand } from "./components/Brand";
import { ConceptArena } from "./components/ConceptArena";
import { ConceptModal } from "./components/ConceptModal";
import { EvolutionStage } from "./components/EvolutionStage";
import { HoldoutStage } from "./components/HoldoutStage";
import { IntroStage } from "./components/IntroStage";
import { SimulationStage } from "./components/SimulationStage";
import { InsightsPanel } from "./components/InsightsPanel";
import { VisitorReplay } from "./components/VisitorReplay";
import { conceptById, concepts } from "./data/concepts";
import { generateChallenger } from "./lib/evolution";
import {
  defaultConfig,
  defaultDecisionPolicy,
  runExperiment,
  runHoldout,
} from "./lib/simulation";
import type { Concept, DecisionPolicy, SimulatorConfig } from "./types";

const ResultsPanel = lazy(() =>
  import("./components/ResultsPanel").then((module) => ({
    default: module.ResultsPanel,
  })),
);
const LabPanel = lazy(() =>
  import("./components/LabPanel").then((module) => ({
    default: module.LabPanel,
  })),
);

const steps = [
  { label: "Brief", short: "01" },
  { label: "Concepts", short: "02" },
  { label: "Same visitor", short: "03" },
  { label: "Traffic", short: "04" },
  { label: "Evidence", short: "05" },
  { label: "Evolve", short: "06" },
  { label: "Holdout", short: "07" },
];

function EvidenceStage({
  result,
}: {
  result: ReturnType<typeof runExperiment>;
}) {
  const winner = result.winnerId ? conceptById[result.winnerId] : null;
  return (
    <div className="stage-content evidence-stage">
      <div className="stage-heading">
        <span className="kicker">
          <ChartBar weight="duotone" />
          Bayesian decision policy
        </span>
        <h1>
          {winner
            ? `Variant ${winner.shortLabel} earns the incumbent seat.`
            : "The evidence refuses to crown a winner."}
        </h1>
        <p>
          {winner
            ? `${winner.name} produces the strongest qualified-meeting outcome and clears every pre-declared evidence threshold.`
            : "No concept has cleared the complete volume, probability, and practical-lift policy."}{" "}
          Behavior signals explain why; they do not determine the winner.
        </p>
      </div>
      <Suspense fallback={<div className="panel-skeleton">Preparing evidence…</div>}>
        <ResultsPanel result={result} />
      </Suspense>
      <InsightsPanel result={result} />
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<"guided" | "lab">("guided");
  const [step, setStep] = useState(0);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [labConfig, setLabConfig] = useState<SimulatorConfig>(defaultConfig);
  const [labPolicy, setLabPolicy] =
    useState<DecisionPolicy>(defaultDecisionPolicy);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [progress, setProgress] = useState(0);
  const runTimerRef = useRef<number | null>(null);

  const result = useMemo(
    () =>
      runExperiment(defaultConfig, concepts, {
        mode: "multi_arm",
        baselineId: concepts[0].id,
        policy: defaultDecisionPolicy,
      }),
    [],
  );
  const incumbent = result.winnerId
    ? conceptById[result.winnerId]
    : concepts[0];
  const generation = useMemo(() => generateChallenger(result), [result]);
  const holdout = useMemo(
    () =>
      runHoldout(
        defaultConfig,
        incumbent,
        generation.concept,
        defaultDecisionPolicy,
      ),
    [generation.concept, incumbent],
  );
  const labResult = useMemo(
    () =>
      runExperiment(labConfig, concepts, {
        mode: "multi_arm",
        baselineId: concepts[0].id,
        policy: labPolicy,
      }),
    [labConfig, labPolicy],
  );

  useEffect(() => {
    if (!selectedConcept) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedConcept(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selectedConcept]);

  useEffect(
    () => () => {
      if (runTimerRef.current !== null) {
        window.clearInterval(runTimerRef.current);
      }
    },
    [],
  );

  function runTraffic() {
    if (runTimerRef.current !== null) {
      window.clearInterval(runTimerRef.current);
    }
    setIsRunning(true);
    setHasRun(false);
    setProgress(0);
    const startedAt = Date.now();
    const duration = 1800;
    runTimerRef.current = window.setInterval(() => {
      const nextProgress = Math.min(
        100,
        Math.round(((Date.now() - startedAt) / duration) * 100),
      );
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        if (runTimerRef.current !== null) {
          window.clearInterval(runTimerRef.current);
          runTimerRef.current = null;
        }
        setIsRunning(false);
        setHasRun(true);
      }
    }, 45);
  }

  function goToStep(next: number) {
    setStep(Math.max(0, Math.min(steps.length - 1, next)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const stage = (() => {
    if (step === 0) return <IntroStage onStart={() => goToStep(1)} />;
    if (step === 1) return <ConceptArena onOpen={setSelectedConcept} />;
    if (step === 2) return <VisitorReplay />;
    if (step === 3)
      return (
        <SimulationStage
          result={result}
          isRunning={isRunning}
          hasRun={hasRun}
          progress={progress}
          onRun={runTraffic}
        />
      );
    if (step === 4) return <EvidenceStage result={result} />;
    if (step === 5)
      return (
        <EvolutionStage
          generation={generation}
          onOpen={setSelectedConcept}
        />
      );
    return <HoldoutStage discovery={result} holdout={holdout} />;
  })();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <div className="mode-switch" role="group" aria-label="Experience mode">
          <button
            type="button"
            className={mode === "guided" ? "active" : ""}
            onClick={() => setMode("guided")}
            aria-pressed={mode === "guided"}
          >
            <Flask weight="duotone" />
            Guided evolution
          </button>
          <button
            type="button"
            className={mode === "lab" ? "active" : ""}
            onClick={() => setMode("lab")}
            aria-pressed={mode === "lab"}
          >
            <SlidersHorizontal weight="duotone" />
            Experiment lab
          </button>
        </div>
        <span className="synthetic-banner">
          <Info weight="fill" />
          All visitor data is synthetic
        </span>
      </header>

      {mode === "guided" ? (
        <>
          <nav className="step-rail" aria-label="Guided evolution progress">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item.label}
                className={
                  index === step
                    ? "active"
                    : index < step
                      ? "complete"
                      : ""
                }
                onClick={() => goToStep(index)}
                aria-current={index === step ? "step" : undefined}
              >
                <span>{item.short}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </nav>

          <main className={`guided-main step-${step}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="stage-motion"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
              >
                {stage}
              </motion.div>
            </AnimatePresence>
          </main>

          {step > 0 && (
            <footer className="guided-footer">
              <button
                type="button"
                className="footer-back"
                onClick={() => goToStep(step - 1)}
              >
                <ArrowLeft weight="bold" />
                {steps[step - 1].label}
              </button>
              <span>
                {step + 1} / {steps.length}
              </span>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  className="footer-next"
                  onClick={() => goToStep(step + 1)}
                  disabled={step === 3 && !hasRun}
                  title={
                    step === 3 && !hasRun
                      ? "Run the synthetic traffic first"
                      : undefined
                  }
                >
                  {steps[step + 1].label}
                  <ArrowRight weight="bold" />
                </button>
              ) : (
                <button
                  type="button"
                  className="footer-next"
                  onClick={() => setMode("lab")}
                >
                  Challenge the model
                  <SlidersHorizontal weight="bold" />
                </button>
              )}
            </footer>
          )}
        </>
      ) : (
        <Suspense fallback={<div className="panel-skeleton">Loading experiment lab…</div>}>
          <LabPanel
            config={labConfig}
            policy={labPolicy}
            result={labResult}
            onConfig={setLabConfig}
            onPolicy={setLabPolicy}
            onRerun={() =>
              setLabConfig((current) => ({
                ...current,
                seed: current.seed + 137,
              }))
            }
          />
        </Suspense>
      )}

      <AnimatePresence>
        {selectedConcept && (
          <ConceptModal
            concept={selectedConcept}
            onClose={() => setSelectedConcept(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
