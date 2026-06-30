import { concepts } from "../data/concepts";
import type {
  ConceptId,
  ExperimentResult,
  SimulatorConfig,
} from "../types";
import { runExperiment, runHoldout } from "./simulation";

export const ROBUSTNESS_COHORT_COUNT = 50;
export const ROBUSTNESS_SEED_STRIDE = 137;

export type DiscoveryOutcomeKey =
  | Exclude<ConceptId, "evolved">
  | "no_decision";
export type HoldoutOutcomeKey = "evolved" | "roi" | "no_decision";

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
  roiStability: number;
  discoveryNoDecisionRate: number;
  challengerHoldoutRate: number;
  averageChallengerUplift: number;
  discoveryCounterexample: RobustnessCohort | null;
  holdoutCounterexample: RobustnessCohort | null;
}

export function robustnessConfigSignature(config: SimulatorConfig): string {
  return [
    config.seed,
    config.sessionsPerVariant,
    config.decisionMakerShare,
    config.roiPriority,
    config.trustPriority,
    config.mobileShare,
  ].join(":");
}

export function runRobustnessCohort(
  baseConfig: SimulatorConfig,
  index: number,
): RobustnessCohort {
  const config = {
    ...baseConfig,
    seed: baseConfig.seed + index * ROBUSTNESS_SEED_STRIDE,
  };
  const discovery = runExperiment(config, concepts);
  const holdout = runHoldout(config);
  const discoveryLeader = [...discovery.metrics].sort(
    (a, b) => b.qualifiedDemoRate - a.qualifiedDemoRate,
  )[0];
  const incumbent = holdout.metrics.find(
    (metric) => metric.conceptId === "roi",
  )!;
  const challenger = holdout.metrics.find(
    (metric) => metric.conceptId === "evolved",
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
      winnerId: holdout.winnerId,
      decision: holdout.decision,
      incumbentRate: incumbent.qualifiedDemoRate,
      challengerRate: challenger.qualifiedDemoRate,
      challengerProbabilityBest: challenger.probabilityBest,
      challengerUpliftLow: challenger.upliftLow,
      challengerUpliftHigh: challenger.upliftHigh,
    },
  };
}

export function summarizeRobustnessStudy(
  baseConfig: SimulatorConfig,
  cohorts: RobustnessCohort[],
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
    evolved: 0,
    roi: 0,
    no_decision: 0,
  };

  cohorts.forEach((cohort) => {
    const discoveryKey = (cohort.discovery.winnerId ??
      "no_decision") as DiscoveryOutcomeKey;
    discoveryCounts[discoveryKey] += 1;

    const holdoutKey = (cohort.holdout.winnerId ??
      "no_decision") as HoldoutOutcomeKey;
    holdoutCounts[holdoutKey] += 1;
  });

  const cohortCount = cohorts.length;
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
    configSignature: robustnessConfigSignature(baseConfig),
    totalSessions:
      cohortCount * baseConfig.sessionsPerVariant * (concepts.length + 2),
    cohorts,
    discoveryCounts,
    holdoutCounts,
    roiStability: cohortCount ? discoveryCounts.roi / cohortCount : 0,
    discoveryNoDecisionRate: cohortCount
      ? discoveryCounts.no_decision / cohortCount
      : 0,
    challengerHoldoutRate: cohortCount
      ? holdoutCounts.evolved / cohortCount
      : 0,
    averageChallengerUplift: cohortCount
      ? totalChallengerUplift / cohortCount
      : 0,
    discoveryCounterexample:
      cohorts.find((cohort) => cohort.discovery.winnerId !== "roi") ?? null,
    holdoutCounterexample:
      cohorts.find((cohort) => cohort.holdout.winnerId !== "evolved") ?? null,
  };
}

export function runRobustnessStudy(
  baseConfig: SimulatorConfig,
  cohortCount = ROBUSTNESS_COHORT_COUNT,
): RobustnessStudy {
  const cohorts = Array.from({ length: cohortCount }, (_, index) =>
    runRobustnessCohort(baseConfig, index),
  );
  return summarizeRobustnessStudy(baseConfig, cohorts);
}
