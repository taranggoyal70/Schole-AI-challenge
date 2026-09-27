import type { DecisionPolicy } from "../types";
import { mulberry32, sampleBeta } from "./prng";

export interface ObservedArm {
  variant: string;
  sessions: number;
  qualifiedMeetings: number;
}

export interface ObservedAnalysis {
  baseline: ObservedArm;
  challenger: ObservedArm;
  baselineRate: number;
  challengerRate: number;
  probabilityOfPracticalLift: number;
  probabilityBaselineHasPracticalLift: number;
  upliftLow: number;
  upliftHigh: number;
  sampleRatioMismatch: boolean;
  decision: "challenger" | "baseline" | "no_decision_volume" | "no_decision_evidence";
}

function integer(value: string, field: string, line: number) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative integer on line ${line}.`);
  }
  return parsed;
}

export function parseObservedCsv(text: string): [ObservedArm, ObservedArm] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length !== 3) {
    throw new Error("Provide one header row and exactly two experiment arms.");
  }

  const header = lines[0].split(",").map((value) => value.trim().toLowerCase());
  const expected = ["variant", "sessions", "qualified_meetings"];
  if (header.length !== expected.length || header.some((value, index) => value !== expected[index])) {
    throw new Error("Use the columns: variant,sessions,qualified_meetings");
  }

  const arms = lines.slice(1).map((line, index) => {
    const values = line.split(",").map((value) => value.trim());
    if (values.length !== 3 || !values[0]) {
      throw new Error(`The experiment arm on line ${index + 2} is incomplete.`);
    }
    const sessions = integer(values[1], "sessions", index + 2);
    const qualifiedMeetings = integer(values[2], "qualified_meetings", index + 2);
    if (sessions === 0 || qualifiedMeetings > sessions) {
      throw new Error(`qualified_meetings must be between 0 and sessions on line ${index + 2}.`);
    }
    return { variant: values[0], sessions, qualifiedMeetings };
  });
  if (arms[0].variant.toLowerCase() === arms[1].variant.toLowerCase()) {
    throw new Error("Baseline and challenger must have different variant names.");
  }
  return arms as [ObservedArm, ObservedArm];
}

function percentile(values: number[], probability: number) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor((sorted.length - 1) * probability)];
}

export function analyzeObservedExperiment(
  [baseline, challenger]: [ObservedArm, ObservedArm],
  policy: DecisionPolicy,
  seed = 73013,
): ObservedAnalysis {
  const random = mulberry32(seed);
  const draws = 10_000;
  const baselineSamples = Array.from({ length: draws }, () =>
    sampleBeta(
      baseline.qualifiedMeetings + 1,
      baseline.sessions - baseline.qualifiedMeetings + 1,
      random,
    ),
  );
  const challengerSamples = Array.from({ length: draws }, () =>
    sampleBeta(
      challenger.qualifiedMeetings + 1,
      challenger.sessions - challenger.qualifiedMeetings + 1,
      random,
    ),
  );
  const differences = challengerSamples.map(
    (sample, index) => sample - baselineSamples[index],
  );
  const probabilityOfPracticalLift =
    differences.filter((difference) => difference >= policy.minimumPracticalLift).length /
    draws;
  const probabilityBaselineHasPracticalLift =
    differences.filter((difference) => difference <= -policy.minimumPracticalLift).length /
    draws;
  const volumeReady = [baseline, challenger].every(
    (arm) => arm.qualifiedMeetings >= policy.minimumQualifiedDemosPerArm,
  );

  let decision: ObservedAnalysis["decision"] = "no_decision_evidence";
  if (!volumeReady) decision = "no_decision_volume";
  else if (
    probabilityOfPracticalLift >= policy.minimumProbabilityOfPracticalLift
  ) decision = "challenger";
  else if (
    probabilityBaselineHasPracticalLift >= policy.minimumProbabilityOfPracticalLift
  ) decision = "baseline";

  const expected = (baseline.sessions + challenger.sessions) / 2;
  return {
    baseline,
    challenger,
    baselineRate: baseline.qualifiedMeetings / baseline.sessions,
    challengerRate: challenger.qualifiedMeetings / challenger.sessions,
    probabilityOfPracticalLift,
    probabilityBaselineHasPracticalLift,
    upliftLow: percentile(differences, 0.025),
    upliftHigh: percentile(differences, 0.975),
    sampleRatioMismatch: [baseline, challenger].some(
      (arm) => Math.abs(arm.sessions - expected) / expected > 0.1,
    ),
    decision,
  };
}
