export type ConceptId =
  | "control"
  | "roi"
  | "personal"
  | "trust"
  | "diagnostic"
  | "evolved";

export type PersonaId =
  | "ld_leader"
  | "hr_exec"
  | "ai_lead"
  | "team_manager"
  | "learner";

export type PainPriority = "roi" | "relevance" | "trust";

export interface PageGenes {
  promise: string;
  proof: string;
  interaction: string;
  cta: string;
  structure: string;
}

export interface Concept {
  id: ConceptId;
  shortLabel: string;
  name: string;
  hypothesis: string;
  color: string;
  accent: string;
  hero: {
    eyebrow: string;
    headline: string;
    accentLine: string;
    body: string;
    cta: string;
    secondary: string;
  };
  genes: PageGenes;
  modelProfile?: Partial<Record<keyof PageGenes, ConceptId>>;
  sectionLabels: string[];
}

export interface SimulatorConfig {
  seed: number;
  sessionsPerVariant: number;
  decisionMakerShare: number;
  roiPriority: number;
  trustPriority: number;
  mobileShare: number;
}

export interface DecisionPolicy {
  minimumQualifiedDemosPerArm: number;
  minimumPracticalLift: number;
  minimumProbabilityOfPracticalLift: number;
  minimumProbabilityBest: number;
}

export interface ExperimentDesign {
  mode: "multi_arm" | "pairwise";
  baselineId: ConceptId;
  policy: DecisionPolicy;
}

export interface Visitor {
  id: string;
  persona: PersonaId;
  personaLabel: string;
  qualified: boolean;
  companyFit: number;
  intent: number;
  attention: number;
  pain: PainPriority;
  device: "desktop" | "mobile";
}

export interface SessionOutcome {
  conceptId: ConceptId;
  visitor: Visitor;
  bounced: boolean;
  scrollDepth: number;
  dwellSeconds: number;
  proofEngaged: boolean;
  interactionCompleted: boolean;
  ctaClicked: boolean;
  demoCompleted: boolean;
  qualifiedDemo: boolean;
}

export interface VariantMetrics {
  conceptId: ConceptId;
  sessions: number;
  demoCompletions: number;
  qualifiedDemos: number;
  qualifiedDemoRate: number;
  demoCompletionRate: number;
  qualificationRate: number;
  unqualifiedDemoShare: number;
  mobileQualifiedDemoRate: number;
  desktopQualifiedDemoRate: number;
  ctaRate: number;
  deepScrollRate: number;
  interactionRate: number;
  proofEngagementRate: number;
  proofToCtaRate: number;
  averageDwell: number;
  probabilityBest: number;
  probabilityBeatBaseline: number;
  probabilityOfPracticalLift: number;
  probabilityBaselineHasPracticalLift: number;
  credibleLow: number;
  credibleHigh: number;
  upliftLow: number;
  upliftHigh: number;
}

export interface ExperimentResult {
  config: SimulatorConfig;
  design: ExperimentDesign;
  metrics: VariantMetrics[];
  sessions: SessionOutcome[];
  winnerId: ConceptId | null;
  allocation: Partial<Record<ConceptId, number>>;
  sampleRatioMismatch: boolean;
  decision:
    | "winner"
    | "no_decision_probability"
    | "no_decision_volume"
    | "no_decision_practical";
}

export interface LineageItem {
  gene: keyof PageGenes;
  value: string;
  sourceId: ConceptId | "mutation";
  evidence: string;
  confidence: "high" | "medium" | "exploratory";
}
