# Popover blockers

## Classification

- **Component kind:** higher-order / composed floating surface
- **Pure React Native feasibility:** **blocked**

## Analysis

Reviewed:

- `specs/popover/SPEC.md`
- `specs/popover/usage.md`
- `specs/popover/interaction.md`
- `specs/popover/accessibility.md`
- `specs/popover/tokens.yaml`
- canonical authoring references for tests, rendering, and state/accessibility
- comparable overlay implementations in `packages/components/Menu` and `packages/components/Callout`

## Blockers

1. **Anchoring and edge-aware positioning are core contract requirements.** The popover must stay attached to a trigger, follow the trigger center, flip around viewport edges, and keep the arrow within the container’s radius inset (`interaction.md`, `SPEC.md`). That is more than a static React Native view can guarantee; it needs a dedicated anchor/measurement/overlay strategy.

2. **Light dismiss and focus lifecycle need an overlay host.** The popover must dismiss on outside press and `Escape`, trap focus while open, and return focus to the trigger on close (`interaction.md`, `accessibility.md`). The analogous surfaces in this repo rely on native Callout / Modal plumbing rather than a plain RN tree.

3. **The accessibility contract is dialog-like, not purely visual.** The trigger must carry `aria-controls`, `aria-expanded`, and `aria-haspopup`, while the popover must announce a role and accessible name on open (`accessibility.md`). Pure RN does not currently provide a shared overlay abstraction in `agentic-components` that can guarantee that behavior consistently on Windows/macOS.

4. **The component is a shared overlay primitive, not just a styled container.** InfoLabel and other authored consumers expect a reusable Popover surface with runtime open state, dismissal behavior, and anchor-relative placement. The current `agentic-components` source tree has no existing popover implementation to extend, so a complete pure-RN version would require introducing new overlay infrastructure out of scope for this task.

## Result

Leave the spec files unchanged. Implementation is blocked until the overlay/anchor strategy is defined or the contract is relaxed.
