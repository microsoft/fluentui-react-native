# Tests and stories

Use this reference for runtime coverage, type coverage, visual snapshots, Storybook CSF, and validation. Canonical examples
are [`button.test.tsx`](../../../../packages/agentic-components/src/components/button/button.test.tsx),
[`button.stories.tsx`](../../../../packages/agentic-components/src/components/button/button.stories.tsx), and
[`icon.stories.tsx`](../../../../packages/agentic-components/src/primitives/icon/icon.stories.tsx).

## Runtime tests

Use `@testing-library/react-native`. Do not import `react-test-renderer` directly.

Prefer public semantics:

- query the root by accessibility role
- use matchers such as `toBeDisabled()`
- assert `accessibilityState`, accessible names, and focusability
- use async `fireEvent` calls for hover, press, focus, and user handlers
- query a stable `testID` only when a platform adapter does not expose the expected accessible inner primitive

Flatten styles only when the resolved visual contract is the behavior under test.

Button coverage demonstrates:

- default props, role, accessibility, and styling
- forwarding user handlers while interaction state updates
- disabled behavior and inaccessible icon slots
- icon-only accessible names and minimum target size
- development warnings
- selected icon replacement and toggle semantics
- hidden ghost text that prevents layout shift
- slot order and user-style precedence
- focus rendering
- every appearance and size
- visible hover and pressed feedback
- constrained text wrapping

Use table-driven tests for complete finite axes. When fixing one state regression, add a focused assertion even if a
snapshot also changes.

## Type tests and primitives

Add committed `*.types.test.ts` coverage for compile-time slot acceptance, mutually exclusive props, and public type
contracts. Keep exploratory type probes outside package source or remove them before validation.

Primitive runtime tests should cover every renderer or source branch and verify forwarding of size, color,
accessibility, and test props.

## Visual snapshots

Keep snapshots focused on resolved output rather than the full renderer tree. Button snapshots map each appearance to:

- flattened root style
- flattened content style
- one requested visual state

Snapshot rest, hover, pressed, focus, disabled, and selected states when those states are part of the visual contract.
Update snapshots through the package's declared script only after reviewing the behavioral diff.

## Story structure

Use the Fluent UI React v9 Button stories for focused API-axis examples and the Fluent headless Button story for a
compact grouped overview:

- `microsoft/fluentui/packages/react-components/react-button/stories/src/Button`
- `microsoft/fluentui/packages/react-components/react-headless-components-preview/stories/src/Button`

Adapt the structure to React Native. Do not copy DOM props, CSS class hooks, or unsupported web behavior.

Colocate `<component>.stories.tsx`; the Storybook source glob discovers it automatically.

Each story module should provide:

- typed `Meta` with `component` and `Components/<Name>` or `Primitives/<Name>` title
- useful common args
- controls for finite or numeric public props
- a short component description
- an args-driven `Default`
- a grouped `Overview` when the contract has several axes
- focused named stories that compare all values of one axis in one canvas
- `parameters.docs.description.story` for focused scenarios

Button uses focused appearance, size, shape, icon, selection, disabled, and constrained-content stories. Icon uses a
source and size overview plus focused font, image, SVG, size, color, and accessibility stories.

Use module-scoped React Native `StyleSheet` objects for story layout, captions, and scenario constraints. Do not restyle a
higher-order component to manufacture a variant. An unstyled primitive may include clearly demonstration-only rendering
so its contract is visible.

Keep stories accessible. Icon-only controls need action-oriented labels. Standalone informative icons need descriptive
labels. Decorative icon slots inside a labeled control should be inaccessible.

## Validation

Use declared workspace scripts:

```sh
yarn workspace @fluentui-react-native/components format
yarn workspace @fluentui-react-native/components lint
yarn workspace @fluentui-react-native/components build
yarn workspace @fluentui-react-native/components test
yarn workspace @fluentui-react-native/agentic-components-storybook bundle:macos
```

Run the smallest affected package test while iterating. Run the full package sequence before completion. Run the root
`yarn build` when public types, manifests, or project references change.

A successful bundle proves story discovery and compilation only. For visual changes, inspect the running target-platform
story across hover, pressed, disabled, optional-slot, and constrained-content scenarios.
