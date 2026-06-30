import { describe, expect, it } from "vitest";
import { defaultConfig } from "./simulation";
import {
  ROBUSTNESS_SEED_STRIDE,
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

  it("surfaces a reproducible holdout counterexample", () => {
    const first = runRobustnessStudy(defaultConfig, 5);
    const second = runRobustnessStudy(defaultConfig, 5);

    expect(first).toEqual(second);
    expect(first.discoveryCounts.roi).toBe(5);
    expect(first.holdoutCounts.evolved).toBe(4);
    expect(first.holdoutCounts.no_decision).toBe(1);
    expect(first.holdoutCounterexample?.seed).toBe(2594);
    expect(first.holdoutCounterexample?.holdout.decision).toBe(
      "no_decision_interval",
    );
  });
});
