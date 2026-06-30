import { concepts } from "../data/concepts";
import type {
  Concept,
  ConceptId,
  DecisionPolicy,
  ExperimentDesign,
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

export const defaultDecisionPolicy: DecisionPolicy = {
  minimumQualifiedDemosPerArm: 20,
  minimumPracticalLift: 0.005,
  minimumProbabilityOfPracticalLift: 0.95,
  minimumProbabilityBest: 0.8,
};

export interface HoldoutShift {
  seedOffset: number;
  decisionMakerShare: number;
  roiPriority: number;
  trustPriority: number;
  mobileShare: number;
}

export const defaultHoldoutShift: HoldoutShift = {
  seedOffset: 9137,
  decisionMakerShare: 0.1,
  roiPriority: -0.13,
  trustPriority: 0.18,
  mobileShare: 0.14,
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

  const isDecisionMaker = qualifiedPersonas.includes(persona);
  const companyFit = clamp(
    (isDecisionMaker ? 0.68 : 0.28) + (random() - 0.5) * 0.5,
  );
  const qualified = isDecisionMaker && companyFit >= 0.5;
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
    companyFit,
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

function modelSource(
  concept: Concept,
  gene: keyof Concept["genes"],
): ConceptId {
  return concept.modelProfile?.[gene] ?? concept.id;
}

function simulateSession(
  concept: Concept,
  visitor: Visitor,
  random: Random,
): SessionOutcome {
  const promiseSource = modelSource(concept, "promise");
  const proofSource = modelSource(concept, "proof");
  const interactionSource = modelSource(concept, "interaction");
  const ctaSource = modelSource(concept, "cta");
  const baseFit = fitMatrix[promiseSource][visitor.persona];
  const fit = clamp(baseFit + painFit(promiseSource, visitor.pain));
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
    proofSource === "trust" || proofSource === "evolved"
      ? 0.55
      : proofSource === "control"
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
          interactionStrength[interactionSource] +
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
          ctaDirectness[ctaSource],
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
          ctaDirectness[ctaSource] -
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

export interface RunExperimentOptions {
  mode?: ExperimentDesign["mode"];
  baselineId?: ConceptId;
  policy?: DecisionPolicy;
}

function summarize(
  conceptIds: ConceptId[],
  sessions: SessionOutcome[],
  seed: number,
  design: ExperimentDesign,
): VariantMetrics[] {
  const base = conceptIds.map((conceptId) => {
    const rows = sessions.filter((session) => session.conceptId === conceptId);
    const mobileRows = rows.filter(
      (session) => session.visitor.device === "mobile",
    );
    const desktopRows = rows.filter(
      (session) => session.visitor.device === "desktop",
    );
    const demoCompletions = rows.filter((row) => row.demoCompleted).length;
    const qualifiedDemos = rows.filter((row) => row.qualifiedDemo).length;
    const proofEngagements = rows.filter((row) => row.proofEngaged);
    return {
      conceptId,
      sessions: rows.length,
      demoCompletions,
      qualifiedDemos,
      qualifiedDemoRate: qualifiedDemos / rows.length,
      demoCompletionRate: demoCompletions / rows.length,
      qualificationRate: demoCompletions
        ? qualifiedDemos / demoCompletions
        : 0,
      unqualifiedDemoShare: demoCompletions
        ? (demoCompletions - qualifiedDemos) / demoCompletions
        : 0,
      mobileQualifiedDemoRate: mobileRows.length
        ? mobileRows.filter((row) => row.qualifiedDemo).length /
          mobileRows.length
        : 0,
      desktopQualifiedDemoRate: desktopRows.length
        ? desktopRows.filter((row) => row.qualifiedDemo).length /
          desktopRows.length
        : 0,
      ctaRate: rows.filter((row) => row.ctaClicked).length / rows.length,
      deepScrollRate:
        rows.filter((row) => row.scrollDepth >= 0.75).length / rows.length,
      interactionRate:
        rows.filter((row) => row.interactionCompleted).length / rows.length,
      proofEngagementRate: proofEngagements.length / rows.length,
      proofToCtaRate: proofEngagements.length
        ? proofEngagements.filter((row) => row.ctaClicked).length /
          proofEngagements.length
        : 0,
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

  const baselineIndex = conceptIds.indexOf(design.baselineId);
  return base.map((metric, index) => {
    const baselineSamples = samples[baselineIndex];
    const differences = samples[index].map(
      (sample, draw) => sample - baselineSamples[draw],
    );
    return {
      ...metric,
      probabilityBest: bestCounts[index] / draws,
      probabilityBeatBaseline:
        differences.filter((difference) => difference > 0).length / draws,
      probabilityOfPracticalLift:
        differences.filter(
          (difference) => difference >= design.policy.minimumPracticalLift,
        ).length / draws,
      probabilityBaselineHasPracticalLift:
        differences.filter(
          (difference) => difference <= -design.policy.minimumPracticalLift,
        ).length / draws,
      credibleLow: percentile(samples[index], 0.025),
      credibleHigh: percentile(samples[index], 0.975),
      upliftLow: percentile(differences, 0.025),
      upliftHigh: percentile(differences, 0.975),
    };
  });
}

function shuffled<T>(values: T[], random: Random): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function runExperiment(
  config: SimulatorConfig = defaultConfig,
  variants: Concept[] = concepts,
  options: RunExperimentOptions = {},
): ExperimentResult {
  const baselineId = options.baselineId ?? variants[0]?.id;
  if (!baselineId || !variants.some((variant) => variant.id === baselineId)) {
    throw new Error("Experiment baseline must be one of the tested variants.");
  }
  const design: ExperimentDesign = {
    mode: options.mode ?? (variants.length === 2 ? "pairwise" : "multi_arm"),
    baselineId,
    policy: options.policy ?? defaultDecisionPolicy,
  };
  if (design.mode === "pairwise" && variants.length !== 2) {
    throw new Error("Pairwise experiments require exactly two variants.");
  }

  const assignments = shuffled(
    variants.flatMap((variant) =>
      Array.from({ length: config.sessionsPerVariant }, () => variant),
    ),
    mulberry32(config.seed + 271828),
  );
  const visitorRandom = mulberry32(config.seed + 314159);
  const outcomeRandom = mulberry32(config.seed + 161803);
  const sessions = assignments.map((concept, index) =>
    simulateSession(
      concept,
      createVisitor(index, config, visitorRandom),
      outcomeRandom,
    ),
  );

  const metrics = summarize(
    variants.map((concept) => concept.id),
    sessions,
    config.seed,
    design,
  );
  const ranked = [...metrics].sort(
    (a, b) => b.qualifiedDemoRate - a.qualifiedDemoRate,
  );
  const volumeReady = metrics.every(
    (metric) =>
      metric.qualifiedDemos >=
      design.policy.minimumQualifiedDemosPerArm,
  );

  let winnerId: ConceptId | null = null;
  let decision: ExperimentResult["decision"] = "no_decision_practical";

  if (!volumeReady) {
    decision = "no_decision_volume";
  } else if (design.mode === "pairwise") {
    const challenger = metrics.find(
      (metric) => metric.conceptId !== design.baselineId,
    )!;
    if (
      challenger.probabilityOfPracticalLift >=
      design.policy.minimumProbabilityOfPracticalLift
    ) {
      winnerId = challenger.conceptId;
      decision = "winner";
    } else if (
      challenger.probabilityBaselineHasPracticalLift >=
      design.policy.minimumProbabilityOfPracticalLift
    ) {
      winnerId = design.baselineId;
      decision = "winner";
    }
  } else {
    const best = ranked[0];
    if (best.probabilityBest < design.policy.minimumProbabilityBest) {
      decision = "no_decision_probability";
    } else if (best.conceptId === design.baselineId) {
      const runnerUp = ranked[1];
      if (
        runnerUp.probabilityBaselineHasPracticalLift >=
        design.policy.minimumProbabilityOfPracticalLift
      ) {
        winnerId = best.conceptId;
        decision = "winner";
      }
    } else if (
      best.probabilityOfPracticalLift >=
      design.policy.minimumProbabilityOfPracticalLift
    ) {
      winnerId = best.conceptId;
      decision = "winner";
    }
  }

  const allocation = Object.fromEntries(
    variants.map((variant) => [
      variant.id,
      sessions.filter((session) => session.conceptId === variant.id).length,
    ]),
  ) as Partial<Record<ConceptId, number>>;
  const expectedAllocation = sessions.length / variants.length;
  const sampleRatioMismatch = Object.values(allocation).some(
    (count) => count !== expectedAllocation,
  );

  return {
    config,
    design,
    metrics,
    sessions,
    winnerId,
    allocation,
    sampleRatioMismatch,
    decision,
  };
}

export function runHoldout(
  config: SimulatorConfig,
  incumbent: Concept,
  challenger: Concept,
  policy: DecisionPolicy = defaultDecisionPolicy,
  shift: HoldoutShift = defaultHoldoutShift,
): ExperimentResult {
  const holdoutConfig: SimulatorConfig = {
    ...config,
    seed: config.seed + shift.seedOffset,
    decisionMakerShare: Math.min(
      0.9,
      config.decisionMakerShare + shift.decisionMakerShare,
    ),
    roiPriority: Math.max(0.25, config.roiPriority + shift.roiPriority),
    trustPriority: Math.min(
      0.52,
      config.trustPriority + shift.trustPriority,
    ),
    mobileShare: Math.min(0.65, config.mobileShare + shift.mobileShare),
  };

  return runExperiment(holdoutConfig, [incumbent, challenger], {
    mode: "pairwise",
    baselineId: incumbent.id,
    policy,
  });
}
