---
name: agentic-component-authoring
description: Generate or update Fluent UI React Native components in packages/agentic-components. Use for component APIs, slots, state hooks, token styling, render functions, tests, stories, and spec-driven component work.
license: MIT
---

# Agentic component authoring

Build components in `packages/agentic-components` as React Native adaptations of the Fluent UI v9 component pattern.

## Choose the component kind

- Higher-order components live in `src/components`. Read the
  [higher-order component instructions](../../../packages/agentic-components/src/components/AGENTS.md) before changing
  them.
- Primitive components live in `src/primitives`. Read the
  [primitive instructions](../../../packages/agentic-components/src/primitives/AGENTS.md) before changing them.

## Workflow

1. Read the repository `AGENTS.md`, the component's colocated `SPEC.md`, and every companion file it references.
2. Decide whether the work is a higher-order component or a primitive, then read the applicable scoped `AGENTS.md`.
3. Inspect the closest canonical implementation before choosing file structure, slot patterns, or public API shape.
4. Preserve the specification's variants, accessibility contract, interaction states, and platform guidance. Document a
   genuine contract gap rather than inventing an unrelated value.
5. Keep public props and slots small, typed, and compatible with the package's composition patterns.
6. Export the component and its public types explicitly from `src/index.ts`; never use wildcard exports.
7. Update tests and Storybook stories to exercise the public slot-based API.

## Coverage

Use `@testing-library/react-native` with accessible queries and async events for component rendering tests; do not import
`react-test-renderer` directly. Keep visual-state snapshots focused on resolved component output.

Run the package build, test, lint, and format commands, then run the root `yarn build` when public types or project references change.
