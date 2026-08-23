# `@fluentui-react-native/desktop-driver`

Write one WebdriverIO test and run it unchanged against React Native Windows and React Native macOS.

> **Status:** alpha. Refactor Phases 0-5 are complete. Native release proof and legacy Windows
> harness retirement remain in [NEXT-STEPS.md](./NEXT-STEPS.md).

## What the package provides

- ordinary WebdriverIO sessions, elements, expectations, hooks, page objects, and reporters;
- one schema-versioned project config for stories, tests, targets, readiness, runner, and artifacts;
- a validated `testID` selector and small portable desktop command matrix;
- one owned, loopback-only native WebDriver host;
- ownership-safe launch and attach modes;
- static Storybook test discovery with inline plans or linked specs;
- one Storybook channel for control, MCP, on-device runs, progress, and cancellation;
- structured run reports, lifecycle events, JUnit, ownership, source, screenshots, and logs; and
- an in-process fake backend for deterministic package and CI coverage.

The package embeds WebdriverIO, Appium, Mac2, and NovaWindows. It does not run the Appium CLI,
expose native driver objects, automate mobile or browser targets, or replace Storybook's unit-test
tooling.

## Requirements

- Node 22.12 or newer;
- WebdriverIO 9 runner/framework packages in the consuming test workspace;
- an interactive GUI session for real native runs;
- macOS 11.3+ and Xcode 13+ for Mac2; or
- Windows 10+ and Windows PowerShell for NovaWindows.

Windows input requires an unlocked desktop. Fake-backend success does not prove native behavior.

## Install

```sh
yarn add --dev \
  @fluentui-react-native/desktop-driver \
  @wdio/cli \
  @wdio/local-runner \
  @wdio/mocha-framework \
  @wdio/spec-reporter \
  expect-webdriverio
```

Consumers do not install or register Appium drivers separately.

## Quick start

### 1. Define the project once

```ts
// desktop.config.ts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-driver/config';

export default defineDesktopConfig({
  schemaVersion: 1,
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
    runner: {
      command: 'yarn',
      args: ['wdio', 'run', 'wdio.conf.ts'],
    },
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

The loader rejects unknown keys, invalid targets, non-loopback hosts, missing inputs, stale
manifests, and output paths outside the project root before starting a process.

### 2. Project it into WDIO

```ts
// wdio.conf.ts
import { loadDesktopConfig, toDesktopWdioOptions } from '@fluentui-react-native/desktop-driver/config/node';
import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';

const project = loadDesktopConfig(new URL('./desktop.config.ts', import.meta.url));

export const config = createDesktopWdioConfig(toDesktopWdioOptions(project));
```

WDIO runs only the generated inline spec and linked specs referenced by the validated manifest.

### 3. Write a portable test

```ts
import { byTestId } from '@fluentui-react-native/desktop-driver';

describe('Button', () => {
  it('invokes onPress', async () => {
    const button = await $(byTestId('button-default'));
    await expect(button).toBeDisplayed();
    await button.click();
    await expect(await $(byTestId('button-status'))).toHaveText('Pressed');
  });
});
```

Use standard WebdriverIO commands first. `browser.desktop` adds only:

- `getSessionInfo()`
- `waitForAppState()`
- `captureArtifacts()`
- `selectStory()` / `waitForStory()`
- `isFocused()`
- `scrollIntoView()`

### 4. Generate and run

```sh
desktop-driver stories generate --config desktop.config.ts

# Contract backend, no GUI
DESKTOP_TEST_PLATFORM=fake wdio run wdio.conf.ts

# Attach to a running macOS app
DESKTOP_TEST_PLATFORM=macos \
DESKTOP_TEST_IDENTITY=com.contoso.MyApp \
wdio run wdio.conf.ts

# Launch and own a Windows app
DESKTOP_TEST_PLATFORM=windows \
DESKTOP_TEST_APP='Contoso.MyApp_abc123!App' \
wdio run wdio.conf.ts
```

Setting `DESKTOP_TEST_APP` selects launch mode. Without it, the selected platform uses attach mode
and leaves the external app running.

## Storybook tests

Stories opt in through `parameters.desktopTest`.

### Inline plan

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

### Linked spec

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

The linked suite must contain the exact generated `[story:<id>]` tag. Story modules are parsed
statically and never executed during discovery.

## Desktop host and on-device runs

```sh
desktop-driver host --config desktop.config.ts
```

The host owns Storybook's channel/MCP listener and the run coordinator. The app sends only
versioned, manifest-constrained story IDs. Run all uses one WDIO process and one warm session while
streaming framework results.

Host-side control uses the same config:

```sh
desktop-driver stories list --config desktop.config.ts
desktop-driver stories select components-button--default --config desktop.config.ts
desktop-driver stories args components-button--default '{"appearance":"primary"}' --config desktop.config.ts
desktop-driver stories smoke --config desktop.config.ts
```

`host --ready-file <path>` atomically publishes the host URL, service ID, manifest digest, and
tested stories for supervisors.

## Ownership and artifacts

- **Launch mode** owns the app and may stop only resources it started.
- **Attach mode** records the app/window as external and never terminates them.
- Cleanup uses exact observed resources, never process names.

Every completed WDIO run writes the root report, lifecycle stream, JUnit, and driver-host log:

```text
artifacts/desktop-tests/<run-id>/
  run.json
  events.ndjson
  junit.xml
  driver-host.log
```

`ownership.json` is written after host startup and attach discovery. Per-test diagnostics are
conditional: they are created for failed tests or an explicit `captureArtifacts()` call.
`sessionStrategy: 'spec'` also creates worker reports before the launcher merge:

```text
artifacts/desktop-tests/<run-id>/
  ownership.json
  workers/<worker-id>/
    run.json
    junit.xml
  tests/<test-id>/
    result.json
    source.xml
    screenshot.png
```

Result status distinguishes passed, failed, skipped, cancelled, timed out, and infrastructure
error. Artifacts can contain private screen content and must remain ignored and reviewed before
sharing.

## CLI

```text
desktop-driver doctor
desktop-driver driver detect|verify
desktop-driver config resolve|print
desktop-driver stories generate|list|select|args|smoke
desktop-driver host
desktop-driver start
desktop-driver version
```

One-shot commands print JSON. Long-lived `host` forwards runner output, so automation should read
its atomic `--ready-file` and run artifacts rather than parse the complete stdout stream.

## Package development

```sh
yarn workspace @fluentui-react-native/desktop-driver format
yarn workspace @fluentui-react-native/desktop-driver lint
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test
```

## Documentation

- [USAGE.md](./USAGE.md) — complete operating recipes
- [DESIGN.md](./DESIGN.md) — implemented architecture and invariants
- [NEXT-STEPS.md](./NEXT-STEPS.md) — unfinished work and open decisions
- [suggestions.md](./suggestions.md) — completed refactor decision record
- [`src/README.md`](./src/README.md) — maintainer module map
