import { concepts, evolvedConcept } from "../data/concepts";
import type {
  Concept,
  ConceptId,
  ExperimentResult,
  PainPriority,
  PersonaId,
  SessionOutcome,
  SimulatorConfig,
  VariantMetrics,
  Visitor,
} from "../types";
import { mulberry32, sampleBeta, type Random } from "./prng";

export const defaultConfig: SimulatorConfig = {
  seed: 2046,
  sessionsPerVariant: 2400,
  decisionMakerShare: 0.72,
  roiPriority: 0.48,
  trustPriority: 0.23,
  mobileShare: 0.34,
};

const personaLabels: Record<PersonaId, string> = {
  ld_leader: "L&D leader",
  hr_exec: "VP People",
  ai_lead: "AI transformation lead",
  team_manager: "Team manager",
  learner: "Individual learner",
};

const qualifiedPersonas: PersonaId[] = ["ld_leader", "hr_exec", "ai_lead"];

const fitMatrix: Record<ConceptId, Record<PersonaId, number>> = {
  control: {
    ld_leader: 0.46,
    hr_exec: 0.4,
    ai_lead: 0.42,
    team_manager: 0.4,
    learner: 0.44,
  },
  roi: {
    ld_leader: 0.66,
    hr_exec: 0.88,
    ai_lead: 0.84,
    team_manager: 0.38,
    learner: 0.18,
  },
  personal: {
    ld_leader: 0.84,
    hr_exec: 0.58,
    ai_lead: 0.52,
    team_manager: 0.78,
    learner: 0.72,
  },
  trust: {
    ld_leader: 0.7,
    hr_exec: 0.72,
    ai_lead: 0.76,
    team_manager: 0.36,
    learner: 0.32,
  },
  diagnostic: {
    ld_leader: 0.78,
    hr_exec: 0.76,
    ai_lead: 0.72,
    team_manager: 0.62,
    learner: 0.28,
  },
  evolved: {
    ld_leader: 0.9,
    hr_exec: 0.94,
    ai_lead: 0.9,
    team_manager: 0.5,
    learner: 0.2,
  },
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function chooseWeighted<T>(values: Array<[T, number]>, random: Random): T {
  const total = values.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = random() * total;
  for (const [value, weight] of values) {
    cursor -= weight;
    if (cursor <= 0) return value;
  }
  return values[values.length - 1][0];
}

function createVisitor(
  index: number,
  config: SimulatorConfig,
  random: Random,
): Visitor {
  const buyer = random() < config.decisionMakerShare;
  const persona = buyer
    ? chooseWeighted<PersonaId>(
        [
          ["ld_leader", 0.42],
          ["hr_exec", 0.3],
          ["ai_lead", 0.28],
        ],
        random,
      )
    : chooseWeighted<PersonaId>(
        [
          ["team_manager", 0.56],
          ["learner", 0.44],
        ],
        random,
      );

  const pain = chooseWeighted<PainPriority>(
    [
      ["roi", config.roiPriority],
      ["trust", config.trustPriority],
      ["relevance", Math.max(0.05, 1 - config.roiPriority - config.trustPriority)],
    ],
    random,
  );

  const qualified = qualifiedPersonas.includes(persona);
  const intentBase: Record<PersonaId, number> = {
    ld_leader: 0.68,
    hr_exec: 0.65,
    ai_lead: 0.7,
    team_manager: 0.42,
    learner: 0.25,
  };

  return {
    id: `V-${String(index + 1).padStart(5, "0")}`,
    persona,
    personaLabel: personaLabels[persona],
    qualified,
    companyFit: clamp((qualified ? 0.68 : 0.28) + (random() - 0.5) * 0.5),
    intent: clamp(intentBase[persona] + (random() - 0.5) * 0.56),
    attention: clamp(0.58 + (random() - 0.5) * 0.72),
    pain,
    device: random() < config.mobileShare ? "mobile" : "desktop",
  };
}

function painFit(conceptId: ConceptId, pain: PainPriority): number {
  if (conceptId === "evolved") return pain === "roi" ? 0.38 : 0.23;
  if (conceptId === "roi" && pain === "roi") return 0.44;
  if (conceptId === "personal" && pain === "relevance") return 0.42;
  if (conceptId === "trust" && pain === "trust") return 0.46;
  if (conceptId === "diagnostic") return 0.2;
  if (conceptId === "control") return 0.08;
  return -0.08;
}

function simulateSession(
  concept: Concept,
  visitor: Visitor,
  random: Random,
): SessionOutcome {
  const baseFit = fitMatrix[concept.id][visitor.persona];
  const fit = clamp(baseFit + painFit(concept.id, visitor.pain));
  const mobileFriction = visitor.device === "mobile" ? 0.12 : 0;

  const bounceProbability = sigmoid(
    0.45 - 1.35 * visitor.intent - 1.3 * fit - 0.55 * visitor.attention + mobileFriction,
  );
  const bounced = random() < bounceProbability;

  const scrollDepth = bounced
    ? 0.12 + random() * 0.22
    : clamp(
        0.34 +
          0.35 * visitor.attention +
          0.28 * fit +
          0.14 * visitor.intent -
          mobileFriction +
          (random() - 0.5) * 0.18,
      );

  const proofAffinity =
    concept.id === "trust" || concept.id === "evolved"
      ? 0.55
      : concept.id === "control"
        ? 0.16
        : 0.28;
  const proofEngaged =
    !bounced &&
    random() <
      sigmoid(
        -1.05 +
          1.15 * scrollDepth +
          0.9 * visitor.attention +
          proofAffinity +
          (visitor.pain === "trust" ? 0.5 : 0),
      );

  const interactionStrength: Record<ConceptId, number> = {
    control: -0.45,
    roi: 0.34,
    personal: 0.45,
    trust: 0.18,
    diagnostic: 0.72,
    evolved: 0.78,
  };
  const interactionCompleted =
    !bounced &&
    random() <
      sigmoid(
        -1.35 +
          interactionStrength[concept.id] +
          0.95 * visitor.intent +
          0.85 * fit +
          0.28 * visitor.attention,
      );

  const ctaDirectness: Record<ConceptId, number> = {
    control: 0.12,
    roi: 0.56,
    personal: 0.18,
    trust: 0.08,
    diagnostic: 0.16,
    evolved: 0.58,
  };
  const ctaClicked =
    !bounced &&
    random() <
      sigmoid(
        -3.15 +
          1.05 * visitor.intent +
          1.45 * fit +
          0.42 * Number(scrollDepth > 0.7) +
          0.55 * Number(interactionCompleted) +
          ctaDirectness[concept.id],
      );

  const demoCompleted =
    ctaClicked &&
    random() <
      sigmoid(
        -4.15 +
          1.35 * visitor.intent +
          1.18 * visitor.companyFit +
          0.5 * Number(proofEngaged) +
          0.38 * Number(interactionCompleted) +
          ctaDirectness[concept.id] -
          (visitor.device === "mobile" ? 0.16 : 0),
      );

  const dwellSeconds = bounced
    ? 4 + random() * 8
    : Math.round(
        18 +
          scrollDepth * 54 +
          Number(proofEngaged) * 19 +
          Number(interactionCompleted) * 28 +
          random() * 14,
      );

  return {
    conceptId: concept.id,
    visitor,
    bounced,
    scrollDepth,
    dwellSeconds,
    proofEngaged,
    interactionCompleted,
    ctaClicked,
    demoCompleted,
    qualifiedDemo: demoCompleted && visitor.qualified,
  };
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((sorted.length - 1) * p);
  return sorted[index];
}

function summarize(
  conceptIds: ConceptId[],
  sessions: SessionOutcome[],
  seed: number,
): VariantMetrics[] {
  const base = conceptIds.map((conceptId) => {
    const rows = sessions.filter((session) => session.conceptId === conceptId);
    const qualifiedDemos = rows.filter((row) => row.qualifiedDemo).length;
    return {
      conceptId,
      sessions: rows.length,
      qualifiedDemos,
      qualifiedDemoRate: qualifiedDemos / rows.length,
      ctaRate: rows.filter((row) => row.ctaClicked).length / rows.length,
      deepScrollRate:
        rows.filter((row) => row.scrollDepth >= 0.75).length / rows.length,
      interactionRate:
        rows.filter((row) => row.interactionCompleted).length / rows.length,
      averageDwell:
        rows.reduce((sum, row) => sum + row.dwellSeconds, 0) / rows.length,
    };
  });

  const draws = 4000;
  const posteriorRandom = mulberry32(seed + 880301);
  const samples = base.map((metric) =>
    Array.from({ length: draws }, () =>
      sampleBeta(
        metric.qualifiedDemos + 1,
        metric.sessions - metric.qualifiedDemos + 1,
        posteriorRandom,
      ),
    ),
  );

  const bestCounts = Array.from({ length: base.length }, () => 0);
  for (let draw = 0; draw < draws; draw += 1) {
    let bestIndex = 0;
    for (let index = 1; index < samples.length; index += 1) {
      if (samples[index][draw] > samples[bestIndex][draw]) bestIndex = index;
    }
    bestCounts[bestIndex] += 1;
  }

  const controlIndex = conceptIds.indexOf("control");
  return base.map((metric, index) => {
    const controlSamples =
      controlIndex >= 0 ? samples[controlIndex] : samples[Math.max(0, index - 1)];
    const differences = samples[index].map(
      (sample, draw) => sample - controlSamples[draw],
    );
    return {
      ...metric,
      probabilityBest: bestCounts[index] / draws,
      probabilityBeatControl:
        differences.filter((difference) => difference > 0).length / draws,
      credibleLow: percentile(samples[index], 0.025),
      credibleHigh: percentile(samples[index], 0.975),
      upliftLow: percentile(differences, 0.025),
      upliftHigh: percentile(differences, 0.975),
    };
  });
}

export function runExperiment(
  config: SimulatorConfig = defaultConfig,
  variants: Concept[] = concepts,
): ExperimentResult {
  const sessions: SessionOutcome[] = [];

  variants.forEach((concept, conceptIndex) => {
    const random = mulberry32(config.seed + conceptIndex * 104729);
    for (let index = 0; index < config.sessionsPerVariant; index += 1) {
      const visitor = createVisitor(index, config, random);
      sessions.push(simulateSession(concept, visitor, random));
    }
  });

  const metrics = summarize(
    variants.map((concept) => concept.id),
    sessions,
    config.seed,
  );
  const best = [...metrics].sort(
    (a, b) => b.qualifiedDemoRate - a.qualifiedDemoRate,
  )[0];

  let winnerId: ConceptId | null = best.conceptId;
  let decision: ExperimentResult["decision"] = "winner";

  if (best.qualifiedDemos < 20) {
    winnerId = null;
    decision = "no_decision_volume";
  } else if (
    best.probabilityBest < 0.8 ||
    (best.conceptId !== "control" && best.probabilityBeatControl < 0.9)
  ) {
    winnerId = null;
    decision = "no_decision_probability";
  } else if (best.conceptId !== "control" && best.upliftLow <= 0) {
    winnerId = null;
    decision = "no_decision_interval";
  }

  return { config, metrics, sessions, winnerId, decision };
}

export function runHoldout(
  config: SimulatorConfig = defaultConfig,
): ExperimentResult {
  const holdoutConfig: SimulatorConfig = {
    ...config,
    seed: config.seed + 9137,
    decisionMakerShare: Math.min(0.9, config.decisionMakerShare + 0.1),
    roiPriority: Math.max(0.25, config.roiPriority - 0.13),
    trustPriority: Math.min(0.52, config.trustPriority + 0.18),
    mobileShare: Math.min(0.65, config.mobileShare + 0.14),
  };

  return runExperiment(holdoutConfig, [
    concepts.find((concept) => concept.id === "roi")!,
    evolvedConcept,
  ]);
}
