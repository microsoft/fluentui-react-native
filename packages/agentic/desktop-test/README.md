# Native desktop test harness

`@fluentui-react-native/desktop-test` provides application-neutral configuration,
native service composition, process lifetimes, standalone WDIO/Jasmine suites,
and reporting for macOS, Windows, and Win32. Authorized, bounded persisted
run/status/artifact reads are available from the direct
`./reporting/run-queries` entry; see [reporting](references/reporting.md).
It uses
`@fluentui-react-native/desktop-driver`; Storybook support is an optional
integration in `@fluentui-react-native/storybook-desktop`.

**Work in progress:** [current status](references/current-status.md) separates
implemented capabilities from incomplete ownership/recovery guarantees and
records consumer qualification evidence.

## Quick start

Add a `desktop.config.mts` in the app workspace:

```ts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    windows: {
      host: {
        kind: 'installed',
        application: { executablePath: 'C:\\apps\\Sample.exe', windowTitle: 'Sample' },
      },
      readiness: { kind: 'native', testId: 'application-ready' },
    },
  },
});
```

Expose the CLI in the workspace script and run a declared stage:

```json
{ "scripts": { "desktop-test": "desktop-test" } }
```

```sh
yarn desktop-test --target windows build-driver
yarn desktop-test --target windows test --suite regression --list
yarn desktop-test --target windows test --suite regression
yarn desktop-test --target windows --reporter json test --suite regression
```

Read the [configuration guide](references/configuration.md) to define app
targets or suites, then use the [command guide](references/commands.md) to run
them. `--reporter json` emits a bounded result summary; use
`--reporter ndjson --events progress` for machine-readable live progress. See
[reporting](references/reporting.md) for precedence and artifact details, the
[reference index](references/README.md) for all topics, and [AGENTS.md](AGENTS.md)
when working on the package.

## Supported responsibilities

- App targets and suites share one structural configuration schema.
- WDIO owns suite sessions, globals, hooks, grouped execution, retries, and
  framework assertions.
- The generic harness supervises services, workers, the driver, and application
  claim resources. Launch defaults to session-owned; macOS can opt into
  supervisor-owned launch. External attach always preserves the app. Neutral
  exact identity helpers live at `/application-ownership`; Storybook's lifecycle
  takeover remains transitional (see [lifecycle](references/lifecycle.md)).
- Every run records structured results, command output, and evidence in its
  artifact directory.
- Native helpers are explicitly built or provisioned; normal test runs use
  verified prebuilt helpers only.
- Generic and Storybook native services share one factory with durable
  quarantine storage and exact application-exit probes. Restart does not clear
  uncertain effects; see [lifecycle and recovery](references/lifecycle.md).
- Owned Node services inherit a per-command parent lifeline. Cooperative
  disposers await initialization and settlement before withdrawing descriptors;
  Metro and command wrappers use their own SIGTERM handlers. Without a
  disposer, the lifeline dispatches installed SIGTERM handlers directly, because
  a Windows self-signal terminates without running them. A readiness receipt
  is correlated to that command's incarnation and producer process, not a file
  or a successful HTTP response. This proves only service readiness, not target,
  application, or context readiness. Unsettled cleanup stays fenced.

macOS RN Test App users must bundle before `prep`, then build: CocoaPods embeds
only resources that exist during `pod install`. Renderer changes require a new
`prep`. See `references/platforms.md`.

The repository's legacy E2E application runs its WebdriverIO suites through this
harness; each endpoint's app directory provides its own `e2eprep` and `e2etest`
commands. Consult the consumer's E2E documentation for suite selection.
