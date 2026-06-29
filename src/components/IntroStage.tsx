import {
  ArrowRight,
  Brain,
  ChartLineUp,
  CheckCircle,
  Dna,
  Flask,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function IntroStage({ onStart }: { onStart: () => void }) {
  return (
    <div className="intro-stage">
      <div className="intro-copy">
        <span className="challenge-pill">
          <Sparkle weight="fill" />
          Scholé · Growth Engineer Challenge
        </span>
        <h1>
          Landing pages that learn.
          <em>Assumptions you can challenge.</em>
        </h1>
        <p>
          EVOLVE compares five strategic landing-page concepts, simulates
          inspectable visitor behavior, generates a challenger from the evidence,
          and forces it through an unseen holdout.
        </p>
        <div className="intro-actions">
          <button type="button" className="primary-action" onClick={onStart}>
            Watch it evolve
            <ArrowRight weight="bold" />
          </button>
          <span>90-second founder cut · fully inspectable</span>
        </div>
        <div className="principle-row">
          <span>
            <CheckCircle weight="fill" /> Business outcomes over clicks
          </span>
          <span>
            <CheckCircle weight="fill" /> “No decision” is allowed
          </span>
          <span>
            <CheckCircle weight="fill" /> Every generated gene has lineage
          </span>
        </div>
      </div>

      <motion.div
        className="evolution-orbit"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        aria-label="Evolution system overview"
      >
        <div className="orbit-glow" />
        <div className="orbit-center">
          <Dna weight="duotone" />
          <span>EVOLVE</span>
          <strong>Generation 1</strong>
        </div>
        <motion.div
          className="orbit-node node-concepts"
          animate={{ y: [0, -7, 0] }}
          transition={{ repeat: Infinity, duration: 4.2 }}
        >
          <Flask weight="duotone" />
          <span>
            5 concepts
            <strong>Discover</strong>
          </span>
        </motion.div>
        <motion.div
          className="orbit-node node-traffic"
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 4.8 }}
        >
          <Brain weight="duotone" />
          <span>
            12k sessions
            <strong>Simulate</strong>
          </span>
        </motion.div>
        <motion.div
          className="orbit-node node-evidence"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 5.1 }}
        >
          <ChartLineUp weight="duotone" />
          <span>
            Bayesian policy
            <strong>Decide</strong>
          </span>
        </motion.div>
        <motion.div
          className="orbit-node node-holdout"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 4.5 }}
        >
          <ShieldCheck weight="duotone" />
          <span>
            Unseen cohort
            <strong>Validate</strong>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
