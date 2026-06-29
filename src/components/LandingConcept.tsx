import {
  ArrowRight,
  BookOpenText,
  Brain,
  ChartLineUp,
  CheckCircle,
  Flask,
  Gauge,
  ShieldCheck,
  Sparkle,
  Target,
  UsersThree,
} from "@phosphor-icons/react";
import type { Concept, ConceptId } from "../types";

function ProductVisual({ id }: { id: ConceptId }) {
  if (id === "roi" || id === "evolved") {
    return (
      <div className="preview-visual roi-visual">
        <div className="visual-header">
          <span>AI adoption snapshot</span>
          <ChartLineUp weight="duotone" />
        </div>
        <div className="metric-row">
          <div>
            <span>AI seats</span>
            <strong>1,240</strong>
          </div>
          <div>
            <span>Weekly adoption</span>
            <strong>31%</strong>
          </div>
          <div>
            <span>Value at risk</span>
            <strong>$412k</strong>
          </div>
        </div>
        <div className="adoption-bars" aria-label="Adoption by team">
          {[
            ["Marketing", 72],
            ["Operations", 41],
            ["People", 28],
          ].map(([label, value]) => (
            <div className="adoption-bar" key={label}>
              <span>{label}</span>
              <div>
                <i style={{ width: `${value}%` }} />
              </div>
              <strong>{value}%</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "personal") {
    return (
      <div className="preview-visual role-visual">
        <div className="visual-header">
          <span>Build a role path</span>
          <UsersThree weight="duotone" />
        </div>
        <div className="role-tabs">
          <span className="active">People</span>
          <span>Marketing</span>
          <span>Ops</span>
        </div>
        {[
          ["Prompting for policy work", "8 min"],
          ["Analyze engagement data", "12 min"],
          ["Build an onboarding agent", "15 min"],
        ].map(([label, time], index) => (
          <div className="lesson-row" key={label}>
            <i>{index + 1}</i>
            <span>{label}</span>
            <small>{time}</small>
          </div>
        ))}
      </div>
    );
  }

  if (id === "trust") {
    return (
      <div className="preview-visual trust-visual">
        <div className="visual-header">
          <span>Evidence, not edtech theatre</span>
          <Flask weight="duotone" />
        </div>
        <div className="proof-grid">
          <div>
            <BookOpenText weight="duotone" />
            <strong>40+</strong>
            <span>peer-reviewed papers</span>
          </div>
          <div>
            <Brain weight="duotone" />
            <strong>10 yrs</strong>
            <span>learning science</span>
          </div>
          <div>
            <ShieldCheck weight="duotone" />
            <strong>200k+</strong>
            <span>learners reached</span>
          </div>
        </div>
      </div>
    );
  }

  if (id === "diagnostic") {
    return (
      <div className="preview-visual diagnostic-visual">
        <div className="visual-header">
          <span>Workforce diagnostic</span>
          <Gauge weight="duotone" />
        </div>
        <p>How many employees use AI in weekly workflows?</p>
        <div className="diagnostic-options">
          <span>Under 20%</span>
          <span className="selected">20–50%</span>
          <span>Over 50%</span>
        </div>
        <div className="diagnostic-progress">
          <i />
          <span>Question 2 of 4</span>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-visual control-visual">
      <div className="visual-header">
        <span>Learning command center</span>
        <Sparkle weight="duotone" />
      </div>
      <div className="metric-row">
        <div>
          <span>Active learners</span>
          <strong>847</strong>
        </div>
        <div>
          <span>Mastery</span>
          <strong>74%</strong>
        </div>
        <div>
          <span>Applied skills</span>
          <strong>1,286</strong>
        </div>
      </div>
      <div className="assistant-card">
        <Brain weight="duotone" />
        <div>
          <strong>Olé found an adoption gap</strong>
          <span>Operations needs role-specific practice.</span>
        </div>
        <ArrowRight />
      </div>
    </div>
  );
}

export function LandingConcept({
  concept,
  compact = false,
  onPrimaryAction,
  onSecondaryAction,
}: {
  concept: Concept;
  compact?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}) {
  return (
    <article
      className={`landing-concept ${compact ? "is-compact" : ""}`}
      style={
        {
          "--concept": concept.color,
          "--concept-soft": concept.accent,
        } as React.CSSProperties
      }
    >
      <header className="concept-nav">
        <div className="concept-wordmark">
          <Sparkle weight="fill" />
          <span>Scholé AI</span>
        </div>
        <nav aria-label="Landing page preview navigation">
          <span>Teams</span>
          <span>How it works</span>
          <span>Research</span>
        </nav>
        <span className="concept-login">Log in</span>
      </header>

      <div className="concept-hero">
        <div className="concept-copy">
          <span className="concept-eyebrow">
            <Target weight="duotone" />
            {concept.hero.eyebrow}
          </span>
          <h2>
            {concept.hero.headline}
            <em>{concept.hero.accentLine}</em>
          </h2>
          <p>{concept.hero.body}</p>
          <div className="concept-actions">
            {compact ? (
              <span className="concept-cta-static">
                {concept.hero.cta}
                <ArrowRight weight="bold" />
              </span>
            ) : (
              <button type="button" onClick={onPrimaryAction}>
                {concept.hero.cta}
                <ArrowRight weight="bold" />
              </button>
            )}
            {compact ? (
              <span>{concept.hero.secondary}</span>
            ) : (
              <button
                className="concept-secondary"
                type="button"
                onClick={onSecondaryAction}
              >
                {concept.hero.secondary}
              </button>
            )}
          </div>
          {!compact && (
            <div className="concept-trustline">
              <CheckCircle weight="fill" />
              <span>Live with a founder · No generic sales deck</span>
            </div>
          )}
        </div>
        <div className="preview-visual-wrap">
          <span className="preview-data-label">Illustrative product preview</span>
          <ProductVisual id={concept.id} />
        </div>
      </div>

      {!compact && (
        <footer className="concept-sections">
          {concept.sectionLabels.map((label, index) => (
            <div key={label}>
              <span>0{index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </footer>
      )}
    </article>
  );
}
