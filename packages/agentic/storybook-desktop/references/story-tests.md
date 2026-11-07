---
id: storybook-desktop.story-tests
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Author story tests

Story tests are statically extracted CSF `wdio` callbacks. Declare each case
with `desktopIt`: its descriptor says which input the case needs and where it
runs, so a run can select it for the input lane, platform, and scope it
exercises. Callbacks must not close over module-local values. Import Node-only
helpers through literal dynamic `import()` inside the callback. Keep test code
out of the native bundle.

```tsx
import type { StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

type Story = WdioStory<StoryObj<typeof Button>>;

export const Default: Story = {
  args: { testID: 'save-button' },
  wdio: [
    desktopIt('is enabled', async ({ browser, expect }) => {
      await expect(await browser.$('~save-button')).toBeEnabled();
    }),
    desktopIt('activates', { requires: ['click'] }, async ({ browser, expect }) => {
      await (await browser.$('~save-button')).click();
      await expect(await browser.$('~saved-message')).toBeDisplayed();
    }),
    desktopIt('activates with Enter', { requires: ['keyboard'], platforms: ['!macos'] }, async ({ browser, expect }) => {
      await browser.keys('\uE007');
      await expect(await browser.$('~saved-message')).toBeDisplayed();
    }),
  ],
};
```

`desktopIt(name, run)` declares a case with no restrictions, so it runs in every
lane on every platform. `desktopIt(name, options, run)` adds a descriptor. The
older object of named callbacks and the single `wdio: async (context) => ...`
form remain supported for compatibility, but a legacy callback has no
descriptor, so an input lane rejects it, listing the story IDs to migrate,
instead of treating it as `both`.

## Declare how a case runs

The descriptor is a strict static JSON literal; an unknown field, a computed
value, or an invalid combination fails extraction with source context.

| Field         | Meaning                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `requires`    | Host capabilities the case needs. They also derive the input lane (below).                           |
| `input`       | `accessible`, `physical`, or `both`. Defaults to what `requires` derives, else `both`.               |
| `platforms`   | Endpoints the case runs on: `macos`, `windows`, `win32`. Omitted means every endpoint.               |
| `scope`       | Custom scope values, such as `{ 'rn.renderer': ['fabric'] }`. Omitted means every value.             |
| `unsupported` | A known gap: `{ platforms, reason, issue? }`. The case is reported unsupported instead of executing. |
| `quarantine`  | A temporary gap: `{ issue, reason, expires, platforms?, input? }`, with `expires` as `YYYY-MM-DD`.   |

### Input and requirements

Most cases need no `input`: their `requires` already says what they send.

| Requirement                                                                             | Derived input | Meaning                                                                |
| --------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| `keyboard`, `physical-click`, `wheel`                                                   | `physical`    | Operating-system input that moves the real pointer or sends key events |
| `accessibility-click`                                                                   | `accessible`  | The element's accessibility action                                     |
| `click`                                                                                 | `both`        | `element.click()`, which follows the lane (below)                      |
| `accessibility-actions`, `element-screenshot`, `focus`, `screenshot`, `set-window-rect` | `both`        | The host must offer the feature                                        |

A case with no requirements is `both` and runs in every lane. Requiring both a
physical and an accessibility transport is an error; split the case. An explicit
`input` may narrow a `both` case but cannot widen a transport requirement.

`requires: ['click']` makes `element.click()` follow the lane: an accessibility
click in the accessible lane and a physical click in the physical lane. Without
a lane, an accessible case still uses accessibility clicks and every other case
follows the configured `--click-mode`, so a physical case on a host that masks
physical click is reported unsupported instead of failing its session. Before
a case runs, the host's reported features must meet each requirement. A case it
cannot meet is reported unsupported, never passed, and makes a lane run
incomplete unless the case declares the gap.

### Platforms and scope

`platforms` is an allowlist: `['win32']` runs only on Win32. Negate with
`['!win32']` to run everywhere else; a list holds either allowed or negated
endpoints, never both. Platform selection uses the target endpoint, so Win32
remains distinct from Windows.

`scope` narrows by values the target holds. Values within a key are alternatives
and keys combine. `rn.renderer` (`fabric` or `paper`) is built in and the
`rn.*` keys are reserved for the framework. A consumer declares its own keys in
the desktop config's `testScopes`, such as `{ flavor: ['stable', 'preview'] }`,
and each target sets its value in `testScope`. A key or value outside the declared
domains, or a key the target does not supply, is a configuration error rather
than a silent exclusion, so a typo cannot drop a case.

A case that does not match the target is excluded, not skipped: it is not a test
and is counted only in the run's selection totals.

### Known gaps

Declare a gap instead of calling `skip` at run time. `unsupported` lists the
endpoints where the behavior does not work yet, with a reason and ideally an
issue. `quarantine` suspends a flaky case until its `expires` date, optionally for
one endpoint or lane. An expired quarantine fails the run before anything
executes. Declared gaps are reported as unsupported with their reason and do not
make a lane run incomplete; a run-time `skip(reason)` does, so reserve it for
conditions no descriptor can state.

