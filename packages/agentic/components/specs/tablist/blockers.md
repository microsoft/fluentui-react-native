# Tablist blockers

## Classification

- **Component shape:** higher-order / composed
- **Pure React Native feasibility:** feasible in principle, but **blocked for this task**

## Analysis

Reviewed:

- `specs/tablist/SPEC.md`
- `specs/tablist/accessibility.md`
- `specs/tablist/interaction.md`
- `specs/tablist/usage.md`
- `specs/tablist/tokens.yaml`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`
- canonical `packages/components/TabList/src/TabList/*`
- canonical `packages/components/TabList/src/Tab/*`

## Blockers

1. The Tablist spec depends on a `Tab` child component for tab selection, keyboard navigation, and roving tabindex behavior.
2. This package currently has no `src/components/tab` or `src/primitives/tab` implementation to compose against, so I cannot author a complete Tablist contract in isolation.
3. The task scope forbids changing other components or shared package files, so I cannot add the missing Tab component alongside Tablist.

## Result

Keep the Tablist spec files unchanged. Re-attempt implementation only after a Tab component exists in this package, or allow a paired change that adds both Tab and Tablist together.
