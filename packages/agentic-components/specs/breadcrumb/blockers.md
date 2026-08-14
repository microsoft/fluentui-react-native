# Breadcrumb blockers

## Classification

- **Component shape:** higher-order / molecular
- **Pure React Native feasibility:** partial

## Analysis

I reviewed:

- `specs/breadcrumb/SPEC.md`
- `specs/breadcrumb/usage.md`
- `specs/breadcrumb/interaction.md`
- `specs/breadcrumb/accessibility.md`
- `specs/breadcrumb/tokens.yaml`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`

## Blockers

1. The spec depends on `Popover`, `Menu`, and `Tooltip` behaviors/components.
2. This package currently only contains `Button` and `Icon`; there is no breadcrumb source tree to extend, and no in-package implementation for the overflow/tooltip surfaces.
3. The package manifest does not currently provide a dependency path to the experimental popover/tooltip packages, and this task scope forbids changing other components.

## Result

I could not fully implement Breadcrumb to the authored spec without out-of-scope dependency/package changes. Leaving the spec files unchanged as requested.
