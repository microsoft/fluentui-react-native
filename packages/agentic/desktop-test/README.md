# Native desktop test harness

`@fluentui-react-native/desktop-test` provides application-neutral configuration,
native service composition, process lifetimes, standalone WDIO/Jasmine suites,
and reporting for macOS, Windows, and Win32. It uses
`@fluentui-react-native/desktop-driver`; Storybook support is an optional
integration in `@fluentui-react-native/storybook-desktop`.

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
```

Read the [configuration guide](references/configuration.md) to define app
targets or suites, then use the [command guide](references/commands.md) to run
them. See the [reference index](references/README.md) for all topics, and
[AGENTS.md](AGENTS.md) when working on the package.

## Supported responsibilities

- App targets and suites share one structural configuration schema.
- WDIO owns suite sessions, globals, hooks, grouped execution, retries, and
  framework assertions.
- The harness supervises services, workers, the driver, and app lifetimes.
- Every run records structured results, command output, and evidence in its
  artifact directory.
- Native helpers are explicitly built or provisioned; normal test runs use
  verified prebuilt helpers only.

macOS RN Test App users must bundle before `prep`, then build: CocoaPods embeds
only resources that exist during `pod install`. Renderer changes require a new
`prep`. See `references/platforms.md`.

The repository's legacy E2E application runs its WebdriverIO suites through this
harness; each endpoint's app directory provides its own `e2eprep` and `e2etest`
commands. Consult the consumer's E2E documentation for suite selection.