```tsx
desktopIt(
  'closes on Tab and continues past the anchor',
  {
    requires: ['physical-click', 'keyboard', 'focus'],
    unsupported: { platforms: ['win32'], reason: 'Win32 hosts keep the cycle behavior.', issue: '#4377' },
  },
  async ({ browser, expect }) => {
    // ...
  },
);
```

The callback receives the real WebdriverIO `browser`, `expect-webdriverio`
`expect`, typed `desktop` assertions/story commands, target `platform` (`macos`,
`windows`, or `win32`), cooperative `signal`, and explicit `skip(reason)`.
`platform` is the target endpoint, not `process.platform`; Win32 remains
distinct even though its WebDriver `platformName` is `windows`.

Each named callback executes in an isolated worker and WebDriver session with
a fresh preview. Names are discovered statically; collections must be
non-empty with unique literal names and inline function values. Spreads,
computed names, methods, nested suites, dynamic test registration, and
closures over imported helpers, args, or render state fail extraction with
source context. The older single `wdio: async (context) => ...` form remains
supported as the `default` test.
Use `WdioStory<StoryObj<...>>` and import `WdioStory` with `import type`.
Literal dynamic imports of Node-compatible helpers inside the callback resolve
from the original story file. The shared Babel config removes callbacks before
Metro resolves their dependencies.

Use native selectors and WebDriver operations; the app has no DOM or JavaScript
execution surface. Read native properties through `getProperty()` rather than
ordinary object matchers. Declare the capabilities a case needs in `requires`
rather than feature-checking inside the callback, and never turn unsupported
state into false. For example, `getProperty('accessibilityActions')` lists the
action names an element publishes (such as `Toggle` or `Select`) when
`browser.capabilities['furn:features']?.accessibilityActions` is true.

Tests in one story run in declaration order, each in its own Node process and
native session. The preview is navigated/remounted before each case. A
per-case timeout applies; assertion failure does not prevent independent
cases from running, while connection or cleanup failures stop execution.
No matching case is an error. Restart the driver and reload the app after
editing callbacks because their digest participates in manifest freshness.
`test --list` discovers IDs without executing callbacks; `--test <glob>`
filters names. `test` operates against an already running app/driver; smoke
owns the complete app lifecycle.

## Run an input lane

A lane runs only the cases that apply to one way of driving the app. The
`accessible` lane runs `accessible` and `both` cases through accessibility
actions, so it never moves the pointer or sends key events and is safe on a
machine someone is using. The `physical` lane runs `physical` and `both` cases
with real pointer, keyboard, and wheel input, so it needs a machine nobody is
using. Without a lane, every case runs as before (compatibility mode) and click
behavior follows `--click-mode`.

Use `storybook test --input accessible|physical` or
`storybook smoke --mode stories-and-tests --input accessible|physical` to run
one lane. `DESKTOP_INPUT` supplies the lane when no flag is given.
`storybook driver --input ...` records the default lane for a later
`storybook test` against that driver. `--input` cannot be combined with a
non-default `--click-mode`. `test --list` shows, for each story, the cases the
lane runs with their resolved input, requirements, platforms, and scope, and the
cases it excludes with the reason; add `--input` to preview a lane.

Each case session confirms its `furn:inputMode` before the callback runs. The
accessible mode refuses keyboard, pointer, and wheel input before dispatch; the
physical mode pins clicks to the pointer while allowing accessibility actions.
`smoke` and `driver --input accessible` also mask the host as defense in depth,
but `test --input accessible` can safely attach to an unmasked driver because
the session policy is enforced independently. Before teardown, the runner reads
the session's delivery receipts and fails a case if it delivered a mechanism
not covered by its `requires`; unused requirements are reported, not failed.

In an accessible session, `browser.$(...).setValue(...)` is rejected before
WDIO's client-side clear step, which could otherwise change the field before
keyboard input is refused. `clearValue()` remains available and uses a semantic
clear.

A lane that executes no case is not a passing run, and neither is a lane run
that leaves a case unsupported or skipped without a declared gap. Excluded cases
never count against a run: they are not tests.

## Keep physical input out of accessible cases

Extraction checks every `desktopIt` case that can run in the accessible lane
(any case that is not `physical`) and fails with a source-context error when its
callback calls an API that sends physical input without declaring it:

- `browser.keys(...)`, which sends key events (`keyboard`);
- `setValue`, `addValue`, or `clearValue` on any object (`keyboard`);
- `browser.action('key' | 'pointer' | 'wheel')` and `performActions` with `key`,
  `pointer`, or `wheel` sources (`keyboard`, `physical-click`, or `wheel`).

Declare the matching `requires`, or `input: 'physical'` when the case already
declares its input, so it runs only in the physical lane, or remove the call. A
call whose arguments the check cannot read, such as a computed action list,
fails the same way, because it cannot tell what the call sends. The message
names the call and the requirement to declare.

The check reads the callback only. It does not follow helper functions or aliases,
and `setValue`, `addValue`, and `clearValue` are matched by name, so a method you
define with one of those names is flagged too. Input hidden behind a helper is
instead caught at run time by the accessible lane's host mask. Legacy callbacks
are not checked, and the Metro transform does not run the check; extraction
(`storybook manifest`, `test`, `smoke`) does.

Use the component authoring contract for component-specific test assertions.
Legacy `parameters.desktopDriver` static plans remain for compatibility and
are not the preferred story-test authoring API.
