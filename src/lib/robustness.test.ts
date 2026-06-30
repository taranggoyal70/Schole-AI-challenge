import { describe, expect, it } from "vitest";
import { defaultConfig, defaultDecisionPolicy } from "./simulation";
import {
  ROBUSTNESS_SEED_STRIDE,
  robustnessConfigSignature,
  runRobustnessStudy,
} from "./robustness";

describe("multi-cohort robustness study", () => {
  it("summarizes deterministic discovery and holdout outcomes", () => {
    const study = runRobustnessStudy(defaultConfig, 5);

    expect(study.cohortCount).toBe(5);
    expect(study.seedStart).toBe(defaultConfig.seed);
    expect(study.seedEnd).toBe(
      defaultConfig.seed + ROBUSTNESS_SEED_STRIDE * 4,
    );
    expect(study.totalSessions).toBe(
      5 * defaultConfig.sessionsPerVariant * 7,
    );
    expect(
      Object.values(study.discoveryCounts).reduce(
        (total, count) => total + count,
        0,
      ),
    ).toBe(5);
    expect(
      Object.values(study.holdoutCounts).reduce(
        (total, count) => total + count,
        0,
      ),
    ).toBe(5);
  });

  it("is reproducible and classifies every holdout outcome", () => {
    const first = runRobustnessStudy(defaultConfig, 5);
    const second = runRobustnessStudy(defaultConfig, 5);

    expect(first).toEqual(second);
    expect(
      first.holdoutCounts.challenger +
        first.holdoutCounts.incumbent +
        first.holdoutCounts.no_decision,
    ).toBe(5);
    if (first.holdoutCounterexample) {
      expect(first.holdoutCounterexample.holdout.winnerId).not.toBe(
        first.holdoutCounterexample.holdout.challengerId,
      );
    }
  });

  it("invalidates a study signature when the decision contract changes", () => {
    expect(
      robustnessConfigSignature(defaultConfig, defaultDecisionPolicy),
    ).not.toBe(
      robustnessConfigSignature(defaultConfig, {
        ...defaultDecisionPolicy,
        minimumPracticalLift: 0.01,
      }),
    );
  });
});
