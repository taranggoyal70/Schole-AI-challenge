import { describe, expect, it } from "vitest";

import { defaultDecisionPolicy } from "./simulation";
import { analyzeObservedExperiment, parseObservedCsv } from "./observed";

describe("observed experiment import", () => {
  it("parses a two-arm GTM export", () => {
    expect(
      parseObservedCsv(
        "variant,sessions,qualified_meetings\nControl,2000,80\nChallenger,2000,130",
      ),
    ).toEqual([
      { variant: "Control", sessions: 2000, qualifiedMeetings: 80 },
      { variant: "Challenger", sessions: 2000, qualifiedMeetings: 130 },
    ]);
  });

  it("rejects impossible counts", () => {
    expect(() =>
      parseObservedCsv(
        "variant,sessions,qualified_meetings\nControl,10,11\nChallenger,10,2",
      ),
    ).toThrow(/between 0 and sessions/);
  });

  it("selects a clear observed challenger", () => {
    const analysis = analyzeObservedExperiment(
      parseObservedCsv(
        "variant,sessions,qualified_meetings\nControl,2000,80\nChallenger,2000,150",
      ),
      defaultDecisionPolicy,
    );
    expect(analysis.decision).toBe("challenger");
    expect(analysis.probabilityOfPracticalLift).toBeGreaterThan(0.95);
    expect(analysis.sampleRatioMismatch).toBe(false);
  });

  it("refuses to decide when outcome volume is too low", () => {
    const analysis = analyzeObservedExperiment(
      parseObservedCsv(
        "variant,sessions,qualified_meetings\nControl,300,5\nChallenger,300,12",
      ),
      defaultDecisionPolicy,
    );
    expect(analysis.decision).toBe("no_decision_volume");
  });
});
