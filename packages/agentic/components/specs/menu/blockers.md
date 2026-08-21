# Menu blockers

## Classification

- **Component shape:** composed / higher-order
- **Pure React Native feasibility:** partial in principle, but blocked in this package scope
- **Current task status:** blocked

## Analysis

Reviewed:

- `specs/menu/SPEC.md`
- `specs/menu/accessibility.md`
- `specs/menu/interaction.md`
- `specs/menu/tokens.yaml`
- `specs/menu/usage.md`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`
- package exports in `src/index.ts`

## Blockers

1. The Menu spec is explicitly a composition of a Popover surface plus MenuItem and Divider children. This package currently exports only `Button` and `Icon`, so there is no local Popover, MenuItem, or Divider implementation to assemble, test, or story.
2. The authored behavior requires a real overlay/popover pipeline: light-dismiss, trigger anchoring, submenu positioning, and focus return on close. Those behaviors are not present in the current package scope, and the task forbids changing shared manifests or other components to add the missing plumbing.
3. The accessibility contract depends on platform keyboard and focus behavior (`role="menu"`, `aria-controls`, `aria-expanded`, arrow-key roving focus, type-ahead, and submenu focus return). Implementing that faithfully without the missing popup and item primitives would be incomplete or fake.

## Result

Keep the Menu spec files unchanged. Re-attempt implementation only after the missing Popover/MenuItem/Divider stack exists in this package scope or the task is widened to allow creating and wiring those dependencies.
