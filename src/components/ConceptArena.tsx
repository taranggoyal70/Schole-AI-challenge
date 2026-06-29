import { ArrowUpRight, Flask } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { concepts } from "../data/concepts";
import type { Concept } from "../types";
import { LandingConcept } from "./LandingConcept";

export function ConceptArena({
  onOpen,
}: {
  onOpen: (concept: Concept) => void;
}) {
  return (
    <div className="stage-content">
      <div className="stage-heading">
        <span className="kicker">
          <Flask weight="duotone" />
          Generation 0 · Discovery
        </span>
        <h1>Five pages. Five strategic bets.</h1>
        <p>
          This is a concept tournament, not a causal A/B test. We are exploring
          positioning territory before isolating individual elements.
        </p>
      </div>

      <div className="concept-grid">
        {concepts.map((concept, index) => (
          <motion.button
            type="button"
            className="concept-card"
            key={concept.id}
            onClick={() => onOpen(concept)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="concept-card-meta">
              <span
                className="variant-badge"
                style={{ backgroundColor: concept.color }}
              >
                {concept.shortLabel}
              </span>
              <div>
                <strong>{concept.name}</strong>
                <span>{concept.genes.promise}</span>
              </div>
              <ArrowUpRight weight="bold" />
            </div>
            <div className="concept-card-canvas">
              <LandingConcept concept={concept} compact />
            </div>
            <p>{concept.hypothesis}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
