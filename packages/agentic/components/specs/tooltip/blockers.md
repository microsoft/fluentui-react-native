# Tooltip blockers

## Classification

- **Component kind:** higher-order / overlay surface, not primitive.
- **Pure React Native fit:** **blocked for the authored contract**.

## Analysis

Reviewed:

- `specs/tooltip/SPEC.md`
- `specs/tooltip/usage.md`
- `specs/tooltip/interaction.md`
- `specs/tooltip/accessibility.md`
- `specs/tooltip/tokens.yaml`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`
- package manifest in `package.json`
- public exports in `src/index.ts`
- experimental reference implementation in `packages/experimental/Tooltip/src/*`

## Blockers

1. **Tooltip is an anchored floating surface, not a static view.**
   - The authored interaction contract requires hover persistence across both trigger and tooltip, `Escape` dismissal, and directional positioning (`Above`, `Below`, `Left`, `Right`).
   - That needs anchor measurement plus overlay/portal-style rendering to stay attached to the trigger while remaining hoverable.
   - A plain React Native tree in this package does not provide that infrastructure.

2. **The accessibility contract is trigger-coupled.**
   - The spec requires the trigger to own `aria-describedby`, while the tooltip container supplies the referenced `id` and tooltip role.
   - This package has no tooltip host/trigger pairing component to coordinate that relationship without adding new shared plumbing and exports.

3. **The experimental Tooltip already relies on native overlay plumbing.**
   - `packages/experimental/Tooltip` uses a native `RCTTooltip` component and callout/native anchoring behavior.
   - That is evidence the authored contract is not currently represented by a pure-RN surface in this scope.

4. **The current package scope cannot absorb the missing plumbing.**
   - `src/index.ts` exports only `Button` and `Icon`.
   - A complete Tooltip would require new public exports and overlay/dependency wiring, which the task explicitly forbids by disallowing shared-file changes.

## Result

Leave the `specs/tooltip` files unchanged. A complete implementation should wait for overlay/anchor infrastructure or a task scope that allows the necessary shared plumbing.
