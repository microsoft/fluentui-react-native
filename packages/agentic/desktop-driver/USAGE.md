# Desktop driver usage

This guide covers integration and operation of `@fluentui-react-native/desktop-driver`. See
[README.md](./README.md) for orientation, [DESIGN.md](./DESIGN.md) for architectural constraints,
and [NEXT-STEPS.md](./NEXT-STEPS.md) for unfinished native proof.

## Contents

1. [Prerequisites](#prerequisites)
2. [Project setup](#project-setup)
3. [Application targets](#application-targets)
4. [Portable tests](#portable-tests)
5. [Storybook tests](#storybook-tests)
6. [Desktop host and app controls](#desktop-host-and-app-controls)
7. [Standalone sessions](#standalone-sessions)
8. [Artifacts and diagnosis](#artifacts-and-diagnosis)
9. [Agent and CI operation](#agent-and-ci-operation)

## Prerequisites

Use Node 22.12 or newer and WebdriverIO 9.

### macOS

- macOS 11.3 or newer;
- Xcode 13 or newer and Command Line Tools;
- Xcode Helper accessibility permission;
- Automation Mode enabled;
- a writable WebDriverAgentMac build cache; and
- a logged-in interactive GUI session.

### Windows

- Windows 10 or newer;
- built-in Windows PowerShell;
- an installed or registered application; and
- an unlocked interactive desktop.

Synthetic input cannot activate React Native controls on a locked Windows session even when source
and attributes still work.

Inspect prerequisites before native runs:

```sh
desktop-driver doctor --platform macos
desktop-driver doctor --platform windows
desktop-driver driver detect
desktop-driver driver verify
```

These commands are read-only and print JSON.

## Project setup

### Dependencies

```sh
yarn add --dev \
  @fluentui-react-native/desktop-driver \
  @wdio/cli \
  @wdio/local-runner \
  @wdio/mocha-framework \
  @wdio/spec-reporter \
  expect-webdriverio
```

The package already owns WebdriverIO, Appium, Mac2, and NovaWindows runtime dependencies.

### Common config

Create one `desktop.config.ts`:

```ts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-driver/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  rootDir: '.',
  application: {
    manifest: './app.json',
    readyTestId: 'app-ready',
  },
  storybook: {
    configDir: './src',
    stories: [{ directory: './src', files: '**/*.stories.?(ts|tsx)' }],
    channel: { host: '127.0.0.1', port: 7007, mcp: true },
  },
  tests: {
    generatedDirectory: './desktop-tests/generated',
    fakeScene: './desktop-tests/fake-scene.json',
    artifactsDirectory: './artifacts/desktop-tests',
    framework: 'mocha',
    sessionStrategy: 'suite',
    timeoutMs: 120_000,
    runner: {
      command: 'yarn',
      args: ['wdio', 'run', 'wdio.conf.ts'],
      timeoutMs: 900_000,
    },
  },
  base: {
    driverHost: {
      host: '127.0.0.1',
      port: 0,
      startupTimeoutMs: 120_000,
      logLevel: 'error',
    },
    readiness: {
      requireWindow: true,
      requireStorybookChannel: true,
      requireTestId: 'app-ready',
      timeout: 60_000,
    },
  },
  environment: {
    platform: 'DESKTOP_TEST_PLATFORM',
    launchApp: 'DESKTOP_TEST_APP',
    identity: 'DESKTOP_TEST_IDENTITY',
    processId: 'DESKTOP_TEST_PID',
    windowHandle: 'DESKTOP_TEST_WINDOW',
    windowTitle: 'DESKTOP_TEST_WINDOW_TITLE',
    logLevel: 'DESKTOP_TEST_LOG_LEVEL',
    storyFilter: 'DESKTOP_TEST_GREP',
  },
  platforms: {
    fake: {
      backend: 'fake',
      target: { defaultMode: 'attach', attach: { identity: 'fake' } },
      readiness: { requireStorybookChannel: false, requireTestId: null },
    },
    macos: {
      backend: 'mac2',
      target: {
        defaultMode: 'attach',
        attach: { identityFromApplicationManifest: 'macos.bundleIdentifier' },
      },
    },
    windows: {
      backend: 'novawindows',
      target: {
        defaultMode: 'attach',
        attach: { titleFromApplicationManifest: 'displayName' },
      },
    },
  },
});
```

Inspect the resolved project:

```sh
desktop-driver config resolve --config desktop.config.ts --platform macos
```

The output includes non-sensitive `sources` labels showing whether values came from an option,
environment variable name, platform config, application manifest, base config, or default.
Environment-derived target, log-level, and story-filter values are replaced with source markers in
the serialized output.

The loader:

- rejects unknown keys and invalid nested values;
- validates all three platform blocks;
- allows only loopback listeners;
- canonicalizes existing input directories/files;
- confines generated and artifact output to `rootDir`;
- verifies application-manifest field references; and
- rejects generated manifests whose config fingerprint is stale.

### WDIO config

```ts
import { loadDesktopConfig, toDesktopWdioOptions } from '@fluentui-react-native/desktop-driver/config/node';
import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';

const project = loadDesktopConfig(new URL('./desktop.config.ts', import.meta.url));

export const config = createDesktopWdioConfig(toDesktopWdioOptions(project));
```

`toDesktopWdioOptions()` loads the generated manifest and selects only:

- the generated inline-plan spec; and
- linked specs referenced by manifest entries.

An unreferenced `*.desktop.spec.ts` is not executed.

## Application targets

### Launch

Launch mode grants ownership:

```sh
DESKTOP_TEST_PLATFORM=macos \
DESKTOP_TEST_APP=/absolute/path/MyApp.app \
wdio run wdio.conf.ts
```

```powershell
$env:DESKTOP_TEST_PLATFORM = 'windows'
$env:DESKTOP_TEST_APP = 'Contoso.MyApp_abc123!App'
yarn wdio run wdio.conf.ts
```

The session may stop only the app and process tree it launched.

### Attach

Omit `DESKTOP_TEST_APP` to attach without termination ownership.

macOS requires a bundle ID:

```sh
DESKTOP_TEST_PLATFORM=macos \
DESKTOP_TEST_IDENTITY=com.contoso.MyApp \
wdio run wdio.conf.ts
```

Windows accepts an exact PID, native window handle, identity, or unambiguous title:

```powershell
$env:DESKTOP_TEST_PLATFORM = 'windows'
$env:DESKTOP_TEST_PID = '12345'
yarn wdio run wdio.conf.ts
```

```powershell
$env:DESKTOP_TEST_WINDOW = '0x501e2'
# or
$env:DESKTOP_TEST_WINDOW_TITLE = 'Contoso'
```

Windows non-handle targets are resolved through a disposable root-desktop session. An ambiguous
match fails before the real application session starts.

## Portable tests

Prefer selectors in this order:

1. `testID` through `byTestId()`;
2. role plus accessible name;
3. accessible name;
4. visible text as an explicit fallback; and
5. platform-only selectors in platform-only suites.

```ts
import { byTestId } from '@fluentui-react-native/desktop-driver';

describe('Form', () => {
  it('submits', async () => {
    const submit = await $(byTestId('submit'));
    await expect(submit).toBeDisplayed();
    await submit.click();
    await expect(await $(byTestId('status'))).toHaveText('Submitted');
  });
});
```

Shared specs:

- contain no platform branches;
- import no `./macos` or `./windows` extension;
- use the documented portable command matrix; and
- run from the same path on both platforms.

`browser.desktop.getSessionInfo()` reports runtime support. A missing required command is an
infrastructure error, never a silent skip.

React Native macOS Fabric 0.81 does not reliably expose disabled state through AXEnabled. Shared
tests use disabled inertness rather than `isEnabled()` on Mac2.

## Storybook tests

### Declare an inline plan

```ts
export const Default = {
  parameters: {
    desktopTest: {
      kind: 'inline',
      id: 'button-default',
      steps: [
        { action: 'expectVisible', target: { testId: 'button-default' } },
        { action: 'press', target: { testId: 'button-default' } },
        {
          action: 'expect',
          target: { testId: 'button-status' },
          property: 'text',
          equals: 'Pressed',
        },
      ],
    },
  },
};
```

### Link a normal WDIO spec

```ts
export const Interaction = {
  parameters: {
    desktopTest: {
      kind: 'spec',
      id: 'button-interaction',
      spec: './button.desktop.spec.ts',
    },
  },
};
```

```ts
import { byTestId, story } from '@fluentui-react-native/desktop-driver';

describe('[story:components-button--interaction] Button interaction', () => {
  before(async () => {
    await story.select('components-button--interaction');
  });

  it('responds to a press', async () => {
    await (await $(byTestId('button-interaction'))).click();
  });
});
```

The linked suite tag must exactly match the generated story tag and contain a runnable test.

### Generate

```sh
desktop-driver stories generate --config desktop.config.ts
```

Generation atomically commits:

- `story-plans.generated.spec.ts`;
- `desktop-runtime.generated.ts`; and
- `story-tests.manifest.json` last as the commit marker.

The manifest includes normalized paths, plans, linked-spec bytes, and the config fingerprint.

## Desktop host and app controls

Start the host:

```sh
DESKTOP_TEST_PLATFORM=macos \
desktop-driver host --config desktop.config.ts
```

The host owns:

- Storybook's channel/MCP listener;
- one transport-free run coordinator;
- one active WDIO runner; and
- native WebDriver child hosts started by that runner.

Metro remains a separate explicit process.

### App protocol

The React Native app imports:

- the generated `desktop-runtime.generated.ts`; and
- `@fluentui-react-native/desktop-driver/protocol`.

It accepts a host only when protocol version and manifest digest match. Run current is enabled only
for tested story IDs in the generated projection.

Channel events are:

- `desktopTestHostReady`
- `desktopTestHostClosing`
- `desktopTestRunRequest`
- `desktopTestRunStatus`
- `desktopTestRunCancel`

Statuses carry monotonic sequence numbers. The app ignores stale services, requests, and status
updates.

### Process supervision

```sh
desktop-driver host \
  --config desktop.config.ts \
  --ready-file artifacts/desktop-host.ready.json \
  --shutdown-file artifacts/desktop-host.stop
```

The ready file is atomic and contains URL, service ID, manifest digest, and tested stories.
Do not parse the full long-lived host stdout as one JSON document; it also carries runner output.

### Console story control

```sh
desktop-driver stories list --config desktop.config.ts
desktop-driver stories select components-button--default --config desktop.config.ts
desktop-driver stories args components-button--default '{"appearance":"primary"}' --config desktop.config.ts
desktop-driver stories smoke --config desktop.config.ts
```

## Standalone sessions

Use the same host without the WDIO testrunner:

```ts
import { remote, startDesktopDriver } from '@fluentui-react-native/desktop-driver/wdio';

const driver = await startDesktopDriver(options);
const browser = await remote(driver.webdriverOptions);

try {
  // Normal WebdriverIO commands and shared page objects.
} finally {
  await browser.deleteSession();
  await driver.stop();
}
```

This works with Jest, Vitest, `node:test`, scripts, and other runners without introducing another
test API.

## Artifacts and diagnosis

```text
artifacts/desktop-tests/<run-id>/
  run.json
  events.ndjson
  junit.xml
  ownership.json
  driver-host.log
  workers/<worker-id>/
    run.json
    junit.xml
  tests/<test-id>/
    result.json
    source.xml
    screenshot.png
```

The launcher merges worker results, startup failures, and cleanup failures into root `run.json`
and `junit.xml`.

Result statuses are:

- `passed`
- `failed`
- `skipped`
- `cancelled`
- `timed_out`
- `infrastructureError`

`captureArtifacts()` returns only files captured by that call. Complete reports are not truncated;
event payloads remain bounded and redacted.

Inspect:

| Surface            | Purpose                               |
| ------------------ | ------------------------------------- |
| WDIO reporter      | Immediate framework output            |
| Host stdout/stderr | On-device run and process output      |
| `run.json`         | Complete machine-readable result      |
| `junit.xml`        | CI test reporting                     |
| `events.ndjson`    | Lifecycle and infrastructure sequence |
| `ownership.json`   | Exact resource ownership              |
| source/screenshots | Native UI diagnosis                   |

Screenshots, accessibility source, and logs may contain private application content.

## Agent and CI operation

1. Run `doctor` and parse its JSON.
2. Generate Storybook tests and retain the manifest digest.
3. Start declared long-lived processes in dependency order.
4. Wait for ready-file or documented readiness before starting tests.
5. Select launch or attach explicitly.
6. Run the declared workspace test command and preserve its exit code.
7. Treat failed, cancelled, timed out, error, or infrastructure outcomes according to workflow
   policy; never infer success from process exit alone.
8. Inspect root reports and lifecycle events on failure.
9. In attach mode, verify the original app remains alive.
10. Stop only exact resources recorded as owned.

The fake backend is an appropriate CI gate for package plumbing. Release compatibility still
requires the native checks in [NEXT-STEPS.md](./NEXT-STEPS.md).
