import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  BezierCurve,
  Dna,
  Sparkle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { conceptById, evolvedConcept } from "../data/concepts";
import { lineage } from "../lib/evolution";
import { LandingConcept } from "./LandingConcept";
import type { Concept } from "../types";

export function EvolutionStage({
  onOpen,
}: {
  onOpen: (concept: Concept) => void;
}) {
  return (
    <div className="stage-content evolution-stage">
      <div className="stage-heading">
        <span className="kicker">
          <Dna weight="duotone" />
          Generation 1 · Evidence-backed evolution
        </span>
        <h1>Watch the challenger inherit—and mutate.</h1>
        <p>
          Each gene has a visible source. The engine combines compatible
          evidence, then introduces exactly one unproven mutation.
        </p>
      </div>

      <div className="lineage-layout">
        <div className="gene-stack">
          {lineage.map((item, index) => {
            const source =
              item.sourceId === "mutation"
                ? null
                : conceptById[item.sourceId];
            return (
              <motion.article
                className={`gene-card confidence-${item.confidence}`}
                key={item.gene}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12 }}
              >
                <div className="gene-source">
                  <span
                    style={{
                      backgroundColor: source?.color ?? "#f0a23b",
                    }}
                  >
                    {source?.shortLabel ?? <Sparkle weight="fill" />}
                  </span>
                  <div>
                    <small>{item.gene}</small>
                    <strong>{item.value}</strong>
                  </div>
                  <i>{item.confidence}</i>
                </div>
                <p>{item.evidence}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="gene-connector" aria-hidden="true">
          <BezierCurve weight="duotone" />
          <ArrowRight weight="bold" />
        </div>

        <motion.div
          className="challenger-shell"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.28, duration: 0.5 }}
        >
          <div className="challenger-label">
            <Atom weight="duotone" />
            <span>
              Generated challenger
              <strong>Variant F · The adoption plan</strong>
            </span>
          </div>
          <LandingConcept concept={evolvedConcept} compact />
          <button
            className="challenger-preview-button"
            type="button"
            onClick={() => onOpen(evolvedConcept)}
          >
            Open interactive challenger
            <ArrowUpRight weight="bold" />
          </button>
        </motion.div>
      </div>

      <div className="honesty-callout">
        <Sparkle weight="duotone" />
        <div>
          <strong>Generation is a proposal, not a victory lap.</strong>
          <span>
            The concept tournament cannot isolate individual gene effects.
            Variant F must now beat the incumbent on unseen traffic.
          </span>
        </div>
      </div>
    </div>
  );
}
