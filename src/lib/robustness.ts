import { conceptById, concepts } from "../data/concepts";
import { generateChallenger } from "./evolution";
import type {
  ConceptId,
  DecisionPolicy,
  ExperimentResult,
  SimulatorConfig,
} from "../types";
import {
  defaultDecisionPolicy,
  runExperiment,
  runHoldout,
} from "./simulation";

export const ROBUSTNESS_COHORT_COUNT = 50;
export const ROBUSTNESS_SEED_STRIDE = 137;

export type DiscoveryOutcomeKey =
  | Exclude<ConceptId, "evolved">
  | "no_decision";
export type HoldoutOutcomeKey =
  | "challenger"
  | "incumbent"
  | "no_decision";

export interface RobustnessCohort {
  index: number;
  seed: number;
  discovery: {
    winnerId: ConceptId | null;
    decision: ExperimentResult["decision"];
    leaderId: ConceptId;
    leaderRate: number;
    leaderProbabilityBest: number;
  };
  holdout: {
    incumbentId: ConceptId;
    challengerId: ConceptId;
    winnerId: ConceptId | null;
    decision: ExperimentResult["decision"];
    incumbentRate: number;
    challengerRate: number;
    challengerProbabilityBest: number;
    challengerUpliftLow: number;
    challengerUpliftHigh: number;
  };
}

export interface RobustnessStudy {
  cohortCount: number;
  seedStart: number;
  seedEnd: number;
  configSignature: string;
  totalSessions: number;
  cohorts: RobustnessCohort[];
  discoveryCounts: Record<DiscoveryOutcomeKey, number>;
  holdoutCounts: Record<HoldoutOutcomeKey, number>;
  incumbentId: Exclude<ConceptId, "evolved">;
  incumbentStability: number;
  discoveryNoDecisionRate: number;
  challengerHoldoutRate: number;
  averageChallengerUplift: number;
  discoveryCounterexample: RobustnessCohort | null;
  holdoutCounterexample: RobustnessCohort | null;
}

export function robustnessConfigSignature(
  config: SimulatorConfig,
  policy: DecisionPolicy = defaultDecisionPolicy,
): string {
  return [
    config.seed,
    config.sessionsPerVariant,
    config.decisionMakerShare,
    config.roiPriority,
    config.trustPriority,
    config.mobileShare,
    policy.minimumQualifiedDemosPerArm,
    policy.minimumPracticalLift,
    policy.minimumProbabilityOfPracticalLift,
    policy.minimumProbabilityBest,
  ].join(":");
}

export function runRobustnessCohort(
  baseConfig: SimulatorConfig,
  index: number,
  policy: DecisionPolicy = defaultDecisionPolicy,
): RobustnessCohort {
  const config = {
    ...baseConfig,
    seed: baseConfig.seed + index * ROBUSTNESS_SEED_STRIDE,
  };
  const discovery = runExperiment(config, concepts, {
    mode: "multi_arm",
    baselineId: concepts[0].id,
    policy,
  });
  const incumbent = discovery.winnerId
    ? conceptById[discovery.winnerId]
    : conceptById[discovery.design.baselineId];
  const challenger = generateChallenger(discovery).concept;
  const holdout = runHoldout(
    config,
    incumbent,
    challenger,
    discovery.design.policy,
  );
  const discoveryLeader = [...discovery.metrics].sort(
    (a, b) => b.qualifiedDemoRate - a.qualifiedDemoRate,
  )[0];
  const incumbentMetric = holdout.metrics.find(
    (metric) => metric.conceptId === holdout.design.baselineId,
  )!;
  const challengerMetric = holdout.metrics.find(
    (metric) => metric.conceptId !== holdout.design.baselineId,
  )!;

  return {
    index,
    seed: config.seed,
    discovery: {
      winnerId: discovery.winnerId,
      decision: discovery.decision,
      leaderId: discoveryLeader.conceptId,
      leaderRate: discoveryLeader.qualifiedDemoRate,
      leaderProbabilityBest: discoveryLeader.probabilityBest,
    },
    holdout: {
      incumbentId: incumbentMetric.conceptId,
      challengerId: challengerMetric.conceptId,
      winnerId: holdout.winnerId,
      decision: holdout.decision,
      incumbentRate: incumbentMetric.qualifiedDemoRate,
      challengerRate: challengerMetric.qualifiedDemoRate,
      challengerProbabilityBest: challengerMetric.probabilityBest,
      challengerUpliftLow: challengerMetric.upliftLow,
      challengerUpliftHigh: challengerMetric.upliftHigh,
    },
  };
}

