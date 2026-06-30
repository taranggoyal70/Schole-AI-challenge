# Scholé Growth Challenge

This context defines the business language for a growth experiment demonstrating how Scholé can improve its landing pages through simulated visitor behavior.

## Language

**Scholé**:
An enterprise learning platform that creates adaptive, role-specific AI training for employees.
_Avoid_: Generic course platform, AI course library

**Buyer**:
An HR or Learning and Development leader responsible for workforce capability, AI adoption, and the business value of employee training.
_Avoid_: User, learner, employee

**Learner**:
An employee who receives role-specific AI training through Scholé.
_Avoid_: Buyer, lead

**Target organization**:
A company with roughly 200–2,000 employees that already provides AI tools but cannot demonstrate broad, effective employee adoption.
_Avoid_: User, customer

**Adoption gap**:
The difference between providing employees access to AI tools and employees using those tools effectively in their daily work.
_Avoid_: Skills gap, low engagement

**Prospect**:
A visitor from a target organization who is evaluating whether Scholé could close its adoption gap.
_Avoid_: Learner, generic traffic

**Qualified meeting**:
A completed meeting request from a **Prospect** whose role is a target decision-maker and whose simulated organization-fit score is at least 0.5. It is the primary business outcome for the experiment.
_Avoid_: CTA click, lead, signup

**Behavior signal**:
An observed interaction—such as scroll depth, section dwell time, or CTA engagement—that helps explain a prospect’s journey but does not by itself represent business success.
_Avoid_: Conversion, result

**Concept tournament**:
An exploratory comparison of five substantially different landing-page strategies intended to discover promising positioning, structure, and interaction patterns. It generates hypotheses but does not isolate the causal effect of any single page element.
_Avoid_: A/B test, causal experiment

**Declared baseline**:
The comparison concept named in the experiment design. Discovery defaults to Variant A; a pairwise holdout uses the current incumbent. The engine does not special-case either concept ID.
_Avoid_: Permanent control, winner, original truth

**Randomized unique visitor**:
A synthetic visitor assigned once to exactly one treatment arm through seeded blocked randomization. The visitor, not a page-session clone, is the unit of analysis.
_Avoid_: Reused visitor, impression

**Generated challenger**:
A new landing-page concept informed by the tournament’s business outcomes and behavior signals. It is a hypothesis for a controlled follow-up experiment, not a proven optimum.
_Avoid_: Final winner, optimized page

**Synthetic visitor**:
A simulated prospect or non-target visitor with an explicit role, organization fit, intent, pain priority, device, and attention profile.
_Avoid_: Customer, real user

**Synthetic experiment**:
A reproducible comparison produced by an inspectable probabilistic model of synthetic visitor sessions. It demonstrates the learning system and generates hypotheses; it does not establish real-market lift.
_Avoid_: Customer research, production experiment, proof

**Simulation assumption**:
An explicit, adjustable belief about traffic composition or how visitor traits and page concepts influence behavior.
_Avoid_: Finding, observed fact

**Decision policy**:
The declared minimum practical lift, posterior probability, probability-best threshold for discovery, and qualified-meeting volume required before the system recommends one concept over its comparator.
_Avoid_: Highest observed rate, statistical significance

**No decision**:
The correct experiment state when no concept has met the evidence threshold. It prompts additional data collection instead of forcing a winner.
_Avoid_: Failed experiment, tie

**Page gene**:
A reusable landing-page decision such as a promise angle, proof pattern, interaction, call to action, or section-order rule.
_Avoid_: DOM component, design token

**Evolution engine**:
The inspectable process that proposes a **Generated challenger** by selecting compatible page genes supported by qualified-demo outcomes, interpreting behavior signals, and adding one deliberate exploratory mutation.
_Avoid_: AI optimizer, black-box generator

**Exploratory mutation**:
One intentional, unproven page-gene change introduced to preserve learning and avoid repeatedly exploiting the current best concept.
_Avoid_: Random redesign, winning element

**Challenger lineage**:
The explanation of which page genes produced a generated challenger, what evidence informed each choice, and which choice remains exploratory.
_Avoid_: AI rationale, changelog

**Guided evolution**:
The short, reviewer-facing journey that moves from initial concepts through synthetic behavior, evidence, challenger generation, and the recommended follow-up.
_Avoid_: Dashboard tour, presentation

**Experiment lab**:
The deeper workspace where a reviewer can inspect and adjust simulation assumptions, rerun synthetic experiments, and examine evidence.
_Avoid_: Admin panel, analytics dashboard

## Example dialogue

**Growth lead**: “The prospect is an L&D director whose organization already pays for Copilot, but most employees do not use it in their daily work.”

**Founder**: “So the buyer needs evidence that Scholé can close the adoption gap, while the learners need training relevant to their actual roles.”

**Growth lead**: “Exactly. The landing-page experiment should measure buyer intent without confusing it with learner engagement.”

**Founder**: “Which page won?”

**Growth lead**: “The page with the strongest qualified-demo rate. Its behavior signals explain the result, but they do not replace it.”

**Founder**: “Does that prove every element on the winning page is better?”

**Growth lead**: “No. The concept tournament discovers a promising direction. Its generated challenger must earn its place in a controlled follow-up.”

**Founder**: “Can we claim the generated challenger will improve our real conversion rate?”

**Growth lead**: “No. The synthetic experiment validates the mechanics and exposes our assumptions. Only a randomized experiment with real prospects can establish market lift.”

**Founder**: “Concept C currently has the highest qualified-demo rate. Should we generate from it now?”

**Growth lead**: “Only if it meets the evidence threshold. Otherwise the result is no decision, and the system should collect more sessions.”

**Founder**: “Why did the generated challenger use the ROI promise and the interactive diagnostic?”

**Growth lead**: “Its lineage shows that the ROI promise came from the strongest qualified-demo outcome, the diagnostic was supported by downstream engagement, and the CTA wording is the single exploratory mutation.”

**Founder**: “Can I understand the idea without configuring the model?”

**Growth lead**: “Yes. Guided evolution tells the complete story first; the experiment lab is there when you want to inspect or challenge the assumptions.”
