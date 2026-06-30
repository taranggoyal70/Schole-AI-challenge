import type { Concept } from "../types";

export const concepts: Concept[] = [
  {
    id: "control",
    shortLabel: "A",
    name: "Adaptive learning",
    hypothesis:
      "Scholé’s current product-led promise will convert buyers who already understand the category.",
    color: "#7c6ff2",
    accent: "#aaa2ff",
    hero: {
      eyebrow: "Agentic learning for enterprise teams",
      headline: "Faster competency.",
      accentLine: "Higher engagement.",
      body:
        "Scholé constructs exactly the right AI lesson for every employee, grounded in 10+ years of learning science.",
      cta: "Book a demo",
      secondary: "See how it works",
    },
    genes: {
      promise: "Adaptive learning",
      proof: "10+ years of research",
      interaction: "Product walkthrough",
      cta: "Book a demo",
      structure: "Product first",
    },
    sectionLabels: ["How it works", "Adaptive learning", "Research", "Demo"],
  },
  {
    id: "roi",
    shortLabel: "B",
    name: "Measurable ROI",
    hypothesis:
      "Naming the cost of unused AI tools will create urgency and increase qualified demo demand.",
    color: "#c13393",
    accent: "#ef6c70",
    hero: {
      eyebrow: "Turn AI access into measurable adoption",
      headline: "Your AI stack is paid for.",
      accentLine: "Is your workforce using it?",
      body:
        "Find where adoption stalls, build role-specific capability, and prove the return on every AI seat.",
      cta: "Estimate the adoption gap",
      secondary: "View customer outcomes",
    },
    genes: {
      promise: "Recover AI-tool ROI",
      proof: "Adoption and mastery metrics",
      interaction: "ROI estimator",
      cta: "Estimate the adoption gap",
      structure: "Problem → cost → outcome",
    },
    sectionLabels: ["Adoption cost", "ROI estimator", "Outcomes", "Demo"],
  },
  {
    id: "personal",
    shortLabel: "C",
    name: "Role relevance",
    hypothesis:
      "Showing role-specific learning paths will help L&D buyers picture deployment across diverse teams.",
    color: "#e1a82b",
    accent: "#ffd66b",
    hero: {
      eyebrow: "One workforce. Hundreds of learning paths.",
      headline: "AI training built around",
      accentLine: "how your people actually work.",
      body:
        "From HR to operations, every employee learns with their own tools, tasks, level, and pace.",
      cta: "Build a role path",
      secondary: "Explore departments",
    },
    genes: {
      promise: "Role-specific relevance",
      proof: "Tools and tasks by department",
      interaction: "Role-path builder",
      cta: "Build a role path",
      structure: "Choose role → preview path",
    },
    sectionLabels: ["Role picker", "Learning path", "Formats", "Demo"],
  },
  {
    id: "trust",
    shortLabel: "D",
    name: "Research trust",
    hypothesis:
      "Leading with scientific credibility and enterprise proof will reduce risk for skeptical buyers.",
    color: "#4665c8",
    accent: "#7ea5ff",
    hero: {
      eyebrow: "Where learning science meets enterprise AI",
      headline: "Not another course library.",
      accentLine: "A pedagogical engine.",
      body:
        "Built from 40+ papers, EPFL and UC Berkeley research, and deployments with ambitious learning teams.",
      cta: "See the evidence",
      secondary: "Meet the founders",
    },
    genes: {
      promise: "Scientifically grounded",
      proof: "40+ papers and enterprise deployments",
      interaction: "Evidence explorer",
      cta: "See the evidence",
      structure: "Credibility → method → proof",
    },
    sectionLabels: ["Research", "Method", "Customers", "Demo"],
  },
  {
    id: "diagnostic",
    shortLabel: "E",
    name: "Adoption diagnostic",
    hypothesis:
      "A useful self-assessment will convert latent concern into a concrete, buyer-owned problem.",
    color: "#db5c52",
    accent: "#ff9871",
    hero: {
      eyebrow: "A two-minute workforce diagnostic",
      headline: "How wide is your",
      accentLine: "AI adoption gap?",
      body:
        "Score your teams across access, confidence, daily use, and measurable business impact.",
      cta: "Score my workforce",
      secondary: "See a sample report",
    },
    genes: {
      promise: "Diagnose the adoption gap",
      proof: "Personalized benchmark report",
      interaction: "Adoption assessment",
      cta: "Score my workforce",
      structure: "Question → score → recommendation",
    },
    sectionLabels: ["Diagnostic", "Benchmark", "Recommendations", "Demo"],
  },
];

export const evolvedConcept: Concept = {
  id: "evolved",
  shortLabel: "F",
  name: "The adoption plan",
  hypothesis:
    "Combining the strongest current outcome, interaction, and proof-engagement sources will outperform the incumbent on unseen traffic.",
  color: "#bb2f91",
  accent: "#f27d62",
  hero: {
    eyebrow: "Your AI tools are live. Now make adoption visible.",
    headline: "Find the adoption gap.",
    accentLine: "Build the plan to close it.",
    body:
      "In two minutes, see where AI usage stalls across your workforce—and how role-specific learning turns access into measurable impact.",
    cta: "Get my 20-minute adoption plan",
    secondary: "Built on 10+ years of research",
  },
  genes: {
    promise: "Recover AI-tool ROI",
    proof: "10+ years of research + adoption metrics",
    interaction: "Adoption assessment",
    cta: "Get my 20-minute adoption plan",
    structure: "Problem → diagnostic → proof → plan",
  },
  sectionLabels: ["Adoption cost", "Diagnostic", "Research proof", "Plan"],
};

export const conceptById = Object.fromEntries(
  [...concepts, evolvedConcept].map((concept) => [concept.id, concept]),
);
