import {
  Brain,
  Check,
  CursorClick,
  Eye,
  Gauge,
  MouseScroll,
  Play,
  Sparkle,
  Target,
  UsersThree,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { concepts } from "../data/concepts";
import type { ExperimentResult } from "../types";

export function SimulationStage({
  result,
  isRunning,
  hasRun,
  progress,
  onRun,
}: {
  result: ExperimentResult;
  isRunning: boolean;
  hasRun: boolean;
  progress: number;
  onRun: () => void;
}) {
  const totalSessions =
    result.config.sessionsPerVariant * result.metrics.length;
  const displayedSessions = Math.round((progress / 100) * totalSessions);
  const totalQualified = result.metrics.reduce(
    (sum, metric) => sum + metric.qualifiedDemos,
    0,
  );
  const displayedQualified = Math.round((progress / 100) * totalQualified);

  return (
    <div className="stage-content simulation-stage">
      <div className="stage-heading">
        <span className="kicker">
          <Brain weight="duotone" />
          Transparent synthetic experiment
        </span>
        <h1>Simulate sessions—not conclusions.</h1>
        <p>
          Every visitor has an inspectable role, company fit, intent, pain,
          device, and attention profile. The seed makes every run reproducible.
        </p>
      </div>

      <div className="simulation-console">
        <div className="sim-toolbar">
          <div className="sim-facts">
            <span>
              <UsersThree weight="duotone" />
              <strong>{result.config.sessionsPerVariant.toLocaleString()}</strong>
              / concept
            </span>
            <span>
              <Target weight="duotone" />
              <strong>
                {Math.round(result.config.decisionMakerShare * 100)}%
              </strong>
              decision makers
            </span>
            <span>
              <Gauge weight="duotone" />
              <strong>{result.config.seed}</strong>
              seed
            </span>
          </div>
          <button
            type="button"
            className={hasRun ? "sim-run is-complete" : "sim-run"}
            onClick={onRun}
            disabled={isRunning}
          >
            {hasRun ? <Check weight="bold" /> : <Play weight="fill" />}
            {isRunning
              ? "Running cohort…"
              : hasRun
                ? "Run again"
                : "Run synthetic traffic"}
          </button>
        </div>

        <div className="sim-stage">
          <div className="visitor-stream" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <motion.i
                key={index}
                style={{ "--visitor-index": index } as React.CSSProperties}
                animate={
                  isRunning
                    ? { x: [0, 760], opacity: [0, 1, 1, 0] }
                    : { x: 0, opacity: 0.16 }
                }
                transition={{
                  repeat: isRunning ? Infinity : 0,
                  duration: 2.2 + (index % 4) * 0.32,
                  delay: (index % 8) * 0.16,
                }}
              />
            ))}
          </div>

          <div className="sim-concepts">
            {concepts.map((concept) => (
              <div
                className="sim-concept"
                key={concept.id}
                style={{ "--concept": concept.color } as React.CSSProperties}
              >
                <span>{concept.shortLabel}</span>
                <strong>{concept.name}</strong>
                <div className="signal-icons">
                  <Eye weight="duotone" />
                  <MouseScroll weight="duotone" />
                  <CursorClick weight="duotone" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sim-progress">
          <div>
            <motion.i animate={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>

        <div className="sim-counters">
          <div>
            <span>Sessions processed</span>
            <strong>{displayedSessions.toLocaleString()}</strong>
          </div>
          <div>
            <span>Behavior events</span>
            <strong>{Math.round(displayedSessions * 4.7).toLocaleString()}</strong>
          </div>
          <div>
            <span>Qualified demos</span>
            <strong>{displayedQualified.toLocaleString()}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong className={hasRun ? "status-complete" : ""}>
              {isRunning ? "Streaming" : hasRun ? "Evidence ready" : "Ready"}
            </strong>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hasRun && !isRunning && (
          <motion.div
            className="sim-ready-callout"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkle weight="fill" />
            <span>
              <strong>Evidence is ready.</strong> Behavioral signals explain the
              journey; qualified demos select the winner.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
