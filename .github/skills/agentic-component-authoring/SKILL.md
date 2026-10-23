---
name: agentic-component-authoring
description: Implement, change, or plan changes to components and primitives in packages/agentic/components, including every new component. Covers public APIs, slots, state, token styling, rendering, tests, and stories. Not for contract-only work, read-only reviews, v0/v1 maintenance, or the Storybook app toolchain.
license: MIT
---

# Agentic component authoring

Build components in `packages/agentic/components` as React Native adaptations of the Fluent UI v9 component pattern.
New components always use this workflow; v0 and v1 are maintenance-only. This skill routes the work. Load only the
references the current change needs.

## Choose the component kind

- **Higher-order components** live in `src/components`. Read the
  [package instructions](../../../packages/agentic/components/AGENTS.md) and the
  [higher-order component reference](../../../packages/agentic/components/references/higher-order-components.md). The
  component's `SPEC.md` and `spec/` companions are its contract.
- **Primitives** live in `src/primitives`. Read the package instructions and the
  [primitive reference](../../../packages/agentic/components/references/primitives.md). A primitive's colocated
  `CONTRACT.md` is its contract; primitives have no upstream-backed `SPEC.md`.
- Changes spanning components, repeated helpers, or dependency boundaries also use the
  [optimization skill](../agentic-component-optimization/SKILL.md). Do not audit the whole package for a small edit.
- Read-only reviews use [review-component](../review-component/SKILL.md). Storybook application, native project,
  bundling, or CocoaPods work uses the [Storybook skill](../agentic-storybook-development/SKILL.md).
- Native views, codegen, or registration also use the
  [native component skill](../implement-native-component/SKILL.md) as an overlay.

## Load focused references

| Work                                                                         | Reference                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source interpretation, provenance, contract drafting, or divergences         | [Contract authoring](../agentic-component-contract-authoring/SKILL.md)                                                                                                                                                                     |
| Public props, slots, state types, native prop exposure, or exports           | [Types and slots](../../../packages/agentic/components/references/types-and-slots.md)                                                                                                                                                      |
| Defaults, derived state, interaction hooks, accessibility, or slots          | [State and accessibility](../../../packages/agentic/components/references/state-and-accessibility.md)                                                                                                                                      |
| Focus, focus visuals, keyboard activation, or native focus refs              | [Common focus authoring](../../../references/agents/focus/common.md), then [Windows/Win32](../../../references/agents/focus/windows-win32.md) or [macOS](../../../references/agents/focus/macos.md)                                        |
| Tokens, theme caching, state precedence, or slot style application           | [Styles and tokens](../../../packages/agentic/components/references/styles-and-tokens.md) and design [tokens](../../../packages/agentic/design/references/tokens.md) and [styling](../../../packages/agentic/design/references/styling.md) |
| Pure slot rendering, component assembly, or display names                    | [Rendering and assembly](../../../packages/agentic/components/references/rendering.md)                                                                                                                                                     |
| Runtime tests, type tests, snapshots, Storybook stories, or validation       | [Tests and stories](../../../packages/agentic/components/references/tests-and-stories.md)                                                                                                                                                  |
| Native React Native Windows Fabric components, codegen, registration, or UIA | [Windows Fabric native components](../../../references/agents/native/windows-fabric.md)                                                                                                                                                    |

A new higher-order component normally needs the types, state, styles, rendering, and tests references, plus focus
guidance when it is focusable. Load the Windows Fabric reference only for native Windows views. A focused fix loads only
the affected reference and its immediate neighbors.

## Workflow

For a plan-only request, follow steps 1 to 4 without editing, then return the planned contract revision, the
references used, the implementation order, and the validation plan.

1. Read the package instructions and the component's contract: `SPEC.md`, `spec/source.json`, and every React Native
   companion it references for a higher-order component, or `CONTRACT.md` for a primitive.
2. Higher-order components: use an existing reviewed contract directly when its source evidence and requested behavior
   are unchanged. If the contract is absent, stale, still a draft, or accompanied by new source evidence, run the
   [contract authoring workflow](../agentic-component-contract-authoring/SKILL.md) and complete its pre-code review
   gate first (R-AGENTIC-001 in the [package instructions](../../../packages/agentic/components/AGENTS.md)).
3. Inspect the closest canonical implementation:
   `packages/agentic/components/src/components/button` for a styled higher-order component, or
   `packages/agentic/components/src/primitives/icon` for a direct primitive.
4. Establish the public contract before implementation: variants, slots, native props, accessibility, interaction
   states, and platform behavior.
5. Implement in dependency order: types and slots, state and accessibility, styles and slot props, pure rendering,
   component assembly, and explicit exports.
6. Preserve the contract. Record a genuine token or platform gap rather than substituting an unrelated value or
   web-only behavior.
7. Add focused tests and stories that exercise the public API and the resolved native output.
8. Reconcile and ratify the local contract against the realized public types, tests, stories, and platform evidence.
   Upstream changes require explicit re-review and never overwrite the local contract.
9. Iterate with focused validation (R-VALID-004): `yarn test <component>` from the package, `yarn build` after type
   changes, and `yarn test --findRelatedTests <files>` after editing shared code. Before handover, run the package
   format, lint, build, and whole test suite, the Storybook bundle for story changes, and the root build when public
   types, manifests, or project references change. Then run `yarn clean-lage-cache` and `yarn lage buildci` once as
   final acceptance (R-VALID-003) and report results truthfully (R-VALID-002).

Do not divide one component implementation into separate sub-agent or sub-skill phases. Its types, state, styling, and
rendering form one contract and should remain in one implementation context.
