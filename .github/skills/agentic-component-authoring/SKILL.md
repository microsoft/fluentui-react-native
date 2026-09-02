---
name: agentic-component-authoring
description: Generate or update Fluent UI React Native components in packages/agentic/components. Use for component APIs, slots, state hooks, token styling, render functions, tests, stories, and spec-driven component work.
license: MIT
---

# Agentic component authoring

Build components in `packages/agentic/components` as React Native adaptations of the Fluent UI v9 component pattern.
This skill is the workflow router. Load only the references needed for the current change instead of placing every
authoring rule in one always-loaded instruction file.

## Choose the component kind

- Higher-order components live in `src/components`. Read the
  [higher-order component instructions](../../../packages/agentic/components/src/components/AGENTS.md).
- Primitive components live in `src/primitives`. Read the
  [primitive instructions](../../../packages/agentic/components/src/primitives/AGENTS.md).
- If the change spans multiple components, repeated helpers, or shared dependency boundaries, read the
  [package-wide optimization guidance](../agentic-component-optimization/SKILL.md) and
  [`packages/agentic/components/src/AGENTS.md`](../../../packages/agentic/components/src/AGENTS.md). Do not run a
  whole-package audit for a tiny single-component edit.
- Work on the Storybook application, native projects, bundling, or CocoaPods belongs to the
  [agentic Storybook development skill](../agentic-storybook-development/SKILL.md), not this component workflow.

## Load focused references

| Work                                                                         | Reference                                                                          |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Source interpretation, provenance, contract drafting, review, or divergences | [Contract authoring](../agentic-component-contract-authoring/SKILL.md)             |
| Public props, slots, state types, native prop exposure, or exports           | [Types and slots](references/types-and-slots.md)                                   |
| Defaults, derived state, interaction hooks, accessibility, or slots          | [State and accessibility](references/state-and-accessibility.md)                   |
| Tokens, theme caching, state precedence, or slot style application           | [Styles and tokens](references/styles-and-tokens.md)                               |
| Pure slot rendering, component assembly, or display names                    | [Rendering and assembly](references/rendering.md)                                  |
| Runtime tests, type tests, snapshots, Storybook stories, or validation       | [Tests and stories](references/tests-and-stories.md)                               |
| Native React Native Windows Fabric components, codegen, registration, or UIA | [Windows Fabric native components](references/windows-fabric-native-components.md) |
| Cross-component duplication, shared extraction, or dependency hygiene        | [Package optimization](../agentic-component-optimization/SKILL.md)                 |

A new higher-order component normally needs every reference. A focused fix should load only the affected reference and
its immediate neighbors. Keep the component's colocated `SPEC.md` and companion files authoritative for its contract.

## Workflow

1. Read the repository and package instructions, the component `SPEC.md`,
   `spec/source.json`, and every React Native companion referenced by the spec.
2. Use an existing reviewed contract directly when its source evidence and
   requested behavior are unchanged. If the contract is absent, stale, still a
   draft, or accompanied by new source evidence, run the
   [contract authoring workflow](../agentic-component-contract-authoring/SKILL.md)
   and complete its pre-code review gate first.
3. Inspect the closest canonical implementation. Use
   [`components/button`](../../../packages/agentic/components/src/components/button) for a styled higher-order component
   and [`primitives/icon`](../../../packages/agentic/components/src/primitives/icon) for a direct primitive.
4. Establish the public contract before implementation: variants, slots, native props, accessibility, interaction
   states, and platform behavior.
5. Implement in dependency order: types and slots, state and accessibility, styles and slot props, pure rendering,
   component assembly, and explicit exports.
6. Preserve the specification. Record a genuine token or platform gap rather than substituting an unrelated value or
   web-only behavior.
7. Add focused tests and stories that exercise the public API and the resolved native output.
8. Reconcile and ratify the local contract against the realized public types,
   tests, stories, and platform evidence. Upstream changes require explicit
   re-review and never overwrite the local contract.
9. Run the smallest declared validation command while iterating. Finish with package format, lint, build, and tests; run
   the Storybook bundle for story changes and the root build when public types, manifests, or project references change.

Do not divide one component implementation into separate sub-agent or sub-skill phases. Its types, state, styling, and
rendering form one contract and should remain in one implementation context.
