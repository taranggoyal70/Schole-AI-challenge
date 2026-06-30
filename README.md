# Project EVOLVE

An inspectable landing-page evolution system built for the Scholé Growth Engineer challenge.

EVOLVE compares five strategically different landing pages, simulates visitor sessions with explicit assumptions, selects an incumbent using a Bayesian evidence policy, generates a challenger with visible lineage, and tests that challenger against an unseen holdout cohort.

## Challenge coverage

| Requirement from the brief | Where EVOLVE satisfies it |
| --- | --- |
| Develop and host a web app | Production Vercel deployment |
| Compare at least five landing pages | Generation 0 contains five complete Scholé concepts |
| Vary messaging, structure, layout, or CTA | Every concept has a distinct promise, sequence, interaction, and CTA |
| Simulate user behavior | Seeded sessions model clicks, scroll depth, dwell, proof engagement, interactions, and demo completion |
| Explain how pages were compared | Concept hypotheses, exposed simulation assumptions, and Bayesian policy |
| Identify better-performing versions | Results view selects an incumbent only after four evidence thresholds |
| Generate a new variation | Generation 1 creates Variant F from inherited page genes plus one mutation |
| Explain what changed and why | Every generated gene shows its source, evidence, and confidence |
| Learn over time | Discovery → generation → unseen holdout → real-test export |
| Go beyond the requirements | Same-buyer replay, no-decision state, counterfactual lab, 50-cohort robustness study, holdout gauntlet, and production experiment plan |

## The product decision

The demo uses Scholé itself as the product.

- **Buyer:** HR, L&D, and AI transformation leaders
- **Target organization:** 200–2,000 employees with AI tools already deployed
- **Core problem:** access to AI tools has not become effective daily adoption
- **Primary outcome:** qualified demos per randomized unique visitor

Clicks, scroll depth, dwell time, and interaction completion are diagnostic signals. They help explain performance; they do not select the winner.

## The five initial concepts

| Variant | Concept | Strategic hypothesis |
| --- | --- | --- |
| A | Adaptive learning | Product-led positioning converts category-aware buyers |
| B | Measurable ROI | Naming the cost of unused AI tools creates buyer urgency |
| C | Role relevance | Role-specific previews make deployment feel concrete |
| D | Research trust | Scientific and enterprise proof reduces perceived risk |
| E | Adoption diagnostic | A self-assessment turns latent concern into an owned problem |

This first round is deliberately called a **concept tournament**. Because messaging, structure, interaction, and CTA vary together, it discovers promising territory but cannot isolate the causal effect of one element.

## Synthetic visitor model

Each session receives:

- a buyer or non-buyer persona;
- organization fit and purchase intent;
- an ROI, relevance, or research-trust priority;
- an attention profile;
- desktop or mobile context.

These traits influence bounce, scroll depth, proof engagement, interaction completion, CTA clicks, and demo completion through an inspectable probabilistic model.

The same seed reproduces the same experiment. The Experiment Lab exposes the highest-leverage traffic assumptions and includes a low-evidence preset that correctly returns **No winner yet**.

Synthetic results validate the system mechanics, not Scholé’s real-market conversion lift.

## Evidence policy

A concept is selected only when it has:

- at least 90% probability of beating the control;
- at least 80% probability of being the best concept;
- a positive 95% credible interval for qualified-demo uplift;
- at least 20 qualified demos.

Otherwise, the decision is **No winner yet**.

The default cohort selects Variant B, Measurable ROI, as the incumbent.

## Evolution engine

The generated challenger inherits:

- the ROI promise from Variant B;
- the diagnostic interaction from Variant E;
- research-backed proof from Variant D;
- problem-first sequencing from Variant B.

It introduces one deliberate exploratory mutation: **Get my 20-minute adoption plan**.

Every inherited gene shows its source, evidence, and confidence. The generated page is a hypothesis—not a proven optimum.

## Holdout gauntlet

The challenger is evaluated on a separate seed and shifted traffic mix:

- more decision-makers;
- greater research scrutiny;
- heavier mobile traffic.

No gene was selected using the holdout. Only after the challenger clears that test does EVOLVE generate a production experiment plan for real randomized traffic.

## Robustness observatory

A single seed can accidentally flatter a model. The Experiment Lab can therefore repeat discovery and holdout across 50 independent deterministic cohorts—840,000 synthetic sessions under the baseline assumptions.

The observatory reports incumbent stability, valid no-decision frequency, challenger holdout reliability, and average observed uplift. It also exposes counterexample seeds where discovery or holdout resists the tidy headline result, then lets an operator load that exact seed into the Lab for inspection.

Repeated synthetic cohorts test whether the simulation mechanics are stable. They still do not establish real-market lift.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:4173`.

## Verify

```bash
pnpm test
pnpm build
```

## Architecture

- React + TypeScript + Vite
- deterministic seeded simulation
- beta-binomial posterior sampling
- lazy-loaded analytical charts
- responsive, keyboard-accessible interaction
- no API keys, backend, or fabricated production data

## Runtime and data integrity

- The app does not use `localStorage`, `sessionStorage`, IndexedDB, cookies, or service workers.
- It makes no API or analytics requests. Every challenge result is computed in the browser from the visible seed and assumptions.
- Concept CTA previews are functional, explicitly illustrative, and held only in React memory; they do not pretend to submit a lead.
- Refreshing the page restores the declared baseline. Export is the only file-writing action and contains no visitor records.

The challenge-domain glossary lives in [CONTEXT.md](./CONTEXT.md), and the interview walkthrough lives in [PRESENTATION.md](./PRESENTATION.md).

---

Candidate: Tarang Goyal
