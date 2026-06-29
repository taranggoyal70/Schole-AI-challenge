# Product Design QA

## Evidence

- Source and implementation captures were compared locally during visual QA.
- Raw QA screenshots are intentionally excluded from the public repository.
- Desktop viewport: 1280 × 720
- Mobile viewport: 390 × 844
- State: top-level landing/brief screen, light theme, unauthenticated

The implementation is a branded product extension rather than a clone of Scholé’s marketing homepage. The comparison therefore evaluates visual-system fidelity—typography, palette, spacing, gradients, surfaces, and responsive behavior—while treating the experiment-specific information architecture as intentional.

## Full-view comparison

Project EVOLVE carries the source’s spacious white canvas, soft magenta/coral gradient, restrained card borders, generous heading scale, and dark-slate body typography into a denser product interface. The source’s product screenshot is intentionally replaced by the EVOLVE system overview because the implementation serves a different workflow.

## Focused comparison

The brand/header and hero regions were compared separately because these contain the most fidelity-sensitive typography and color work. The implementation uses local Inter fonts and Libre Caslon Display for the Scholé wordmark, with a close match to the source’s optical weight and rhythm. The hero gradient and CTA treatment map directly to the source palette.

## Required fidelity surfaces

### Fonts and typography

- Body and interface text use local Inter at 400–700 weights, matching the source family.
- The wordmark uses Libre Caslon Display as a close open-source serif match.
- Heading hierarchy, tight display tracking, line height, and gradient emphasis preserve the source character.
- Desktop and mobile captures show clean wrapping without truncation.

### Spacing and layout rhythm

- The implementation preserves the source’s large outer margins, low-density hero, rounded surfaces, and fine borders.
- Experiment chrome is intentionally more compact than the marketing homepage.
- Desktop and mobile layouts have no horizontal overflow.
- Sticky navigation and footer controls remain usable without clipping content.

### Colors and visual tokens

- Slate foregrounds, warm-white background, magenta-to-coral CTA gradient, pale pink/lilac washes, and subtle gray borders map closely to the source.
- Winner, holdout-success, exploratory, and disabled states add restrained semantic colors while remaining within the brand system.

### Image quality and asset fidelity

- The app is a new experiment product, not a recreation of the source marketing page; source customer logos and product screenshots are therefore not reused or approximated.
- All functional icons come from one consistent Phosphor icon family.
- No emoji, handcrafted SVG substitutes, hotlinked source imagery, or placeholder raster assets are used.

### Copy and content

- All copy is specific to Scholé’s enterprise AI-adoption problem.
- Synthetic evidence is labeled consistently.
- The distinction between discovery, causal proof, generated hypotheses, and real-market validation is explicit throughout.

### Responsive behavior and accessibility

- Checked at 1280 × 720 and 390 × 844.
- No horizontal overflow at either viewport.
- Controls are semantic buttons/inputs with visible focus treatment.
- Range inputs have accessible labels.
- Mode and scenario controls expose pressed state.
- Reduced-motion preferences are respected.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] Header structure intentionally differs from source
  - Location: global app header.
  - Evidence: the source uses marketing navigation plus a launch banner; EVOLVE uses a mode switch and persistent synthetic-data notice.
  - Impact: this is visible design drift but supports the product workflow.
  - Classification: accepted intentional deviation.

- [P3] Mobile hero alignment differs from source
  - Location: brief screen at 390 px.
  - Evidence: Scholé centers its mobile marketing hero; EVOLVE uses left alignment to preserve an analytical product tone and improve scanning.
  - Impact: stylistic rather than functional.
  - Classification: accepted intentional deviation.

## Patches made during QA

- Shortened the hero statement so the primary CTA appears earlier.
- Removed nested interactive button markup from concept cards.
- Added scenario presets, including a verified “No winner yet” state.
- Added accessible range labels and pressed states.
- Added interval cleanup for the animated simulation.
- Lazy-loaded analytical charts and the Experiment Lab to reduce the initial JavaScript bundle.
- Switched from external font loading to bundled local font assets.

## Implementation checklist

- [x] Desktop composition checked
- [x] Mobile composition checked
- [x] Full-view comparison checked
- [x] Focused hero/header comparison checked
- [x] Concept modal interaction checked
- [x] Simulation loading and completion states checked
- [x] Evidence threshold state checked
- [x] Generated lineage checked
- [x] Holdout result checked
- [x] Counterfactual no-decision state checked
- [x] Browser console checked after nested-control fix

final result: passed
