# `@fluentui-react-native/desktop-driver`

Write one WebdriverIO test and run it unchanged against React Native Windows and React Native
macOS applications.

> Status: alpha. The public API may change before 1.0.

## Overview

The desktop driver keeps platform automation out of test source. Tests use normal WebdriverIO
sessions, elements, expectations, hooks, page objects, and reporters. The package adds:

- a validated `testID` selector;
- an owned, loopback-only host for one native desktop driver;
- safe launch and attach lifecycle modes;
- a small portable `browser.desktop` command set;
- Storybook story discovery, navigation, and on-device run controls; and
- structured lifecycle events, JUnit, screenshots, source, and ownership artifacts.

The same shared spec runs in separate Windows and macOS jobs. Platform-specific commands remain
available through explicit extension exports, but a test that uses them is not part of the portable
suite.

The package does not automate mobile platforms or browsers, replace Storybook's unit-test tooling,
or run the Appium CLI. It embeds WebdriverIO, Appium, Mac2, and NovaWindows as runtime dependencies
behind an isolated single-driver host and uses Storybook's maintained React Native channel server
for its control plane.

## Quick start

Install the package, a WebdriverIO runner, a framework adapter, and a reporter. The package already
provides the WebdriverIO client and both platform drivers. Define the application once:

```ts
// desktop.config.ts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-driver/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  application: { manifest: './app.json', readyTestId: 'app-ready' },
  storybook: {
    configDir: './src',
    stories: [{ directory: './src', files: '**/*.stories.?(ts|tsx)' }],
    channel: { host: '127.0.0.1', port: 7007 },
  },
  tests: {
    generatedDirectory: './desktop-tests/generated',
    artifactsDirectory: './artifacts/desktop-tests',
    runner: { command: 'yarn', args: ['wdio', 'run', 'wdio.conf.ts'] },
  },
  platforms: {
    fake: { backend: 'fake', target: { defaultMode: 'attach', attach: { identity: 'fake' } } },
    macos: {
      backend: 'mac2',
      target: { defaultMode: 'attach', attach: { identityFromApplicationManifest: 'macos.bundleIdentifier' } },
    },
    windows: {
      backend: 'novawindows',
      target: { defaultMode: 'attach', attach: { titleFromApplicationManifest: 'displayName' } },
    },
  },
});
```

Project the same config into WebdriverIO:

```ts
// wdio.conf.ts
import { loadDesktopConfig, toDesktopWdioOptions } from '@fluentui-react-native/desktop-driver/config/node';
import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';

export const config = createDesktopWdioConfig(toDesktopWdioOptions(loadDesktopConfig(new URL('./desktop.config.ts', import.meta.url))));
```

Write an ordinary WebdriverIO test:

```ts
// desktop-tests/button.spec.ts
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

Run the configured platform:

```sh
DESKTOP_TEST_PLATFORM=macos DESKTOP_TEST_APP=/path/to/MyApp.app wdio run wdio.conf.ts
```

Set `DESKTOP_TEST_APP` for launch mode. Omit it and provide an attach selector to test an
already-running app without shutting it down.

See [USAGE.md](./USAGE.md) for complete launch, attach, Storybook, on-device, console, debugger,
and agent workflow examples.

## Core concepts

### Portable tests

Shared tests use `byTestId()` and the documented WebdriverIO command subset. `testID` maps to the
native automation identifier on both platforms.

Prefer selectors in this order:

1. `testID` through `byTestId()`
2. role plus accessible name
3. accessible name
4. visible text as an explicit fallback
5. a platform-specific selector in a platform-specific suite

The portable commands cover element lookup, display/enabled/selected state, click, clear and set
value, text and value reads, waits, source, screenshots, focus, and scrolling. Runtime support is
reported by `browser.desktop.getSessionInfo()`; a missing portable capability is never a silent
skip. React Native macOS Fabric 0.81 does not expose disabled state through AXEnabled, so Mac2
omits `isEnabled()` and shared tests verify disabled inertness instead.

### Launch and attach

```ts
type DesktopAppTarget =
  | { mode: 'launch'; app: string; args?: readonly string[]; workingDirectory?: string }
  | { mode: 'attach'; identity?: string; processId?: number; windowHandle?: string; title?: string };
