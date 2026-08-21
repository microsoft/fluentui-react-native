# Toolbar blockers

## Classification

- **Component shape:** composed / higher-order
- **Pure React Native feasibility:** partial in principle, but blocked in this package scope
- **Current task status:** blocked

## Analysis

Reviewed:

- `specs/toolbar/SPEC.md`
- `specs/toolbar/accessibility.md`
- `specs/toolbar/interaction.md`
- `specs/toolbar/usage.md`
- `specs/toolbar/tokens.yaml`
- canonical `src/components/button/*`
- canonical `src/primitives/icon/*`
- canonical composite keyboard/focus example: `packages/components/Menu/src/MenuItem/useMenuItem.ts`

## Blockers

1. The toolbar spec requires roving tabindex, arrow-key movement, Home/End, and wrap-around focus across child buttons. The current `Button` contract is a plain function component (`src/components/button/button.ts`) whose props are limited to `ButtonProps` (`src/components/button/button.types.ts`) and does not expose a ref/componentRef escape hatch for programmatic focus movement. Without that contract, Toolbar cannot move focus between buttons while preserving the one-tab-stop behavior required by the spec.
2. The package dependency surface is intentionally minimal (`packages/agentic/components/package.json` only depends on `@fluentui-react-native/design` and `@fluentui-react-native/framework-base`). It does not include the keyboard/focus helpers used by canonical composite widgets such as `MenuItem` (`packages/components/Menu/src/MenuItem/useMenuItem.ts`), so reproducing the required behavior here would require widening dependencies or changing shared primitives, both outside the allowed scope.
3. The spec requires logical Divider children, but this package does not have a local Divider implementation to reuse or test. A fake separator `View` would not satisfy the Divider sub-component contract and would leave the spec only partially implemented.

## Result

Keep the toolbar specs unchanged for now. Re-attempt implementation only after a focusable child-button contract and a local Divider primitive exist in this package scope, or the task is widened to allow those shared changes.
