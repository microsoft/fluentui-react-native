---
name: furn-component-authoring
description: Implement, change, or plan Fluent UI React Native components and primitives, including public APIs, slots, state, token styling, rendering, tests, and stories. Use for new FURN-pattern components or changes to modern components. Not for contract-only work, read-only reviews, legacy v0/v1 maintenance, or application build tooling.
license: MIT
---

# FURN component authoring

Read [consumer context](../../../references/agents/portable/context.md) first.
Identify whether this is a FURN contribution or a component in another
application. Follow that workspace's instructions, contracts, and declared
validation scripts; do not impose FURN's repository layout or release tooling.

## Select focused knowledge

Use the installed `@fluentui-react-native/components/references/README.md`
as the pattern index, not as instructions to edit the dependency itself.

| Work                                  | Package reference                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Higher-order component or primitive   | `@fluentui-react-native/components/references/higher-order-components.md` or `@fluentui-react-native/components/references/primitives.md`                                            |
| Public props, slots, refs, or exports | `@fluentui-react-native/components/references/types-and-slots.md`                                                                                                                    |
| State and interaction                 | `@fluentui-react-native/components/references/state-and-accessibility.md`                                                                                                            |
| Tokens and styling                    | `@fluentui-react-native/components/references/styles-and-tokens.md`, `@fluentui-react-native/design/references/tokens.md`, and `@fluentui-react-native/design/references/styling.md` |
| Rendering and assembly                | `@fluentui-react-native/components/references/rendering.md`                                                                                                                          |
| Tests and stories                     | `@fluentui-react-native/components/references/tests-and-stories.md`                                                                                                                  |

For focus, keyboard, or native focus refs, use [common focus](../../../references/agents/focus/common.md)
and only the applicable [Windows/Win32](../../../references/agents/focus/windows-win32.md)
or [macOS](../../../references/agents/focus/macos.md) guidance.
For interactive semantics, read [accessibility](../../../references/agents/portable/accessibility.md).
These shared references are not additional skills.

## Workflow

For a plan-only request, perform steps 1-4 read-only and return the proposed
contract revision, selected references, implementation order, and validation
plan. Do not edit files or start native workloads.

1. Read the host instructions and existing component contract. Higher-order
   components use `SPEC.md` and `spec/` companions; primitives may use a
   colocated `CONTRACT.md`. Preserve the reviewed local behavior.
2. Before implementing a higher-order component with an absent, stale, draft,
   or newly challenged contract, complete
   [contract authoring](../furn-component-contract-authoring/SKILL.md) and its
   explicit pre-code review gate. A reviewed unchanged contract needs no
   ceremonial rewrite.
3. Inspect the nearest compatible implementation in the target workspace.
   In the FURN components source package, Button and Icon are the canonical
   higher-order and primitive examples. Do not assume those source paths
   exist in a consuming application.
4. Establish public props, slots, native roots/refs, state ownership,
   accessibility, interaction, tokens, and target platforms. Resolve product
   and renderer constraints before implementation.
5. Implement types and slots, state and accessibility, styling and slot
   props, pure rendering, component assembly, and explicit named exports.
   Keep React Native adaptation distinct from web anatomy.
6. Preserve token meaning and the reviewed contract. Record genuine missing
   tokens or platform capabilities rather than guessing substitutes.
7. Add focused runtime/type tests and stories for the public API and resolved
   native output. Native action, focus, and input claims need native evidence.
8. Reconcile the contract, implementation, and evidence. Source refreshes
   propose changes; they never automatically ratify local behavior.
9. Run the target workspace's declared checks, narrowest first, then its
   acceptance checks. Report passed, failed, skipped, not run, and unsupported
   distinctly. Follow the host's release rules.

Keep one component's types, state, styling, and rendering in one implementation
context. In a FURN source checkout, its root/scoped instructions additionally
route legacy maintenance, read-only review, cross-component optimization,
native overlays, and Storybook application work; those contributor skills
are not prerequisites for using this public suite.
