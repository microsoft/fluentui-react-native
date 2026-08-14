# MenuButton blockers

## Classification

- **Component shape:** higher-order / molecular
- **Pure React Native feasibility:** full in principle
- **Current task status:** blocked in this package scope

## Analysis

Reviewed:

- `specs/menu-button/SPEC.md`
- `specs/menu-button/usage.md`
- `specs/menu-button/interaction.md`
- `specs/menu-button/accessibility.md`
- `specs/menu-button/tokens.yaml`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`
- package manifest and source tree under `packages/agentic-components`

## Blockers

1. The spec depends on `Menu`, `Popover`, and `MenuItem` behaviors/components, but this package currently only implements `Button` and `Icon`.
2. The package manifest does not currently expose a local dependency path to the menu/popover stack, so a complete authored implementation would require out-of-scope package wiring or new components.
3. The task scope forbids editing other components or shared files, so I cannot create the missing supporting primitives and overlay surface needed to satisfy the spec.

## Result

I could not fully implement MenuButton to spec within this scope. The menu-button specs remain in place, with this blocker note documenting why the implementation was not authored here.
