import { describe, expect, it } from "vitest";
import { concepts, evolvedConcept } from "../data/concepts";
import { generateChallenger } from "./evolution";
import {
  defaultConfig,
  defaultDecisionPolicy,
  runExperiment,
  runHoldout,
} from "./simulation";

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
    expect(result.sampleRatioMismatch).toBe(false);
    expect(new Set(result.sessions.map((session) => session.visitor.id)).size).toBe(
      result.sessions.length,
    );
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
    const discovery = runExperiment(defaultConfig, concepts);
    const incumbent = concepts.find(
      (concept) => concept.id === discovery.winnerId,
    )!;
    const generation = generateChallenger(discovery);
    const result = runHoldout(
      defaultConfig,
      incumbent,
      generation.concept,
      defaultDecisionPolicy,
    );

    expect(result.metrics.map((metric) => metric.conceptId)).toEqual([
      "roi",
      "evolved",
    ]);
    expect(result.config.seed).not.toBe(defaultConfig.seed);
    expect(result.design.baselineId).toBe(incumbent.id);
    expect(result.decision).toBe("no_decision_practical");
  });

  it("models a generated challenger from its computed gene sources", () => {
    const discovery = runExperiment(defaultConfig, concepts);
    const incumbent = concepts.find(
      (concept) => concept.id === discovery.winnerId,
    )!;
    const generation = generateChallenger(discovery);
    const inherited = runHoldout(
      defaultConfig,
      incumbent,
      generation.concept,
      defaultDecisionPolicy,
    );
    const allControl = runHoldout(
      defaultConfig,
      incumbent,
      {
        ...generation.concept,
        modelProfile: {
          promise: "control",
          proof: "control",
          interaction: "control",
          cta: "control",
          structure: "control",
        },
      },
      defaultDecisionPolicy,
    );

    expect(generation.lineage.some((item) => item.sourceId === "mutation")).toBe(
      true,
    );
    expect(
      inherited.metrics.find((metric) => metric.conceptId === "evolved")
        ?.qualifiedDemoRate,
    ).not.toBe(
      allControl.metrics.find((metric) => metric.conceptId === "evolved")
        ?.qualifiedDemoRate,
    );
  });

  it("can symmetrically retain any declared baseline", () => {
    const challenger = concepts.find((concept) => concept.id === "control")!;
    const result = runHoldout(
      defaultConfig,
      evolvedConcept,
      challenger,
      defaultDecisionPolicy,
    );

    expect(result.design.baselineId).toBe("evolved");
    expect(result.winnerId).toBe("evolved");
    expect(
      result.metrics.find((metric) => metric.conceptId === "control")
        ?.probabilityBaselineHasPracticalLift,
    ).toBeGreaterThanOrEqual(
      defaultDecisionPolicy.minimumProbabilityOfPracticalLift,
    );
  });

  it("honors a configurable minimum worthwhile lift", () => {
    const result = runExperiment(defaultConfig, concepts, {
      baselineId: concepts[0].id,
      mode: "multi_arm",
      policy: {
        ...defaultDecisionPolicy,
        minimumPracticalLift: 0.2,
      },
    });

    expect(result.winnerId).toBeNull();
    expect(result.decision).toBe("no_decision_practical");
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
