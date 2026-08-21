# Tests and stories

Use this reference for runtime coverage, type coverage, visual snapshots, Storybook CSF, and validation. Canonical examples
are [`button.test.tsx`](../../../../packages/agentic/components/src/components/button/button.test.tsx),
[`button.stories.tsx`](../../../../packages/agentic/components/src/components/button/button.stories.tsx), and
[`icon.stories.tsx`](../../../../packages/agentic/components/src/primitives/icon/icon.stories.tsx).

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

Declare module-scoped styles and other values referenced by metadata before the `Meta` object. Storybook evaluates
metadata while importing the module, so referencing a later `const` drops the complete story module with an
initialization error.

Keep on-device controls limited to scalar, serializable props. For required React elements or style objects, supply the
fixed demonstration values inside the story render function and expose only meaningful finite or numeric args; object
controls for React elements are noisy and cannot safely edit the contract.

Story controls follow the axis's ownership, described in
[State and accessibility](./state-and-accessibility.md#decide-who-owns-a-stateful-axis).

For a self-driving control such as Checkbox, Switch, or Accordion, do not put the controlled prop in `args`. A pinned
`checked`, `expanded`, or `status` arg forces every instance into externally driven mode, so pressing the component does
nothing and the story looks broken. Expose `default<State>` as the on-device control and use it in `args`, including for
variant-scan stories, so each instance starts in the demonstrated state and still responds to presses.

For externally driven selection such as Button, Tab, Radio, Card, or the item components, a fixed `selected` arg is
correct: the component never changes it. Give the interactive demonstration in one story that owns the value with
`React.useState` and updates it from `onPress`.

Do not expose an axis that changes component identity as a control. Button's `selected` decides whether it is a toggle
button at all, and Card's decides whether it is selectable, so a control that flips between `undefined` and `false`
resizes or re-roles the component instead of demonstrating a value.

Each story module should provide:

- typed `Meta` with `component` and `Components/<Name>` or `Primitives/<Name>` title
- useful common args
- controls for finite or numeric public props
- a short component description
- an args-driven `Default`
- a grouped `Overview` when the contract has several axes
- focused named stories that compare all values of one axis in one canvas
- an interactive story for each stateful axis: `default<State>` for a self-driving control, or a story owning the value
  with `React.useState` and `onPress` for externally driven selection
- `parameters.docs.description.story` for focused scenarios

Stories included in native agent validation also need a stable root `testID`.
Use selectors that describe the component or scenario rather than visible text,
layout order, or native class names. Keep the initial args deterministic and
add identifiers only to the small smoke set that agents and CI actively
validate.

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
yarn workspace @fluentui-react-native/agentic-components-storybook bundle:windows
```

Run the smallest affected package test while iterating. Run the full package sequence before completion. Run the root
`yarn build` when public types, manifests, or project references change.

A successful bundle proves story discovery and compilation only. For visual changes, inspect the running target-platform
story across hover, pressed, disabled, optional-slot, and constrained-content scenarios.

Adding a new story file changes Metro's `require.context` catalog and may require restarting Metro and the native app
before the running Storybook index includes it.
