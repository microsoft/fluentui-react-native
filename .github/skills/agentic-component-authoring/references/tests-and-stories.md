# Tests and stories

Use this reference for runtime coverage, type coverage, visual snapshots, Storybook CSF, and validation. Canonical examples
are [`button.test.tsx`](../../../../packages/agentic/components/src/components/button/button.test.tsx),
[`button.stories.tsx`](../../../../packages/agentic/components/src/components/button/button.stories.tsx), and
[`icon.stories.tsx`](../../../../packages/agentic/components/src/primitives/icon/icon.stories.tsx).

## Runtime tests

Use `render` from the package-private `src/common/renderWithTheme` helper for
component scenes. It places a `ThemedRoot` outside the scene and any supplied
wrapper, preserving the same root settings through rerenders. Import events,
queries, and types from `@testing-library/react-native`; do not import
`react-test-renderer` directly. Tests can dispatch root modality events through
the helper's `test-scene-root` test ID.

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

All catalog tests use WDIO; custom `desktopDriver` plans remain only in runner
compatibility fixtures. Keep names static and callbacks self-contained. Node helpers may be
dynamically imported inside each callback, but callbacks cannot capture
story-module bindings. The shared Babel config strips all test functions
before native dependency collection. Named cases get independent previews,
sessions, workers, deadlines, results, and failure evidence.

The single-function `wdio` form remains supported. Run with
`yarn storybook test --<platform>` and optionally `--test <name-glob>`.
`--list` discovers names without executing code. The `stories-and-tests`
smoke mode runs these functions alongside remaining legacy plans, grouped by
story. See the [executable test contract](../../../../packages/agentic/storybook-desktop/README.md#executable-tests-inside-stories).

The components package's `test:stories` project checks every test-bearing story
without emitting it into the component library. Add new test-bearing files to
`tsconfig.stories.json`; the representative runner contract checks this coverage.
Shared Node-only helpers use `*.wdio.ts` and are dynamically imported by source
extension inside callbacks. They are checked by the story project and excluded
from production emit.

Native-rendered story helpers use `*.story-helpers.tsx` and are also excluded
from library emit while checked by the story project. Use `StoryStatus` for
counter/modality probes: its named accessible View is observable on macOS
Fabric, where a plain paragraph's `testID` is not exposed as an AX element.

Focus cases use native `focused`, `checked`, and `selected` properties together
with activation and event-order probes. Cover stale key-up, repeats, disabled
stops, same-target modality, nested themes, focus requests, and selection-before-
focus. Use `try/finally` to release held WebDriver actions. Never replace native
state checks with rendered text alone or a default value for an unsupported
property. Desktop support does not imply identical pointer focus or activation
timing.

### Desktop focus test scope

Keep shared requirements executable on Windows Fabric, Office Win32, and macOS.
`requireDesktopFocus` checks native capabilities, not an operating-system
allowlist. A missing capability skips the case with a reason; a platform
difference usually changes one assertion rather than skipping the entire case.

| Behavior                                                                                                       | Scope and expected result                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exactly-once activation, release cleanup, disabled eligibility, focus requests, self-focus, and scene modality | All three desktop endpoints. Assert native focus/state and action counts; include overlapping keys and blur/disable during a press.                                                                                                          |
| Focus automatically follows an ordinary pointer press                                                          | Windows/Win32 only. Use `expectWindowsPointerFocus`; it deliberately does nothing on macOS, without skipping the case's other assertions. Do not use it for a shared keyboard/programmatic focus requirement.                                |
| Return/Space activation phase                                                                                  | macOS activates on keydown; Windows/Win32 activate on the paired keyup. Assert the held-key count per platform, then the shared final count. A later blur cannot undo a macOS action that already occurred.                                  |
| Native Tab/Shift+Tab entry, disabled skipping, and TabList navigation                                          | Shared, with macOS Keyboard navigation enabled for the all-controls Tab lane. Use `focusByTab` from the story's editable entry; do not simulate click-focus on the control under test.                                                       |
| Modified navigation                                                                                            | Shared for chords delivered to the app. Shift+Arrow is portable; macOS Control+Arrow can be a system shortcut and must not be required to reach a TabList handler. Preserve Command/Option text editing separately.                          |
| FocusZone navigation                                                                                           | Shared native ownership, platform-specific destinations: Windows/Win32 default to linear traversal unless `use2DNavigation` is enabled; AppKit is geometric. Its macOS scene explicitly requests focus on click, unlike ordinary Pressables. |

Prefer a narrowly named platform assertion helper when several stories need the
same exception. Do not introduce a generic conditional-expectation layer merely
to hide branching, or make an entire test pass without executing any assertion.
Keep injected `platform` checks inside the extracted callback or its dynamically
imported `*.wdio.ts` helpers; never infer the target from the Node host OS.

On macOS, record the Keyboard navigation setting as part of the run. With that
setting off, AppKit can legitimately skip buttons and return to an editable
field. Interactive development and CI Macs should have this preference enabled;
the shared CI setup enables and verifies it before app startup. Keep input
authority and locked/noninteractive desktop handling separate from this
preference. Do not silently change machine preferences inside a test or
reinterpret the setting as a missing driver feature. Follow the machine owner's
preference, restore changes authorized as temporary, and test the disabled-
setting policy separately when claiming coverage of both modes.

Modality text and focus counters do not establish ring visibility. Use separate
resolved-style coverage without incidental scene rerenders, plus native visual
evidence for renderer appearance. Likewise, a checked/selected state read after
a physical click does not exercise UIA/AX action dispatch.

Report passed, failed, and skipped counts together. A zero-exit smoke traversal
with platform-skipped focus cases is not cross-platform focus qualification.

The pinned RNmacOS 0.81.9 Fabric View does not project
`accessibilityState.disabled`/`selected` to AXEnabled/AXSelected. Those native
announcement assertions are isolated in explicitly skipped cases; shared
focus, activation, and selection-callback cases still run. Do not substitute
rendered state for an AX result or describe these skips as intended macOS
semantics. Track the native projection gap and revisit the cases when the
renderer is upgraded. An already-disabled AppKit responder may also remain
first responder until focus is moved; rejected-request tests start from a
separate native focus owner rather than assuming disabling itself moved focus.

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

Run repository/package tests before the owned native Storybook lifecycle, not
concurrently with it: some CLI fixtures still write into the app's generated
state directory. A lease/nonce mismatch is an infrastructure failure, not a
focus-test result; never bypass ownership or authenticated readiness to proceed.

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