export function summarizeRobustnessStudy(
  baseConfig: SimulatorConfig,
  cohorts: RobustnessCohort[],
  policy: DecisionPolicy = defaultDecisionPolicy,
): RobustnessStudy {
  const discoveryCounts: RobustnessStudy["discoveryCounts"] = {
    control: 0,
    roi: 0,
    personal: 0,
    trust: 0,
    diagnostic: 0,
    no_decision: 0,
  };
  const holdoutCounts: RobustnessStudy["holdoutCounts"] = {
    challenger: 0,
    incumbent: 0,
    no_decision: 0,
  };

  cohorts.forEach((cohort) => {
    const discoveryKey = (cohort.discovery.winnerId ??
      "no_decision") as DiscoveryOutcomeKey;
    discoveryCounts[discoveryKey] += 1;

    const holdoutKey: HoldoutOutcomeKey =
      cohort.holdout.winnerId === null
        ? "no_decision"
        : cohort.holdout.winnerId === cohort.holdout.challengerId
          ? "challenger"
          : "incumbent";
    holdoutCounts[holdoutKey] += 1;
  });

  const cohortCount = cohorts.length;
  const incumbentId = (cohorts[0]?.discovery.winnerId ??
    cohorts[0]?.discovery.leaderId ??
    concepts[0].id) as Exclude<ConceptId, "evolved">;
  const totalChallengerUplift = cohorts.reduce(
    (total, cohort) =>
      total +
      (cohort.holdout.challengerRate - cohort.holdout.incumbentRate),
    0,
  );

  return {
    cohortCount,
    seedStart: cohorts[0]?.seed ?? baseConfig.seed,
    seedEnd: cohorts.at(-1)?.seed ?? baseConfig.seed,
    configSignature: robustnessConfigSignature(baseConfig, policy),
    totalSessions:
      cohortCount * baseConfig.sessionsPerVariant * (concepts.length + 2),
    cohorts,
    discoveryCounts,
    holdoutCounts,
    incumbentId,
    incumbentStability: cohortCount
      ? discoveryCounts[incumbentId] / cohortCount
      : 0,
    discoveryNoDecisionRate: cohortCount
      ? discoveryCounts.no_decision / cohortCount
      : 0,
    challengerHoldoutRate: cohortCount
      ? holdoutCounts.challenger / cohortCount
      : 0,
    averageChallengerUplift: cohortCount
      ? totalChallengerUplift / cohortCount
      : 0,
    discoveryCounterexample:
      cohorts.find(
        (cohort) => cohort.discovery.winnerId !== incumbentId,
      ) ?? null,
    holdoutCounterexample:
      cohorts.find(
        (cohort) =>
          cohort.holdout.winnerId !== cohort.holdout.challengerId,
      ) ?? null,
  };
}

export function runRobustnessStudy(
  baseConfig: SimulatorConfig,
  cohortCount = ROBUSTNESS_COHORT_COUNT,
  policy: DecisionPolicy = defaultDecisionPolicy,
): RobustnessStudy {
  const cohorts = Array.from({ length: cohortCount }, (_, index) =>
    runRobustnessCohort(baseConfig, index, policy),
  );
  return summarizeRobustnessStudy(baseConfig, cohorts, policy);
}
