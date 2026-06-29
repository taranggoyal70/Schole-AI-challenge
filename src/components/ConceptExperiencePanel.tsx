import {
  Calculator,
  CheckCircle,
  ClipboardText,
  Flask,
  Gauge,
  ShieldCheck,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { Concept } from "../types";

type ExperienceMode = "primary" | "secondary";

const rolePaths = {
  People: [
    "Write a policy-ready prompt",
    "Analyze engagement signals",
    "Build an onboarding assistant",
  ],
  Marketing: [
    "Turn a brief into prompt patterns",
    "Evaluate AI-assisted copy",
    "Build a campaign research workflow",
  ],
  Operations: [
    "Map a repeatable workflow",
    "Check an AI output for risk",
    "Build a team adoption playbook",
  ],
};

const proofViews = {
  Methodology: {
    icon: Flask,
    title: "Method before claims",
    body: "Define the audience, outcome, allocation, and stopping rule before traffic enters the experiment.",
  },
  Measurement: {
    icon: Gauge,
    title: "Business outcomes over clicks",
    body: "Qualified demos select the winner. Scroll, dwell, and interaction events only explain the journey.",
  },
  Guardrails: {
    icon: ShieldCheck,
    title: "A winner must earn the title",
    body: "Probability, uplift interval, and minimum-volume thresholds can all return a valid no-decision state.",
  },
};

function SecondaryPreview({ concept }: { concept: Concept }) {
  return (
    <div className="experience-outcomes">
      <article>
        <span>Primary outcome</span>
        <strong>Qualified demos / randomized visitors</strong>
        <p>The decision metric is declared before the simulated run.</p>
      </article>
      <article>
        <span>Diagnostic events</span>
        <strong>Scroll → interaction → CTA → demo</strong>
        <p>Behavioral events explain performance without selecting the winner.</p>
      </article>
      <article>
        <span>Concept hypothesis</span>
        <strong>{concept.genes.promise}</strong>
        <p>{concept.hypothesis}</p>
      </article>
    </div>
  );
}

function RoiPreview({ evolved }: { evolved: boolean }) {
  const [seats, setSeats] = useState(1240);
  const [adoption, setAdoption] = useState(31);
  const annualRisk = Math.round(seats * (1 - adoption / 100) * 30 * 12);

  return (
    <div className="experience-calculator">
      <div className="experience-controls">
        <label>
          <span>
            AI seats <strong>{seats.toLocaleString()}</strong>
          </span>
          <input
            type="range"
            min="100"
            max="3000"
            step="20"
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
          />
        </label>
        <label>
          <span>
            Weekly adoption <strong>{adoption}%</strong>
          </span>
          <input
            type="range"
            min="5"
            max="95"
            step="1"
            value={adoption}
            onChange={(event) => setAdoption(Number(event.target.value))}
          />
        </label>
      </div>
      <output className="experience-result" aria-live="polite">
        <Calculator weight="duotone" />
        <span>Illustrative annual license value at risk</span>
        <strong>${annualRisk.toLocaleString()}</strong>
        <small>
          {evolved
            ? "Next step: turn this gap into a 20-minute adoption-plan agenda."
            : "Assumes $30 per seat each month; change either input to inspect the model."}
        </small>
      </output>
    </div>
  );
}

function RolePreview() {
  const [role, setRole] = useState<keyof typeof rolePaths>("People");
  return (
    <div className="experience-role-builder">
      <div className="experience-choice" aria-label="Choose a team">
        {Object.keys(rolePaths).map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={role === option}
            onClick={() => setRole(option as keyof typeof rolePaths)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="experience-path" aria-live="polite">
        <UsersThree weight="duotone" />
        <div>
          <span>{role} team path</span>
          {rolePaths[role].map((lesson, index) => (
            <p key={lesson}>
              <strong>0{index + 1}</strong>
              {lesson}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustPreview() {
  const [view, setView] = useState<keyof typeof proofViews>("Methodology");
  const proof = proofViews[view];
  const Icon = proof.icon;

  return (
    <div className="experience-proof">
      <div className="experience-choice" aria-label="Choose an evidence view">
        {Object.keys(proofViews).map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={view === option}
            onClick={() => setView(option as keyof typeof proofViews)}
          >
            {option}
          </button>
        ))}
      </div>
      <article aria-live="polite">
        <Icon weight="duotone" />
        <div>
          <strong>{proof.title}</strong>
          <p>{proof.body}</p>
        </div>
      </article>
    </div>
  );
}

function DiagnosticPreview() {
  const [answers, setAnswers] = useState([1, 1, 1]);
  const score = useMemo(
    () => Math.round((answers.reduce((total, value) => total + value, 0) / 6) * 100),
    [answers],
  );
  const questions = [
    "Weekly AI use",
    "Role-specific practice",
    "Manager visibility",
  ];

  return (
    <div className="experience-diagnostic">
      {questions.map((question, index) => (
        <fieldset key={question}>
          <legend>{question}</legend>
          <div className="experience-choice">
            {["Low", "Mixed", "Strong"].map((label, value) => (
              <button
                type="button"
                key={label}
                aria-pressed={answers[index] === value}
                onClick={() =>
                  setAnswers((current) =>
                    current.map((answer, answerIndex) =>
                      answerIndex === index ? value : answer,
                    ),
                  )
                }
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <output className="experience-score" aria-live="polite">
        <Gauge weight="duotone" />
        <span>Adoption readiness</span>
        <strong>{score}/100</strong>
      </output>
    </div>
  );
}

function DemoBriefPreview() {
  const [role, setRole] = useState("L&D leader");
  const [companySize, setCompanySize] = useState("500–1,000");

  return (
    <div className="experience-brief">
      <label>
        Your role
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option>L&D leader</option>
          <option>HR executive</option>
          <option>AI transformation lead</option>
        </select>
      </label>
      <label>
        Company size
        <select
          value={companySize}
          onChange={(event) => setCompanySize(event.target.value)}
        >
          <option>200–500</option>
          <option>500–1,000</option>
          <option>1,000–2,000</option>
        </select>
      </label>
      <output aria-live="polite">
        <ClipboardText weight="duotone" />
        <span>Founder-session brief</span>
        <strong>{role} · {companySize} employees</strong>
        <p>Agenda: adoption gaps, role-specific practice, and measurable rollout.</p>
      </output>
    </div>
  );
}

export function ConceptExperiencePanel({
  concept,
  mode,
  onClose,
}: {
  concept: Concept;
  mode: ExperienceMode;
  onClose: () => void;
}) {
  const isSecondary = mode === "secondary";

  return (
    <section
      className="concept-experience"
      aria-label={`${concept.name} ${isSecondary ? "outcome details" : "interactive preview"}`}
    >
      <header>
        <div>
          <span>
            <CheckCircle weight="fill" />
            Interactive concept preview · nothing is stored or sent
          </span>
          <h3>
            {isSecondary ? concept.hero.secondary : concept.hero.cta}
          </h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close interaction preview">
          <X weight="bold" />
        </button>
      </header>

      {isSecondary ? (
        <SecondaryPreview concept={concept} />
      ) : concept.id === "roi" || concept.id === "evolved" ? (
        <RoiPreview evolved={concept.id === "evolved"} />
      ) : concept.id === "personal" ? (
        <RolePreview />
      ) : concept.id === "trust" ? (
        <TrustPreview />
      ) : concept.id === "diagnostic" ? (
        <DiagnosticPreview />
      ) : (
        <DemoBriefPreview />
      )}
    </section>
  );
}
