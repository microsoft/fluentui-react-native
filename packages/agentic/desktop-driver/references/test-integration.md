---
id: desktop-driver.test-integration
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver
---

# Test integration

Desktop Driver supports three complementary test levels:

1. normal WebdriverIO automation against a registered native target;
2. serializable plans colocated with component stories;
3. deterministic package and protocol tests against the fake host.

The same W3C service and `DesktopHost` contract underpin all three.

## WebdriverIO tests

Use `@fluentui-react-native/desktop-test` for an application-owned
configuration and normal WDIO/Jasmine suites. It preserves TypeScript hooks,
Jasmine matchers, grouped spec arrays, retries, and native browser ownership.
`installDesktopWebdriverCommands(browser, url)` binds an existing WDIO-managed
browser, including native `isDisplayed`, `isFocused`, element screenshots, and delayed-render waits.
No Appium capability spoofing or second session is required.

With these commands installed, `element.takeScreenshot()` returns a base64 PNG
cropped to the element, just like `browser.takeElementScreenshot(element.elementId)`.
`element.saveScreenshot(path)` saves that element image, while
`browser.takeScreenshot()` still captures the current window. Unsupported
element capture fails explicitly; it never falls back to a window screenshot.

Use `connectDesktopWebdriver` when a test owns service connection and session
lifecycle:

```ts
import { connectDesktopWebdriver } from '@fluentui-react-native/desktop-driver/wdio';

const desktop = await connectDesktopWebdriver({
  clickMode: 'auto',
  inputMode: 'accessible',
  launchMode: 'attach',
  platformName: 'macos',
  targetId: 'component-storybook-macos',
  url: process.env.DESKTOP_DRIVER_URL!,
});

try {
  const input = await desktop.browser.$('~search-input');
  await input.setValue('Fluent');
  await expect(input).toHaveValue('Fluent');
} finally {
  await desktop.delete();
}
```

`inputMode` defaults to `compatibility`. Use `accessible` to refuse keyboard,
pointer, and wheel input before dispatch, or `physical` to require physical
clears and clicks while still permitting accessibility actions. The selected
mode is fixed in the session's returned `furn:inputMode` capability. Read
`desktop.input()` (or `desktop.browser.desktopInput()`) for that mode and the
session's delivery counts. A declared test runner compares those receipts with
the case's `requires`; an undeclared mechanism fails the test, while an unused
requirement is reported without failing it.

WDIO's `element.desktopPerformAccessibilityAction(name)` invokes a uniquely
published accessibility action without pointer or keyboard input. Declare
`perform-accessibility-action` on the case that uses it.

`setValue(value, options)` is native here: it checks that the session's input
mode permits the keyboard, then clears with `clearValue` and types with
`addValue(value, options)`. It never reaches WDIO's own `setValue`, whose
client-side `execute` probes a native session rejects after the field was
cleared. It reads the mode from the session's current `furn:inputMode`, so an
attached session that omitted the capability still gets the mode the service
reports, and a `setValue` in an accessible session is rejected before anything is
cleared. After `reloadSession()` the bound commands follow the new session id.
`clear` remains available in an accessible session as a semantic clear. WDIO
options pass through unchanged, so `setValue(secret, { mask: true })` keeps the
value out of WDIO's logs.

Use standard WebdriverIO APIs only where the
[implemented protocol](protocol.md) supports them. Browser navigation, cookies,
frames, JavaScript execution, prompts, printing, CSS values, and shadow roots
are intentionally unavailable.

For Storybook targets, the connection registers:

- `desktopListStories()`;
- `desktopOpenStory(storyId, runId?)`;
- `desktopResetStory(storyId, runId?)`;
- `desktopRunStoryTests(options?)`.

`desktopExpect(expectation)` is available without Storybook.

The runner resets the preview for each test, filters and shards a stable
`storyId/testId` ordering, checks required capabilities, and classifies
assertion, timeout, cancellation, skip, and infrastructure outcomes.
Selectors used to read a value or perform an action must resolve to exactly one
element. `count` and `exists` expectations intentionally allow multiple matches;
narrow other selectors rather than relying on the first match.

