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
  qualifiedDemos: number;
  qualifiedDemoRate: number;
  ctaRate: number;
  deepScrollRate: number;
  interactionRate: number;
  averageDwell: number;
  probabilityBest: number;
  probabilityBeatControl: number;
  credibleLow: number;
  credibleHigh: number;
  upliftLow: number;
  upliftHigh: number;
}

export interface ExperimentResult {
  config: SimulatorConfig;
  metrics: VariantMetrics[];
  sessions: SessionOutcome[];
  winnerId: ConceptId | null;
  decision:
    | "winner"
    | "no_decision_probability"
    | "no_decision_volume"
    | "no_decision_interval";
}

export interface LineageItem {
  gene: keyof PageGenes;
  value: string;
  sourceId: ConceptId | "mutation";
  evidence: string;
  confidence: "high" | "medium" | "exploratory";
}
