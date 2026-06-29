import { describe, expect, it } from "vitest";
import { concepts } from "../data/concepts";
import { defaultConfig, runExperiment, runHoldout } from "./simulation";

describe("synthetic experiment", () => {
  it("is reproducible for the same seed", () => {
    const first = runExperiment(defaultConfig, concepts);
    const second = runExperiment(defaultConfig, concepts);

    expect(first.metrics).toEqual(second.metrics);
    expect(first.winnerId).toEqual(second.winnerId);
  });

  it("allocates an equal number of sessions to every concept", () => {
    const result = runExperiment(defaultConfig, concepts);

    expect(result.metrics).toHaveLength(5);
    result.metrics.forEach((metric) => {
      expect(metric.sessions).toBe(defaultConfig.sessionsPerVariant);
    });
  });

  it("keeps probabilities and rates bounded", () => {
    const result = runExperiment(defaultConfig, concepts);

    result.metrics.forEach((metric) => {
      expect(metric.qualifiedDemoRate).toBeGreaterThanOrEqual(0);
      expect(metric.qualifiedDemoRate).toBeLessThanOrEqual(1);
      expect(metric.probabilityBest).toBeGreaterThanOrEqual(0);
      expect(metric.probabilityBest).toBeLessThanOrEqual(1);
    });
  });

  it("runs a separate incumbent-versus-challenger holdout", () => {
    const result = runHoldout(defaultConfig);

    expect(result.metrics.map((metric) => metric.conceptId)).toEqual([
      "roi",
      "evolved",
    ]);
    expect(result.config.seed).not.toBe(defaultConfig.seed);
    expect(result.winnerId).toBe("evolved");
    expect(
      result.metrics.find((metric) => metric.conceptId === "evolved")?.upliftLow,
    ).toBeGreaterThan(0);
  });

  it("returns no decision when the declared cohort lacks evidence", () => {
    const result = runExperiment(
      { ...defaultConfig, sessionsPerVariant: 400 },
      concepts,
    );

    expect(result.winnerId).toBeNull();
    expect(result.decision).not.toBe("winner");
  });
});
