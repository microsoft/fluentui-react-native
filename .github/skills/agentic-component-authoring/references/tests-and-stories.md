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

- typed `Meta` with `component` and a title matching the component location:
  `Components/<Name>` for higher-order components, `Primitives/<Name>` for agentic primitives, or `Native/<Name>` for
  standalone native component packages
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

Prefer executable WebdriverIO tests under `wdio`, typed with
`WdioStory<StoryObj<typeof Component>>` from
`@fluentui-react-native/storybook-desktop/testing` using `import type`.
The story is the suite (`describe`), and named functions are its cases (`it`):

```tsx
export const Default: Story = {
  wdio: {
    'is enabled': async ({ browser, expect }) => {
      await expect(await browser.$('~story-button')).toBeEnabled();
    },
  },
};
```

Each callback receives `browser`, `expect`, `platform`, `desktop`, `signal`,
and `skip`. The typed target `platform` is `macos`, `windows`, or `win32`;
Win32 is distinct from its WebDriver `platformName` of `windows`. Branch
inside callbacks for genuine platform differences and use explicit skip
reasons for unsupported `browser.capabilities['furn:features']`.

Button is the proof of concept and no longer uses custom `desktopDriver`
plans. Keep names static and callbacks self-contained. Node helpers may be
dynamically imported inside each callback, but callbacks cannot capture
story-module bindings. The shared Babel config strips all test functions
before native dependency collection. Named cases get independent previews,
sessions, workers, deadlines, results, and failure evidence.

The single-function `wdio` form remains supported. Run with
`yarn storybook test --<platform>` and optionally `--test <name-glob>`.
`--list` discovers names without executing code. The `stories-and-tests`
smoke mode runs these functions alongside remaining legacy plans, grouped by
story. See the [executable test contract](../../../../packages/agentic/storybook-desktop/README.md#executable-tests-inside-stories).

Legacy Checkbox and Input tests still use static JSON
`parameters.desktopDriver` plans typed with `DesktopStoryTests` from
`@fluentui-react-native/desktop-driver/authoring`. Keep those plans static and
use declarative `platforms` and `requires` until they are migrated; do not add
functions or dynamic values to the old format.

The components package's `test:stories` project checks the Button and LayoutStableText executable stories without
emitting them into the component library. Add newly typed executable story modules to that project's include list.

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
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --macos
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --windows
```

Run the smallest affected package test while iterating. Run the full package sequence before completion. Run the root
`yarn build` when public types, manifests, or project references change.

A successful bundle proves story discovery and compilation only. For visual changes, inspect the running target-platform
story across hover, pressed, disabled, optional-slot, and constrained-content scenarios.

Alignment regressions must distinguish the outer frame from the inner text. LayoutStableText's Overview includes an
executable desktop check that the smaller visible Text has a smaller measured height than its reserve and that their
vertical centers agree within one layout pixel. Checking only their centers would let the old stretched-Text bug pass.
Its measurement fixture exposes an explicit group around the primitive and an accessible visible Text rather than
querying the primitive's intentionally inaccessible layout wrapper, which may not exist in a platform's automation tree.
Pair geometry checks with native screenshots for glyph ink and caret placement; native element bounds alone do not
prove optical alignment. Never record an unavailable native check as passed.

Adding a new story file changes Metro's `require.context` catalog and may require restarting Metro and the native app
before the running Storybook index includes it.
