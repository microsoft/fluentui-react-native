---
name: agentic-component-optimization
description: Analyze and optimize packages/agentic-components as a whole when repeated patterns, dependency direction, or extraction boundaries cross components.
license: MIT
---

# Agentic component optimization

Use this skill when a change is about the package as a system, not a single component fix. It helps decide whether repeated code
belongs in `src/common`, `@fluentui-react-native/framework-base`, or `@fluentui-react-native/design/styling`, and whether a
primitive or helper should exist at all.

## Read first

1. Read `packages/agentic-components/AGENTS.md` and `packages/agentic-components/src/AGENTS.md`.
2. Read the relevant component or primitive `AGENTS.md` file and the colocated `SPEC.md` files for the affected area.
3. Inspect the canonical implementations:
   - `packages/agentic-components/src/components/button`
   - `packages/agentic-components/src/primitives/icon`

## Audit checklist

### 1. Dependency direction

- Production source may depend only on React / React Native native components, `@fluentui-react-native/design`, and
  `@fluentui-react-native/framework-base`.
- Generalizable non-styling hooks belong in `framework-base/src/hooks`.
- Styling helpers belong in `agentic-design/src/styling`.
- Component-library-specific non-public types, constants, and helpers belong in `packages/agentic-components/src/common`.

### 2. Repetition and ownership

Look for repeated:

- types and discriminated unions
- constants and default tables
- state routines and prop normalization
- slot wiring or subtree assembly
- primitive behaviors or structural contracts

Prefer extraction only when the repeated shape is stable and shared across multiple components.

### 3. Validate extraction payoff

Before extracting, confirm that the change:

- reduces repeated logic without widening public APIs
- preserves component-qualified exports and call sites
- improves dependency direction instead of hiding it
- keeps the resulting abstraction smaller than the duplication it replaces

### 4. Do-not-extract criteria

Do not extract when the code is:

- one-off component behavior
- a styling decision that belongs in the owning component
- a public prop contract or display-specific variant
- a thin wrapper around a single native element
- easier to read in place than through another helper

## Output

Return a short recommendation with:

- what to keep local
- what to move to shared package/common code
- whether the extraction is worth doing now
- any public API or dependency risks

If the work is just a tiny component edit, stop at the component instructions and do not run a whole-package audit.
