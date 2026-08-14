# Dropdown blockers

## Classification

- **Component shape:** composed / higher-order
- **Pure React Native feasibility:** full in principle; the authored control uses only React Native surfaces, buttons, and focus management
- **Current task status:** blocked in this package scope

## Analysis

Reviewed:

- `specs/dropdown/SPEC.md`
- `specs/dropdown/accessibility.md`
- `specs/dropdown/interaction.md`
- `specs/dropdown/tokens.yaml`
- `specs/dropdown/usage.md`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`

## Blockers

1. The Dropdown spec is explicitly a composition of trigger chrome, a Popover surface, and ListboxItem rows. This package currently has only `Button` and `Icon` source; there is no local Dropdown, Popover, or ListboxItem implementation to extend.
2. The task scope forbids modifying other components, shared manifests, or package wiring, so I cannot add or connect the missing embedded dependencies required by the spec.
3. The authored behavior depends on those missing pieces for focus movement, open/close management, and row selection semantics, so a complete implementation cannot be finished safely inside this scope.

## Result

Keep the Dropdown spec files unchanged. Re-attempt implementation only after Popover and ListboxItem exist in this package or the scope is widened to allow creating them.