Pass `onTestResult(result)` to `runStoryTests` or `runDesktopStoryTests` to
receive each settled test result before the next test starts. This supports
immediate pipeline diagnostics without parsing the final artifact report.
The callback receives a read-only result and is awaited; serializable authored plans and
result formats remain unchanged.

An external supervisor can share an existing session with an isolated Node
worker using `attachDesktopWebdriver({ url, sessionId, capabilities })`.
This registers the same custom commands without creating a second session.
On a protected service, include the supervisor-provided `grant` in that
attachment and in `connectDesktopWebdriver`. For an existing WDIO-managed
transport, configure `desktopWebdriverGrantOptions(grant)` before attaching
and pass `{ grant }` as the third argument to
`installDesktopWebdriverCommands`. Never put the grant in capabilities or
worker command-line arguments. Use private IPC or a supervisor-controlled
environment such as `FURN_DESKTOP_DRIVER_GRANT_TOKEN`; the `TOKEN` suffix
participates in the desktop-test reporter's secret redaction. The helper does
not automatically read process environment variables.
The supervisor retains ownership and must call `delete()` after the worker
exits, including on assertion failures, timeouts, or crashes. WebdriverIO's
`attach()` does not apply the defaults `remote()` uses, so the attached browser
sets `waitforInterval` (100 ms) and `waitforTimeout` (5 s) explicitly; without
an interval, `waitUntil` and `waitFor*` stop after their first unsatisfied poll.

Storybook's preferred top-level `wdio` export is an array of `desktopIt` cases,
which declare the input and platforms they need. Its older functions and named
function collections use the same pattern with Node's built-in test runner.
Each function receives the target `platform` (`macos`, `windows`, or `win32`),
and each named case gets an independent worker/session. Native feature flags are
typed on the WebdriverIO browser's `furn:features` capability. Button now uses
this authoring pattern instead of serializable plans. Extraction, native-bundle
stripping, runner configuration, and source freshness belong to
`@fluentui-react-native/storybook-desktop`, not this Storybook-independent
package. Static plans below are unchanged.

The descriptor that `desktopIt` accepts (`requires`, `input`, `platforms`,
`scope`, and declared gaps) is defined and decided in `./authoring`, so Storybook
and `desktop-test` share one implementation. A runner that executes one input
lane requests and verifies the matching `furn:inputMode`; the policy pins
`furn:clickMode`, so `element.click()` is an accessibility click in the
accessible lane and a physical click in the physical lane.
`missingDesktopRequirements` judges a case's `requires` against the session's
`furn:features`, and judges a `click` requirement by the pinned mode.

## Author portable story plans

Plans are static JSON under `parameters.desktopDriver`. Import only their types
from `./authoring`:

```tsx
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'activate',
          title: 'Activates from the desktop',
          requires: ['physical-click'],
          steps: [
            { action: 'wait', target: { testId: 'save-button' } },
            {
              expect: {
                state: 'role',
                target: { testId: 'save-button' },
                value: 'button',
              },
            },
            { action: 'click', target: { testId: 'save-button' } },
            {
              expect: {
                state: 'focused',
                target: { testId: 'save-button' },
                value: true,
              },
            },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};
```

Storybook extraction accepts JSON literals wrapped by TypeScript `satisfies` or
`as`. Do not hide a plan behind variables, functions, spreads, computed
properties, or runtime platform branches. Dynamic or invalid plans fail
generation with source context.

Portable selectors:

- `{ testId }` for deterministic interaction;
- `{ role, name? }` for semantic lookup;
- `{ accessibleName }`;
- `{ text }`.

Actions:

- click, double-click, clear, type, key sequences, and raw W3C actions;
- scroll and wait;
- Storybook argument updates;
- screenshot, source, and notes.

Assertions:

- existence and count;
- role, accessible name, text, and value;
- displayed, enabled, focused, selected, checked/mixed, and expanded state.

