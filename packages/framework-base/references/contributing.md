---
id: framework-base.contributing
kind: instruction-reference
owner_paths:
  - packages/framework-base
---

# Contributing to Framework Base

## Source map

| Path                      | Owns                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/component-patterns/` | `directComponent`, `phasedComponent`, slots, and the legacy patterns; see `component-patterns.md` |
| `src/jsx-runtime.ts`      | The custom JSX runtime exported as `@fluentui-react-native/framework-base/jsx-runtime`            |
| `src/hooks/`              | Shared interaction, focus-target, pressable, controllable-state, and motion hooks                 |
| `src/accessibility/`      | Universal, non-styling accessibility helpers; see `accessibility.md`                              |
| `src/immutable-merge/`    | `immutableMerge` and `immutableMergeCore`; see `immutable-merge.md`                               |
| `src/memo-cache/`         | `getMemoCache`, `getTypedMemoCache`, and `memoize`; see `memo-cache.md`                           |
| `src/merge-props/`        | `mergeProps`, `mergeStyles`, and the assign helpers; see `merge-props.md`                         |
| `src/types/`              | Public component, props, render, interactive, and utility types                                   |
| `src/utilities/`          | Children, style-extraction, prop-filtering, and type helpers                                      |
| `src/index.ts`            | The root entry point; export every public symbol explicitly by name                               |

## Compatibility invariants

- Keep the generic entry points import-safe without a React Native runtime. Generic modules use only type imports from
  `react-native`; runtime React Native imports belong in `.native.ts` variants, as in `src/hooks/`.
- Preserve the declared React 18.2, 19.0, and 19.1 and React Native 0.73-or-later peer ranges. Agentic components use
  React 19 ref props, but this package composes refs through slots and must keep working on React 18.
- Do not depend on `@fluentui-react-native/design`, `@fluentui-react-native/components`, or other higher-level packages.
  Keep proposed native services opt-in.
- Keep public types and runtime exports explicit in `src/index.ts`; add no barrel re-exports (R-REPO-001).

## Tests

Jest runs this package with the iOS platform preset declared in `package.json`. Add tests beside the source:

- `*.test.ts` or `*.test.tsx` for rendering, prop merging, children, keys, refs, and hook behavior;
- `*.types.test.ts` for compile-time assertions about public type behavior.

Iterate with a focused selection, such as `yarn test useSlot` or `yarn test --findRelatedTests src/hooks/useFocusTarget.ts`.

## Validation

Run the package's declared scripts: `yarn format`, `yarn lint`, `yarn build`, and `yarn test` (R-VALID-001). This is a
published package; add a changeset for every change (R-REPO-003). Finish code or configuration changes with one
`yarn clean-lage-cache` and then `yarn lage buildci` from the repository root (R-VALID-003, R-VALID-004), because most
workspaces depend on this package.
