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
