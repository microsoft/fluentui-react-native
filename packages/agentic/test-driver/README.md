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
or run the Appium CLI. It reuses the Mac2 and Windows Appium driver implementations behind an
isolated single-driver host.

## Quick start

Install the package, WebdriverIO 9, a framework adapter, and a reporter. Then create a standard WDIO
configuration:

```ts
// wdio.conf.ts
import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopAppTarget, DesktopPlatform } from '@fluentui-react-native/desktop-driver';

const platform = process.env.DESKTOP_TEST_PLATFORM as DesktopPlatform;
const target: DesktopAppTarget = process.env.DESKTOP_TEST_APP
  ? { mode: 'launch', app: process.env.DESKTOP_TEST_APP }
  : platform === 'macos'
    ? { mode: 'attach', identity: process.env.DESKTOP_TEST_IDENTITY }
    : { mode: 'attach', title: process.env.DESKTOP_TEST_WINDOW_TITLE ?? 'MyApp' };

export const config = createDesktopWdioConfig({
  platform,
  target,
  specs: ['./desktop-tests/**/*.spec.ts'],
  framework: 'mocha',
  sessionStrategy: 'suite',
  artifactsDirectory: './artifacts/desktop-tests',
  reporters: ['spec'],
});
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
reported by `browser.desktop.getSessionInfo()`; a missing portable capability is an infrastructure
failure, not a silent skip.

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
desktop-driver stories generate --story-root src --out desktop-tests/generated
```

Generation emits a validated manifest and a generated WDIO spec. The manifest hashes executable
story metadata and linked spec contents so Windows and macOS jobs can prove they ran the same tests.

`desktop-driver serve` lets an on-device Storybook UI request the current story or all tested
stories. The app sends only allowlisted story IDs; the host owns WebdriverIO execution and streams
structured progress back to the app.

### Standalone sessions

Jest, Vitest, `node:test`, and scripts can use the same backend without the WDIO testrunner:

```ts
import { remote } from 'webdriverio';
import { startDesktopDriver } from '@fluentui-react-native/desktop-driver/wdio';

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

Artifacts can contain private application content. Keep them ignored, review them before sharing,
and never publish service tokens.

## CLI

```text
desktop-driver doctor              Report backends and platform prerequisites
desktop-driver stories generate    Generate the Storybook test manifest and WDIO spec
desktop-driver stories list        List stories reported by a running Storybook app
desktop-driver serve               Host on-device Storybook test requests
desktop-driver start               Start a driver host and print endpoint metadata
desktop-driver version             Print the package version
```

Commands print JSON for scripting and agent workflows. Prefer the WDIO integration or
`startDesktopDriver()` for normal sessions; the current `start` command is not yet a persistent
interactive host.

## Prerequisites

**macOS**

- macOS 11.3 or newer and Xcode 13 or newer
- Command Line Tools and a writable WebDriverAgentMac build cache
- Accessibility permission for Xcode Helper
- Automation mode enabled
- A logged-in GUI session

**Windows**

- An interactive, unlocked desktop session
- The application installed or registered
- Developer Mode
- WinAppDriver for the Windows backend
- `APPIUM_WAD_PATH` when WinAppDriver is not in its standard installation directory

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
