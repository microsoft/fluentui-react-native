# WebdriverIO integration

This module adapts resolved desktop-driver configuration to normal WebdriverIO behavior.

## Main entry points

- `createDesktopWdioConfig()` composes capabilities, services, hooks, framework options, reporters,
  and one-session grouping.
- `DesktopWdioService` is the WDIO launcher/worker facade.
- `startDesktopDriver()` and `remote` support standalone Jest, Vitest, `node:test`, and scripts.
- `runInlineStoryPlan()` executes generated inline plans.

## Internal modules

- `run-context.ts` validates the launcher-to-worker endpoint payload.
- `readiness.ts` enforces window, Storybook, and `testID` gates.
- `standalone.ts` owns non-testrunner host lifecycle.
- `commands.ts` implements the narrow `browser.desktop` additions.
- `window-discovery.ts` resolves one exact Windows attach handle through a disposable root session.
- `capability-map.ts` protects routing and ownership-sensitive capabilities.

## Reporting

Workers write complete artifacts. Suite strategy writes the root report directly; spec strategy
writes worker reports that the launcher merges with root startup and cleanup failures. The final
report preserves story IDs, skips, cancellation, timeouts, assertion failures, infrastructure
failures, and cleanup errors.

Do not add a second element API. Standard WebdriverIO remains the authoring surface.
