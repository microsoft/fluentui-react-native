# Agentic Components agent instructions

This is the instruction root for `@fluentui-react-native/components` and every descendant. The package owns the agentic
Fluent higher-order components, the public unstyled primitives, their React Native contracts, and the contract tooling.

## Start here

Read the [user guide](README.md), then select the narrowest topic in the [reference index](references/README.md):

| Task                                                                    | Read                                                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Add or change a higher-order component                                  | [Higher-order components](references/higher-order-components.md), then the topic references  |
| Add or change a public primitive                                        | [Primitives](references/primitives.md)                                                       |
| Create or revise a component contract, its sources, or its review state | [Contracts](references/contracts.md) and the matching `references/contract-sources/` file    |
| Public props, slots, refs, or exports                                   | [Types and slots](references/types-and-slots.md)                                             |
| State, interaction, or accessibility                                    | [State and accessibility](references/state-and-accessibility.md)                             |
| Styles, tokens, theme caching, or state precedence                      | [Styles and tokens](references/styles-and-tokens.md)                                         |
| Render functions and assembly                                           | [Rendering and assembly](references/rendering.md)                                            |
| Tests, stories, or native `wdio` story tests                            | [Tests and stories](references/tests-and-stories.md)                                         |
| Shared helpers, dependencies, or cross-component extraction             | [Source boundaries](references/source-boundaries.md)                                         |
| Commands, source ownership, or open work                                | [Contributing](references/contributing.md) or [remaining work](references/remaining-work.md) |

Implementation and planning use the `agentic-component-authoring` skill, contracts use the
`agentic-component-contract-authoring` skill, cross-component extraction uses the `agentic-component-optimization`
skill, and reviews use the `review-component` skill. Focus work starts with the repository's common focus reference
(`focus.common`), then `focus.windows-win32` or `focus.macos`; V1 Win32 is the behavioral baseline for both Windows
endpoints. Native views, codegen, or registration use the `implement-native-component` skill. Storybook application,
Metro, bundle, or CocoaPods work follows `apps/storybook/AGENTS.md`.

## Invariants

- **R-AGENTIC-001:** Before implementing a higher-order component whose contract is absent, stale, still a draft, or
  accompanied by new source evidence, create or revise its source-backed contract through the
  `agentic-component-contract-authoring` skill and complete its review gate. Never mechanically promote a web-authored
  specification.
- **R-AGENTIC-002:** This package targets React 19.1.4 or newer. Expose a stable native root ref through the `ref` prop,
  receive it as part of the component props, and forward it to the declared root slot. Do not use `forwardRef`.
- Use the `flex-authoring` profile and `flex-components:<name>` only for a pinned Flex/X3 source. A theme-aware
  foundational component without a Flex catalog entry uses a sole validator-backed `local-foundation` source.
- Read the component `SPEC.md`, `spec/source.json`, and all referenced companions before changing its contract.
- Use `src/components/button` and `src/primitives/icon` as the canonical implementations, and keep public props and
  slots small, typed, and contract-driven.
- Export higher-order components explicitly from `src/index.ts` and primitives from `src/primitives/index.ts`; never use
  wildcard exports (R-REPO-001).
- Colocate runtime tests, type tests, and stories, include every test-bearing story in `tsconfig.stories.json`, and keep
  Node-only story helpers in `*.wdio.ts` files imported dynamically inside callbacks.
- Do not copy web-only APIs, CSS behavior, or DOM assumptions into React Native, and do not copy or mechanically
  transform private source bodies into this public package (R-REPO-004).
- Track open work only in [remaining work](references/remaining-work.md) (R-PKGDOC-009).

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` in this package, iterating with `yarn test <component>`,
add a changeset, and finish with `yarn clean-lage-cache` followed by `yarn lage buildci`. See
[contributing](references/contributing.md#validation).
