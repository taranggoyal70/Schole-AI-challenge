import {
  ArrowRight,
  Buildings,
  Check,
  CursorClick,
  Eye,
  IdentificationCard,
  MouseScroll,
  Sparkle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { concepts } from "../data/concepts";

const paths = {
  control: ["Reads product promise", "Skims research", "Leaves before demo"],
  roi: ["Stops at $412k risk", "Uses ROI estimator", "Books founder session"],
  personal: ["Selects People team", "Previews role path", "Saves page for team"],
  trust: ["Reads research proof", "Opens customer evidence", "Clicks demo"],
  diagnostic: ["Starts assessment", "Receives adoption score", "Requests plan"],
} as const;

const pathIcons = [Eye, MouseScroll, CursorClick];

export function VisitorReplay() {
  return (
    <div className="stage-content replay-stage">
      <div className="stage-heading">
        <span className="kicker">
          <IdentificationCard weight="duotone" />
          Illustrative counterfactual
        </span>
        <h1>One buyer. Five different journeys.</h1>
        <p>
          This replay explains the treatment differences. It is a teaching
          device—not evidence and not part of the aggregate result.
        </p>
      </div>

      <div className="persona-card">
        <div className="persona-avatar">MC</div>
        <div>
          <strong>Maya Chen</strong>
          <span>VP Learning · 1,200-person logistics company</span>
        </div>
        <div className="persona-facts">
          <span>
            <Buildings weight="duotone" /> 1,200 employees
          </span>
          <span>
            <Sparkle weight="duotone" /> Low Copilot adoption
          </span>
        </div>
        <small>Synthetic persona</small>
      </div>

      <div className="replay-grid">
        {concepts.map((concept, conceptIndex) => (
          <motion.article
            className="replay-column"
            key={concept.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: conceptIndex * 0.09 }}
          >
            <header>
              <span style={{ backgroundColor: concept.color }}>
                {concept.shortLabel}
              </span>
              <div>
                <strong>{concept.name}</strong>
                <small>{concept.hero.cta}</small>
              </div>
            </header>
            <div className="replay-path">
              {paths[concept.id as keyof typeof paths].map((event, index) => {
                const Icon = pathIcons[index];
                const isConversion =
                  event.includes("Books") || event.includes("Requests");
                return (
                  <div className={isConversion ? "is-conversion" : ""} key={event}>
                    <i>
                      {isConversion ? (
                        <Check weight="bold" />
                      ) : (
                        <Icon weight="duotone" />
                      )}
                    </i>
                    <span>{event}</span>
                    {index < 2 && <ArrowRight aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
