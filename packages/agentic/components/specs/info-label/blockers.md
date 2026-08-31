# InfoLabel blockers

## Classification

- **Component kind:** higher-order / composed field affordance
- **Pure React Native feasibility:** **blocked**

## Analysis

Reviewed:

- `specs/info-label/SPEC.md`
- `specs/info-label/usage.md`
- `specs/info-label/interaction.md`
- `specs/info-label/accessibility.md`
- `specs/info-label/tokens.yaml`
- the canonical `Button` and `Icon` implementations in `src/components/button` and `src/primitives/icon`
- the existing Popover blocker record in `specs/popover/blockers.md`

## Blockers

1. **InfoLabel is contractually dependent on Popover behavior.** Its spec requires anchored floating placement, light dismiss, `Escape` dismissal, focus return, and open-state accessibility wiring. Those requirements are the same overlay problems already marked blocked for Popover itself.

2. **There is no reusable overlay/anchor host in `agentic-components`.** Button and Icon are available, but they are not enough to implement a spec-compliant Popover surface with trigger-relative positioning and dismissal lifecycle.

3. **The component’s accessibility contract is incomplete without the overlay primitive.** The trigger/popover relationship (`aria-controls`, `aria-expanded`, `aria-haspopup`) depends on the same runtime overlay host that Popover needs.

## Result

Leave the InfoLabel spec files in `specs/info-label/` unchanged for now. Implement InfoLabel after the Popover/overlay contract is unblocked.