Requirements can declare `accessibility-click`, `element-screenshot`, `focus`,
`keyboard`, `physical-click`, `screenshot`, or `wheel`. A missing requirement
produces an explicit skip. Platform differences belong in `platforms` and
`requires`, not imperative branches.

Authored cases (`desktopIt`) can declare `unsupported` or `quarantine`. A
quarantine names an `issue`, a `reason`, and an `expires` date written as a real
calendar date, `YYYY-MM-DD`; `2026-13-01` and `2026-02-30` are rejected rather
than read as a date that never arrives. It stops applying at 00:00:00 UTC on its
`expires` date, so the date is the first day without the quarantine, and a run on
or after it fails before any case executes. Its optional `platforms` and `input`
must overlap the platforms and input the case runs on, and a group's platforms
and scope must overlap its children's; a gap that could never apply is rejected.
Artifact names in a plan (`screenshot`, `source`) are unique per test and may not
use the reserved `failure` or `failure-*` names, and `wait` timeouts are integers
of 0 to 120000 milliseconds. A plan is rejected when a `keys` step has an empty
list, or a test's `platforms` or `requires` is empty or repeats an entry.

## Run plans

```sh
desktop-driver stories list \
  --url http://127.0.0.1:39859 \
  --target component-storybook-windows

desktop-driver stories explain components-button--default \
  --url http://127.0.0.1:39859 \
  --target component-storybook-windows

desktop-driver stories run \
  --url http://127.0.0.1:39859 \
  --target component-storybook-windows \
  --tag desktop-e2e \
  --shard-index 0 \
  --shard-count 2 \
  --artifacts artifacts/windows/desktop-driver
```

Selectors can filter by story glob, test glob, tag, and deterministic shard.
A glob matches `*` as any run of characters and every other character
literally, in linear time. Shards are cut from the selection ordered by Unicode
code point of `<story>/<test>`, so every machine and locale builds the same
shards. The CLI emits JSON and exits nonzero when the run status is not
`passed`.

Run status follows the same rule as the neutral harness's lane verdict:

- any test that is not `passed` or `skipped` makes the run `failed`;
- a run that skipped everything is `incomplete`;
- a run whose session enforces an input lane (`furn:inputMode` is `accessible`
  or `physical`) is `incomplete` when any test was skipped, because the lane
  promised to run its whole selection;
- otherwise a run with passes and skips is `passed`, and the skips stay visible
  on their tests.

The neutral harness's explicitly optional cohorts may finish skipped without
claiming that the underlying capabilities were qualified.

A test requires a capability only when the session can deliver it. The runner
skips a test whose requirement the host does not advertise, and also one whose
requirement the session's input mode masks: `keyboard`, `physical-click`, and
`wheel` in an `accessible` session.

A transport failure (`DesktopDriverClientError`), `invalid session id`,
`session not created`, and `unknown error` make a test `infrastructure-error`, and
`wait` stops on them instead of retrying until its timeout. Element lookups,
assertions, and malformed input are `failed`, and an expired `wait` is
`timed-out`. A `wait` timeout is an integer of 0 to 120000 milliseconds.

## Evidence

Passing `artifactsRoot` writes atomically beneath that root:

```text
artifactsRoot/
  host.json
  run.json
  tests/
    <story>/
      <test>-<hash>/
        <named screenshots and source>
        failure/
          failure-window-events.json
          failure.png
          failure-source.xml
          failure-tree.json
          failure-window-<n>.png
          failure-window-<n>-source.xml
```

`<story>` and `<test>` are sanitized and cut to 64 characters, and `<hash>` is a
12-character hash of the exact story and test ids. Ids that sanitize to the same
text, or that differ only in where a hyphen falls, still get separate
directories.

