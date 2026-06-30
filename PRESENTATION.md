# Project EVOLVE — interview walkthrough

## The 90-second founder cut

### Opening

> The brief asks how landing pages can improve over time. I treated that as an experimentation-system problem, not a page-design problem. This is EVOLVE: five strategic bets, transparent synthetic behavior, an evidence threshold, a generated challenger, and an unseen holdout.

### Five concepts

> I used Scholé itself because I wanted the exercise to produce something the team could imagine shipping. The target buyer is an HR or L&D leader who already pays for AI tools but cannot prove adoption. The five pages test distinct positioning territories: adaptive learning, ROI, role relevance, research trust, and an adoption diagnostic.

> I call this a concept tournament—not an A/B test—because several elements change together. It discovers directions; it does not establish component-level causality.

### Same visitor, five worlds

> This replay makes the treatments legible using one synthetic buyer. It is illustrative, not evidence. The aggregate experiment creates one unique synthetic population, then block-randomizes each visitor to exactly one arm.

### Synthetic traffic

> The simulator is seeded and inspectable. Every visitor has a role, company fit, intent, pain priority, device, and attention profile. Those traits drive probabilistic behavior. I avoided LLM-as-customer theater because an LLM preference is not customer evidence.

### Evidence

> Qualified meeting completions select the winner. Scroll, dwell, and clicks only explain why. Variant B clears a pre-declared contract: at least 95% probability of a 0.50-point practical lift over the declared baseline, at least 80% probability best in discovery, and 20 qualified outcomes in every arm. If those conditions fail, the system says no winner.

### Evolution

> The generated challenger has computed lineage. The primary outcome selects its promise and structure, while the strongest observed interaction and proof-engagement signals select those genes. The current default composes ROI positioning with the diagnostic interaction, then adds one exploration mutation: a concrete 20-minute adoption plan.

> Because the tournament is confounded, this is a proposal—not proof that every inherited element caused lift.

### Holdout and ship

> I then shift the unseen cohort toward skeptical enterprise buyers and heavier mobile traffic. The challenger has to generalize before it earns a real experiment. The final button exports the production hypothesis, allocation, guardrails, instrumentation, and stopping policy.

### Robustness

> One seed can flatter a model, so I stress-test the entire loop across 50 independent cohorts—840,000 synthetic sessions. Under the defaults, Variant B wins 49 discovery cohorts, but the dynamically composed challenger clears only 6 holdouts; 43 return no decision and the incumbent wins once. That refusal to manufacture improvement is the point. You can inspect every exception, change the policy, and rerun the study.

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

Qualified meeting completions divided by eligible, exposed, randomized unique visitors—an intent-to-treat metric. Not CTR. Not raw form fills. The lead must be a decision-maker with target-organization fit.

### What would you do after launch?

Run the incumbent-versus-challenger test on real traffic, keep allocation stable, monitor guardrails, and stop only according to the declared decision policy. If the challenger wins, isolate the most consequential inherited genes in controlled follow-ups.

### What would change with more time?

Calibrate the behavioral model using anonymized real funnel baselines, add acquisition-source strata, persist experiment runs, connect a real analytics schema, and test copy generation behind a human review gate.

## One sentence to remember

> EVOLVE uses simulation to validate the learning system, then uses real traffic to validate the market claim.
