# Project EVOLVE — interview walkthrough

## The 90-second founder cut

### Opening

> The brief asks how landing pages can improve over time. I treated that as an experimentation-system problem, not a page-design problem. This is EVOLVE: five strategic bets, transparent synthetic behavior, an evidence threshold, a generated challenger, and an unseen holdout.

### Five concepts

> I used Scholé itself because I wanted the exercise to produce something the team could imagine shipping. The target buyer is an HR or L&D leader who already pays for AI tools but cannot prove adoption. The five pages test distinct positioning territories: adaptive learning, ROI, role relevance, research trust, and an adoption diagnostic.

> I call this a concept tournament—not an A/B test—because several elements change together. It discovers directions; it does not establish component-level causality.

### Same visitor, five worlds

> This replay makes the treatments legible using one synthetic buyer. It is illustrative, not evidence. The aggregate experiment uses separately randomized sessions.

### Synthetic traffic

> The simulator is seeded and inspectable. Every visitor has a role, company fit, intent, pain priority, device, and attention profile. Those traits drive probabilistic behavior. I avoided LLM-as-customer theater because an LLM preference is not customer evidence.

### Evidence

> Qualified demos select the winner. Scroll, dwell, and clicks only explain why. Variant B clears four pre-declared thresholds: probability versus control, probability of being best, positive uplift interval, and minimum qualified-demo volume. If those conditions fail, the system says no winner.

### Evolution

> The generated challenger has visible lineage. It inherits ROI urgency from B, the diagnostic interaction from E, and research proof from D. It also adds one exploration mutation: a concrete 20-minute adoption plan instead of a generic demo.

> Because the tournament is confounded, this is a proposal—not proof that every inherited element caused lift.

### Holdout and ship

> I then shift the unseen cohort toward skeptical enterprise buyers and heavier mobile traffic. The challenger has to generalize before it earns a real experiment. The final button exports the production hypothesis, allocation, guardrails, instrumentation, and stopping policy.

### Close

> The core idea is simple: automate the learning loop without automating away judgment. Synthetic behavior helps us test the machinery. Only real randomized traffic can validate the market claim.

## Likely questions

### Why Bayesian?

It gives a decision-maker an interpretable probability that one concept is better while supporting a valid no-decision state. The implementation uses beta-binomial posterior sampling for qualified-demo conversion.

### Why not let an LLM simulate customers?

LLMs can produce plausible narratives, but they are not calibrated customer models. A seeded probabilistic model is reproducible, inspectable, and honest about its assumptions. An LLM could later help draft copy, but it should not manufacture the evidence that selects that copy.

### Isn’t the generator recombining confounded evidence?

Yes. That is why EVOLVE calls the output a challenger and tests it against the incumbent. The generated lineage is hypothesis formation, not component-level causal attribution.

### What would you instrument in production?

- experiment assignment and exposure;
- acquisition source and device;
- hero visibility;
- diagnostic start and completion;
- CTA click;
- demo completion;
- lead qualification outcome;
- page performance and sample-ratio mismatch.

### What is the real primary metric?

Qualified demos divided by randomized unique visitors. Not CTR. Not raw form fills. The lead must match the target buyer and organization profile.

### What would you do after launch?

Run the incumbent-versus-challenger test on real traffic, keep allocation stable, monitor guardrails, and stop only according to the declared decision policy. If the challenger wins, isolate the most consequential inherited genes in controlled follow-ups.

### What would change with more time?

Calibrate the behavioral model using anonymized real funnel baselines, add acquisition-source strata, persist experiment runs, connect a real analytics schema, and test copy generation behind a human review gate.

## One sentence to remember

> EVOLVE uses simulation to validate the learning system, then uses real traffic to validate the market claim.
