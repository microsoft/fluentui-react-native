# Framework Base agent instructions

This is the instruction root for `@fluentui-react-native/framework-base` and every descendant. The package owns the
shared component patterns, custom JSX runtime, slot types, interaction and focus-target hooks, universal accessibility
helpers, and the merge and memoization utilities used by v1 and agentic components.

## Start here

Read the [user guide](README.md), then select the narrowest topic in the [reference index](references/README.md):

| Task                                                               | Read                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Author, change, or review direct, phased, slot, or legacy patterns | [Component patterns](references/component-patterns.md)                                                                                |
| Add or consume a universal accessibility helper                    | [Accessibility](references/accessibility.md)                                                                                          |
| Change merge or memoization utilities                              | [Immutable merge](references/immutable-merge.md), [memo cache](references/memo-cache.md), or [merge props](references/merge-props.md) |
| Edit source, exports, types, tests, or compatibility               | [Contributing](references/contributing.md)                                                                                            |

Focus-target and interaction abstractions also follow the repository's common focus authoring reference
(`focus.common`) and its platform breakouts.

## Invariants

- Use `directComponent` only for hook-free prop and render transformations, and `phasedComponent` when hooks, context,
  state, tokens, or slots are needed. Create slots in the first phase and return a hook-free render phase.
- Do not add new uses of `legacyDirectComponent` or `stagedComponent`.
- Put `/** @jsxImportSource @fluentui-react-native/framework-base */` on the first line of component files that use
  these patterns, and render ref-bearing callable slots through that runtime.
- Declare slots from component types, such as `Slot<typeof View>`, and prefer inferred calls such as
  `useSlot(View, props)` so native ref types are preserved.
- Keep generic entry points import-safe without a React Native runtime, preserve React 18 compatibility, and add no
  dependency on design, components, or other higher-level packages.
- Keep component roles, state transitions, and handler composition in the owning component; share only demonstrated
  accessibility behavior here.
- Add compile-time type assertions for public type behavior and runtime tests for affected rendering, prop merging,
  children, keys, and refs.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` in this package, add a changeset, and finish with
`yarn clean-lage-cache` followed by `yarn lage buildci`. See [contributing](references/contributing.md#validation).