`captureDesktopFailureEvidence` from `./artifacts` produces the `failure-*`
files for both story plans and Storybook `wdio` callbacks, in the test's
`failure/` directory. A plan cannot overwrite them: the names `failure` and
`failure-*` are reserved for authored screenshots and source, and a name that
sanitizes to the same file as another in one test (case-insensitively) is
rejected, at validation and again at run time. It reads the window
event log first, when the `windowEvents` feature is available, because tree
traversal is slow enough for transient popups and sheets to change state. It
then captures the current window's screenshot (when `screenshot` is available),
source, and tree, followed by the screenshot and source of up to four other open
windows, and restores the current window. Windows that close during capture are
recorded as evidence errors.

Names are sanitized and confined. The manager resolves the deepest existing
ancestor of every path and refuses one whose real location leaves the root,
including through a symbolic link, before it creates a directory. Failure
evidence is best effort and never replaces the original test error. Trees and
screenshots may contain sensitive application information; apply the retention
and access policy described in [Security](security.md).

## Fake-host contract tests

Use `./testing` for deterministic tests that do not need a desktop:

```ts
import { createDesktopDriverTestHarness } from '@fluentui-react-native/desktop-driver/testing';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

const harness = await createDesktopDriverTestHarness({
  endpoint: 'windows',
});
const client = createDesktopDriverClient({ url: harness.server.url });

try {
  const session = await client.newSession({
    alwaysMatch: {
      browserName: 'furn-native-desktop',
      platformName: 'windows',
      'furn:target': harness.target.id,
    },
  });
  await session.delete();
} finally {
  await harness.close();
}
```

`createDesktopDriverStoryHarness` adds a fake Storybook orchestrator to the
default window. The orchestrator selects stories and records argument updates, but
it adds no elements: a test supplies the elements it asserts on through the
host's `windows` option. Only `desktop-driver serve --manifest` builds
manifest-derived windows. The fake provider is appropriate for protocol,
queueing, cancellation, runner, CLI, and consumer contract tests. It is not
evidence that native accessibility, input, window, or capture behavior works.

The typed client throws `DesktopDriverClientError` (from `./client`) for a
failure that is not a WebDriver error the service reported: `reason: 'transport'`
when the service could not be reached, and `reason: 'invalid-response'` (with the
HTTP `status`) for a body that is not JSON or lacks a WebDriver `value`. Neither
message holds a response body or a request value. Every session, element, and
action method accepts an optional `{ signal }` options argument; an aborted
request rejects with the abort, not a transport error. The story runner treats
both client error reasons as infrastructure failures.

The fake host resolves selectors the way the native helpers do, so a test that
passes against it selects the same elements on a desktop: `-furn:text` compares
exactly against an element's text, value, or accessible name, `tag name` applies
the helpers' role aliases (`edit` is `textbox`, `hyperlink` is `link`), and an
empty `accessibility id` or partial link text matches nothing. It reports
`checked`, `expanded`, and `selected` as unsupported unless the element declares
them, and it enforces the input masks in `features` (`keyboard`, `physicalClick`,
`wheel`) on `sendKeys` and `performActions` as the native host enforces a
target's disabled input.

## Package tests

From this package:

```sh
yarn test
```

The default suite covers raw W3C routes, typed clients, WebdriverIO custom
commands, authored plans, fake Storybook orchestration, bounded agents,
artifacts, target concurrency, timeouts, shutdown races, framing, helper
verification, and CLI adaptation.

Run the opt-in native contract on the matching target OS:

```sh
FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand
```

PowerShell:

```powershell
$env:FURN_NATIVE_DRIVER_TEST = '1'
yarn test --runInBand
```

The native contract builds into a temporary or configured external cache,
verifies the artifact and long-lived handshake, runs the helper self-test,
checks cache reuse and resolution, and exercises malformed-frame recovery.
On Windows it also builds the test-only plain Win32 fixture and drives the
helper against it: events, owned popups, hung and stuck providers, large trees,
and retention. `yarn test --runInBand win32Fixture` runs only that suite.
Stable-signed macOS coverage also requires
`FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY`.

Real-app behavior belongs in a consuming application's integration or smoke
suite. This repository uses the Storybook `stories-and-tests` lifecycle; see
[CI integration](ci-integration.md).
