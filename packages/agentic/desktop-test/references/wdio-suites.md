---
id: desktop-test.wdio-suites
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# WDIO suites and page adapters

## Session ownership

WDIO owns the browser session, globals, TypeScript hooks, Jasmine matchers,
grouped specs, and retries. Native commands bind to the existing browser; do
not create a second WebDriver session from suite hooks.

Nested spec arrays remain one worker group. Each spec glob must match; an
unmatched pattern is an error rather than silently reduced coverage. Keep
target definitions in the application config and reference them from suite
workspaces.

## Native page adapter

Use the desktop driver's registered WebdriverIO binding for native
`isDisplayed()` and `isFocused()`. A raw/unbound browser may still dispatch
DOM JavaScript and fail. Use explicit native element geometry/action commands
for other semantics; do not assume browser DOM execution is available.

When a native driver clicks an element center, scroll a control until that
center is inside the native scroller viewport. A partly clipped element may
report displayed while its center remains obscured. Before wheel input, bring
the selected target window to the foreground. Fail explicitly if the endpoint
does not support native wheel input.

WebdriverIO 10 enables `strictSelectors` by default, so `$()` throws a
`StrictSelectorError` when a selector matches more than one element, and native
trees often expose a container and its children under one accessibility id.
Prefer unique ids. A suite that depends on first-match lookup can set
`config.strictSelectors = false` in its hooks module's `beforeSession`.

Component story callback extraction is owned by
`@fluentui-react-native/storybook-desktop`; use this suite guide for ordinary
WDIO suites and app-level E2E adapters.

## Declare input and scope in Jasmine specs

Declare each test with `desktopIt` and group tests with `desktopDescribe` from
`@fluentui-react-native/desktop-test/jasmine`. They take the same descriptor as
Storybook's `desktopIt` (`requires`, `input`, `platforms`, `scope`, `unsupported`,
`quarantine`), and the options argument is optional:

```ts
import { desktopDescribe, desktopIt } from '@fluentui-react-native/desktop-test/jasmine';

desktopDescribe('Button', () => {
  desktopIt('renders', async () => {
    await expect(await $('~button')).toBeDisplayed();
  });
  desktopIt('activates with Enter', { requires: ['keyboard'] }, async () => {
    await browser.keys('\uE007');
  });
  desktopDescribe('Windows behavior', { platforms: ['windows', 'win32'] }, () => {
    desktopIt('takes focus', { requires: ['focus'] }, async () => {
      await expect(await $('~button')).toBeFocused();
    });
  });
});
```

A group's options apply to everything inside it. Requirements add up, `platforms`
and `scope` intersect, and a nested declaration can only narrow its group, so a
combination that could never run is an error rather than a silent exclusion. A
group cannot declare `unsupported` or `quarantine`; declare the gap on the test.
A test's `input` comes from its `requires` unless declared; see "Declare how a case runs" in
`@fluentui-react-native/storybook-desktop/references/story-tests.md`.
A test that needs no input stays `both`.

Run through `desktop-test test --suite <name>`, the harness hands each WDIO worker
its endpoint, scope values, and optional lane as data in `DESKTOP_TEST_SELECTION`.
Once the session exists and before any test runs, the adapter filters Jasmine's
`specFilter`, so an excluded test never runs its hooks or body. Excluded tests
are counted in the run's selection totals, not reported as skipped. A declared
`unsupported` or active `quarantine` test is reported unsupported with its reason,
and an expired quarantine fails that test. A test whose `requires` the host cannot
meet is excluded the same way and reported unsupported.

- **Lanes need declared tests.** An input lane runs only tests declared with
  `desktopIt`. A test registered with plain `it` fails the run, which lists the first
  ten, so migrate a whole file before running a lane against it. A plain `describe`
  is fine; use `desktopDescribe` to scope its tests. Without a lane, plain specs run
  unchanged.
- **Click mode is session-wide.** WDIO owns the session, so the lane sets
  `furn:clickMode` once: accessibility click in the accessible lane, physical
  click in the physical lane. A `click` requirement follows it. Without a lane the
  session uses `auto`, which lets the host choose.
- **Untrustworthy selections fail closed.** A malformed selection, an unverifiable
  Jasmine environment, or an accessible lane on a host that does not report keyboard,
  physical click, and wheel disabled disables every test and fails the run.
- **A bad declaration never throws.** Jasmine only warns when a spec file fails to
  load, so a throw would silently drop every test after it. An invalid declaration
  registers a failing test that reports the problem.
- **Run outside the harness.** With no selection, such as plain `wdio`, every test
  runs and descriptors are still validated.
- `desktopIt` takes no timeout argument; the suite's `timeoutMs` applies.

The input-call lint of Storybook cases does not apply here. Page objects and helpers
hide the input a test sends, so the accessible lane's host mask is the safeguard that
fails a test that reaches for physical input.