```

- **Launch mode** owns the app and may shut down only the resources it started.
- **Attach mode** records the app as external and leaves it running.

Windows supports process ID, native window handle, identity, or an unambiguous title. macOS attach
currently requires the application bundle identifier in `identity`.

Cleanup uses exact resources recorded in `ownership.json`, never process names. Protected backend
capabilities cannot override ownership or route the session to a different app.

### Storybook tests

Stories opt in through `parameters.desktopTest`. An inline plan handles common serializable
interactions:

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

A story can instead link a colocated `*.desktop.spec.ts` for arbitrary TypeScript. Run:

```sh
desktop-driver stories generate --config desktop.config.ts
```

Generation emits a validated manifest and a generated WDIO spec. The manifest hashes executable
story metadata and linked spec contents so Windows and macOS jobs can prove they ran the same tests.

`desktop-driver host` owns Storybook's channel/MCP server and desktop test coordination in one
process. The app sends only allowlisted story IDs over the channel; the host owns WebdriverIO
execution and returns structured progress on that same channel.

### Standalone sessions

Jest, Vitest, `node:test`, and scripts can use the same backend without the WDIO testrunner:

```ts
import { remote, startDesktopDriver } from '@fluentui-react-native/desktop-driver/wdio';

const service = await startDesktopDriver(options);
const browser = await remote(service.webdriverOptions);

try {
  // Use the same WebdriverIO commands and page objects.
} finally {
  await browser.deleteSession();
  await service.stop();
}
```

## Artifacts

Runs write machine-readable results and diagnostics under the configured artifact directory:

```text
<run-id>/
  run.json
  events.ndjson
  junit.xml
  ownership.json
  driver-host.log
  tests/<test-id>/
    result.json
    source.xml
    screenshot.png
```

Artifacts can contain private application content. Keep them ignored and review them before
sharing.

## CLI

```text
desktop-driver doctor              Report backends and platform prerequisites
desktop-driver driver detect       Detect the embedded driver and native runtime
desktop-driver driver verify       Verify the self-contained driver installation
desktop-driver config resolve      Print the fully resolved project configuration
desktop-driver host                 Host Storybook channel, MCP, and desktop test coordination
desktop-driver stories generate    Generate the Storybook test manifest and WDIO spec
desktop-driver stories list        List stories reported by a running Storybook app
desktop-driver stories select      Select a story and wait for its rendered event
desktop-driver stories args        Update a story's control args
desktop-driver stories smoke       Select every indexed story and report render failures
desktop-driver start               Start a driver host and print endpoint metadata
desktop-driver version             Print the package version
```

Commands print JSON for scripting and agent workflows. `start` and `host` remain alive until
SIGINT or SIGTERM and stop only resources they own. `host --ready-file <path>` atomically writes
the service identity, URL, manifest digest, and tested stories for process supervisors.

## Prerequisites

**macOS**

- macOS 11.3 or newer and Xcode 13 or newer
- Command Line Tools and a writable WebDriverAgentMac build cache
- Accessibility permission for Xcode Helper
- Automation mode enabled
- A logged-in GUI session

**Windows**

- Windows 10 or newer with Windows PowerShell
- An interactive, unlocked desktop session
- The application installed or registered

NovaWindows uses the built-in Windows PowerShell runtime. It does not require WinAppDriver,
Developer Mode, an Appium driver registry, or a separately installed native service.

Run `desktop-driver doctor --platform <macos|windows>` before a real test. A prerequisite reported
as `unknown` has not been verified and must not be treated as satisfied.

## Package development

```sh
yarn workspace @fluentui-react-native/desktop-driver format
yarn workspace @fluentui-react-native/desktop-driver lint
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test
```

The `fake` backend exercises the package's host, service, commands, Storybook, lifecycle, and
artifact contracts without a native GUI. It is not a substitute for real Windows and macOS
coverage.

## More information

- [USAGE.md](./USAGE.md) — complete integration and execution recipes
- [DESIGN.md](./DESIGN.md) — architecture, ownership, portability, protocol, and security details
- [NEXT-STEPS.md](./NEXT-STEPS.md) — unfinished work and open decisions only
