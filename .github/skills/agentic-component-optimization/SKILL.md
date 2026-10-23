---
name: agentic-component-optimization
description: Analyze and optimize packages/agentic/components as a whole when repeated patterns, dependency direction, or extraction boundaries cross components.
license: MIT
---

# Agentic component optimization

Use this skill when a change is about the package as a system, not a single component fix. It helps decide whether repeated code
belongs in `src/common`, `@fluentui-react-native/framework-base`, or `@fluentui-react-native/design/styling`, and whether a
primitive or helper should exist at all.

## Read first

1. Read the [package instructions](../../../packages/agentic/components/AGENTS.md) and the
   [source boundaries reference](../../../packages/agentic/components/references/source-boundaries.md).
2. Read the [higher-order component](../../../packages/agentic/components/references/higher-order-components.md) or
   [primitive](../../../packages/agentic/components/references/primitives.md) reference and the colocated `SPEC.md` or
   `CONTRACT.md` files for the affected area.
3. Inspect the canonical implementations:
   `packages/agentic/components/src/components/button` and `packages/agentic/components/src/primitives/icon`.

## Audit checklist

### 1. Dependency direction

Apply the [source boundaries](../../../packages/agentic/components/references/source-boundaries.md#source-boundaries): production
dependencies, where generalizable hooks and styling helpers belong, and what stays in `src/common`.

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
