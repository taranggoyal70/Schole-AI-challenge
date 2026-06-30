import { conceptById, evolvedConcept } from "../data/concepts";
import type {
  Concept,
  ExperimentResult,
  LineageItem,
  VariantMetrics,
} from "../types";

export interface GeneratedChallenger {
  concept: Concept;
  lineage: LineageItem[];
}

function strongest(
  metrics: VariantMetrics[],
  score: (metric: VariantMetrics) => number,
): VariantMetrics {
  return [...metrics].sort((left, right) => score(right) - score(left))[0];
}

function percent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function generateChallenger(
  result: ExperimentResult,
): GeneratedChallenger {
  const outcomeSource =
    result.metrics.find((metric) => metric.conceptId === result.winnerId) ??
    strongest(result.metrics, (metric) => metric.qualifiedDemoRate);
  const interactionSource = strongest(
    result.metrics,
    (metric) => metric.interactionRate,
  );
  const proofSource = strongest(
    result.metrics,
    (metric) => metric.proofEngagementRate,
  );

  const outcomeConcept = conceptById[outcomeSource.conceptId];
  const interactionConcept = conceptById[interactionSource.conceptId];
  const proofConcept = conceptById[proofSource.conceptId];

  const concept: Concept = {
    ...evolvedConcept,
    hypothesis: `Combining ${outcomeConcept.name.toLowerCase()} positioning, ${interactionConcept.name.toLowerCase()} interaction, and ${proofConcept.name.toLowerCase()} proof will outperform ${outcomeConcept.name} on unseen traffic.`,
    hero: {
      eyebrow: `${outcomeConcept.hero.eyebrow} · evidence-guided`,
      headline: outcomeConcept.hero.headline,
      accentLine: "Now turn the insight into an adoption plan.",
      body: `Start with ${interactionConcept.genes.interaction.toLowerCase()}, see ${proofConcept.genes.proof.toLowerCase()}, and leave with a concrete path from AI access to measurable adoption.`,
      cta: evolvedConcept.hero.cta,
      secondary: `Evidence from ${proofConcept.name}`,
    },
    genes: {
      promise: outcomeConcept.genes.promise,
      proof: proofConcept.genes.proof,
      interaction: interactionConcept.genes.interaction,
      cta: evolvedConcept.genes.cta,
      structure: `${outcomeConcept.genes.structure} → plan`,
    },
    modelProfile: {
      promise: outcomeConcept.id,
      proof: proofConcept.id,
      interaction: interactionConcept.id,
      cta: outcomeConcept.id,
      structure: outcomeConcept.id,
    },
    sectionLabels: [
      outcomeConcept.sectionLabels[0],
      interactionConcept.genes.interaction,
      proofConcept.genes.proof,
      "Adoption plan",
    ],
  };

  const lineage: LineageItem[] = [
    {
      gene: "promise",
      value: concept.genes.promise,
      sourceId: outcomeConcept.id,
      evidence: `${outcomeConcept.name} led qualified meetings at ${percent(outcomeSource.qualifiedDemoRate, 2)} with ${percent(outcomeSource.probabilityBest, 0)} posterior probability of being best.`,
      confidence: result.winnerId ? "high" : "exploratory",
    },
    {
      gene: "interaction",
      value: concept.genes.interaction,
      sourceId: interactionConcept.id,
      evidence: `${interactionConcept.name} produced the strongest interaction completion rate at ${percent(interactionSource.interactionRate)}.`,
      confidence: "medium",
    },
    {
      gene: "proof",
      value: concept.genes.proof,
      sourceId: proofConcept.id,
      evidence: `${proofConcept.name} produced the strongest proof engagement rate at ${percent(proofSource.proofEngagementRate)}; this is a hypothesis signal, not causal proof.`,
      confidence: "medium",
    },
    {
      gene: "structure",
      value: concept.genes.structure,
      sourceId: outcomeConcept.id,
      evidence: `The leading outcome source contributes its page sequence; the generator appends a concrete plan handoff.`,
      confidence: result.winnerId ? "high" : "exploratory",
    },
    {
      gene: "cta",
      value: concept.genes.cta,
      sourceId: "mutation",
      evidence:
        "One deliberate exploration trades a generic request for a specific, time-bounded deliverable.",
      confidence: "exploratory",
    },
  ];

  return { concept, lineage };
}
