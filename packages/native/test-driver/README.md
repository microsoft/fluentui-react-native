# `@fluentui-react-native/desktop-driver`

Write-once desktop tests for React Native Windows and React Native macOS applications.

One `*.spec.ts` file runs unchanged on both platforms. Platform selection lives in configuration
and driver startup, never in test logic.

> Status: alpha. The public API is expected to change before 1.0.

## What this is

- **Standard WebdriverIO.** Tests use the ordinary `browser`, `$`, element, `expect-webdriverio`,
  hook, page-object, and reporter APIs. This package adds a small portable helper layer, not a
  competing test API.
- **A single-driver host you own.** The package starts one loopback-only WebDriver process that
  hosts exactly one platform driver. No Appium CLI and no multi-driver Appium router is started.
- **Ownership-safe.** Launch mode stops only what it started. Attach mode leaves an externally
  launched application running, which is what lets an interactive Storybook app run its own tests
  and stay open.

## What this is not

- It is not an Appium client, and Appium is not the test-authoring model. It _does_ reuse the
  Appium driver implementations — see [Honest dependency notes](#honest-dependency-notes).
- It does not replace Storybook's portable stories or its web test runner.
- It does not automate Android, iOS, browsers, or React Native Web.

## Quick start

```ts
// wdio.conf.ts
import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';

export const config = createDesktopWdioConfig({
  platform: process.env.DESKTOP_TEST_PLATFORM as 'macos' | 'windows',
  specs: ['./desktop-tests/**/*.spec.ts'],
  framework: 'mocha',
  sessionStrategy: 'suite',
  target: process.env.DESKTOP_TEST_APP ? { mode: 'launch', app: process.env.DESKTOP_TEST_APP } : { mode: 'attach', title: 'MyApp' },
  artifactsDirectory: './artifacts/desktop-tests',
  // Its digest lands in run.json, so a CI job can prove both platforms ran the same story tests.
  storyManifest: './desktop-tests/generated/story-tests.manifest.json',
});
```

```ts
// desktop-tests/button.spec.ts
import { byTestId, story } from '@fluentui-react-native/desktop-driver';

describe('[story:components-button--default] Button default story', () => {
  before(async () => {
    await story.select('components-button--default');
  });

  it('invokes onPress', async () => {
    const button = await $(byTestId('button-default'));
    await expect(button).toBeDisplayed();
    await button.click();

    await expect(await $(byTestId('button-status'))).toHaveText('Pressed');
  });
});
```

Run it with the ordinary WebdriverIO testrunner: `wdio run wdio.conf.ts`.

## Selector policy

React Native maps `testID` to UI Automation `AutomationId` on Windows and to the native
accessibility identifier on macOS, and both drivers expose it through the W3C `accessibility id`
strategy. That makes it the one selector that behaves identically on both platforms.

Priority:

1. `testID` through `byTestId()`
2. role plus accessible name
3. accessible name
4. visible text, as an explicit fallback
5. a platform-specific selector, through the opt-in extension subpaths

`byTestId()` validates the identifier and rejects anything WebdriverIO would silently reinterpret
as a different locator strategy (a leading `~`, `//`, `=`, `#`, and so on). XPath, class chains,
predicate strings, and coordinates are not portable API.

## Portable command matrix

Versioned, and reported at runtime by `browser.desktop.getSessionInfo()`. A missing portable
capability is an infrastructure failure, never a silent skip.

| Command                                     | Surface              |
| ------------------------------------------- | -------------------- |
| `findElement`, `findElements`, `isExisting` | standard WebdriverIO |
| `isDisplayed`, `isEnabled`, `isSelected`    | standard WebdriverIO |
| `click`, `clearValue`, `setValue`           | standard WebdriverIO |
| `getText`, `getValue`                       | standard WebdriverIO |
| `waitForDisplayed`, `waitForExist`          | standard WebdriverIO |
| `getPageSource`, `takeScreenshot`           | standard WebdriverIO |
| `isFocused`                                 | `browser.desktop`    |
| `scrollIntoView`                            | `browser.desktop`    |

`isFocused()` and the desktop branch of `scrollIntoView()` are implemented in WebdriverIO by
evaluating a DOM script, which no native desktop driver can run. Routing them through
`browser.desktop` keeps them portable rather than dropping them from the matrix.

- **`isFocused`** reads the backend's focus attribute — `HasKeyboardFocus` on Windows, `focused`
  on macOS — and only falls back to the W3C active-element route when a backend answers that
  instead. WinAppDriver 1.2.1 implements neither `GET` nor `POST /session/:id/element/active`, and
  an absent answer is reported as an infrastructure failure rather than as "not focused", so a
  focus assertion can never become quietly unfalsifiable.
- **`scrollIntoView`** returns immediately when the element is already displayed, which is the
  case almost every spec hits and the only one with no side effects. Otherwise it issues the
  backend's native scroll with a real wheel delta and re-checks, because both `windows: scroll`
  and `macos: scroll` reject a call with no delta. Synthetic wheel input can be refused by the OS,
  and that is surfaced as an infrastructure error with the driver's own message.

The generated capabilities always pin `browserName: ''`. WebdriverIO picks between its web and
native command implementations from the capability shape, and the two backends would otherwise
disagree; pinning it makes `getValue()`, `setValue()`, and the wait commands resolve to the same
implementation on both platforms. The two backends still differ underneath — a WinAppDriver
session negotiates as JSONWireProtocol (`browser.isW3C === false`) while Mac2 is W3C — which is
exactly why the portable set is defined at the WebdriverIO API level and not at the wire level.

### What is not portable

`getText()` returns the element's own accessible name. A React Native `Pressable` whose label
comes only from a child `Text` is published to UI Automation with an empty `Name`, so its text is
readable on macOS and empty on Windows. Assert text on the element that owns it, or give the
control an explicit `accessibilityLabel`.

## `browser.desktop`

```ts
interface DesktopBrowserCommands {
  getSessionInfo(): Promise<DesktopSessionInfo>;
  waitForAppState(state: DesktopAppState, options?: { timeout?: number }): Promise<void>;
  captureArtifacts(reason: string): Promise<ArtifactManifest>;
  selectStory(storyId: string): Promise<void>;
  waitForStory(storyId: string): Promise<void>;
  isFocused(selector: string): Promise<boolean>;
  scrollIntoView(selector: string): Promise<void>;
}
```

## Session ownership

```ts
type DesktopAppTarget =
  | { mode: 'launch'; app: string; args?: string[]; workingDirectory?: string }
  | { mode: 'attach'; identity?: string; processId?: number; windowHandle?: string; title?: string };
```

Only `launch` permits automatic termination. `attach` requires at least one identity; process id
and native window handle are exact, while identity and title are queries that must be rejected
when they match ambiguously. Cleanup resolves the exact process ids and ports recorded in the
run's `ownership.json`; it never kills by process name.

### Attach-mode window discovery

A Windows session can only be pinned to an already running application through
`appium:appTopLevelWindow`, which takes a native window handle, so an attach target that names the
application any other way is resolved before the session is created:

1. a throwaway root-desktop session enumerates the top-level windows;
2. the configured process id, identity, or title selects **exactly one** of them;
3. the handle, its title, and the owning process id are recorded as `external` resources; and
4. a `windowDiscovered` lifecycle event is emitted before the session is created.

An ambiguous match is a failure, never a first-match guess: attaching to the wrong window is how
an automated run interacts with something it does not own. An exact title match wins over a
substring match, and the resolved handle is normalized to the `0x`-prefixed hexadecimal form the
driver parses.

`appium:app` and `appium:appTopLevelWindow` are mutually exclusive — WinAppDriver rejects a
session carrying both with `Bad capabilities. Specify either app or appTopLevelWindow` — so the
root-desktop marker is dropped once the window is known.

macOS needs none of this: Mac2 attaches by bundle identifier.

## Standalone sessions

For Jest, Vitest, `node:test`, or a plain script:

```ts
import { remote } from 'webdriverio';
import { startDesktopDriver } from '@fluentui-react-native/desktop-driver/wdio';

const service = await startDesktopDriver(options);
const browser = await remote(service.webdriverOptions);

try {
  // The same WebdriverIO commands and page objects.
} finally {
  await browser.deleteSession();
  await service.stop();
}
```

## Storybook story tests

A story declares a test through the serializable `parameters.desktopTest`:

```ts
export const Default = {
  parameters: {
    desktopTest: {
      kind: 'inline',
      id: 'button-default',
      steps: [
        { action: 'expectVisible', target: { testId: 'button-default' } },
        { action: 'press', target: { testId: 'button-default' } },
        { action: 'expect', target: { testId: 'button-status' }, property: 'text', equals: 'Pressed' },
      ],
    },
  },
};
```

or links a colocated spec when it needs arbitrary TypeScript:

```ts
export const RichInteraction = {
  parameters: {
    desktopTest: { kind: 'spec', id: 'button-rich', spec: './button.desktop.spec.ts' },
  },
};
```

`desktop-driver stories generate` reads those parameters statically out of the story modules, so
generation needs no running application. It emits:

- `story-tests.manifest.json` — story id, `[story:<id>]` tag, resolved spec path, exact Mocha
  grep, and a digest of the executable content; and
- `story-plans.generated.spec.ts` — one tagged Mocha test per inline plan.

The inline plan schema is closed: only the listed actions exist, only a `testID` may address an
element, and a linked spec is a relative path resolved inside configured roots. Nothing in a plan
can express arbitrary JavaScript, and generation fails when a linked spec is missing its story
tag or when two stories claim the same plan id.

## Loopback test service

`desktop-driver serve` runs the loopback test service, the WebdriverIO run executor, and the
Storybook channel announcer as one owned host-side process. It lets an on-device Storybook UI
request a run without executing anything itself: it binds to `127.0.0.1`, mints a per-boot token,
validates every story id against the generated manifest, and permits one mutating run per
application session.

```sh
desktop-driver serve --manifest desktop-tests/generated/story-tests.manifest.json \
  --runner yarn --runner-arg wdio --runner-arg run --runner-arg wdio.conf.ts
```

The runner command line comes entirely from these options. A request contributes only a story id,
which is looked up in the generated manifest to obtain an already-known spec path and Mocha grep,
so nothing an application sends can reach `spawn`.

On Windows a bare `--runner` name is resolved to its `.cmd` launcher and run through an explicit
`cmd.exe /d /s /c` invocation with every argument quoted. Node refuses to `spawn` a batch launcher
directly, and `shell: true` would join the arguments unquoted, which breaks the first spec path
containing a space.

The runner inherits the service's environment, which is how the platform is selected: a config that
reads `DESKTOP_TEST_PLATFORM` sees whatever the service was started with. Start the service with
the platform set, or every on-device run silently executes against whatever the config defaults to.

**Discovery.** The service announces `{ url, token, protocolVersion, manifestDigest }` over the
Storybook channel the application is already connected to, using the channel server's existing
`send-event` endpoint, and re-broadcasts on an interval. Nothing is configured at build time. This
matters on React Native, where `process.env` carries only `NODE_ENV` and no other value is inlined
into the bundle, so a build-time endpoint cannot be read on device at all.

**What the token is and is not.** It stops a drive-by request from something that has not observed
an announcement. It is not a defence against a local attacker: the Storybook channel it is
announced over is itself unauthenticated on loopback. The controls that carry real weight are the
loopback binding, the manifest allowlist, one run per session, and never accepting a command line
from the application.

| Endpoint                   | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `GET /v1/health`           | Liveness and protocol version (unauthenticated)         |
| `GET /v1/stories`          | Tested story manifest                                   |
| `POST /v1/runs`            | Start a current-story, selected-story, or all-story run |
| `GET /v1/runs/:id`         | Structured status                                       |
| `GET /v1/runs/:id/events`  | Server-sent progress                                    |
| `POST /v1/runs/:id/cancel` | Cooperative cancellation                                |

## Artifacts

```text
artifacts/desktop-tests/<run-id>/
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

Screenshots, accessibility source, and logs routinely contain private content. Values under keys
such as `token`, `authorization`, `clipboard`, `value`, and `environment` are redacted before
anything reaches disk, every artifact path is confined to the run directory, and artifact
directories should stay ignored and be reviewed before sharing.

## CLI

```text
desktop-driver doctor              Backends, portable commands, and platform prerequisites
desktop-driver stories generate    Scan story modules and emit the manifest and generated spec
desktop-driver stories list        List the stories a running Storybook application reports
desktop-driver serve               Run the loopback test service for the on-device controls
desktop-driver start               Start an owned driver host and print its endpoint
desktop-driver version
```

Every command prints JSON.

## Platform extensions

`@fluentui-react-native/desktop-driver/macos` and `.../windows` expose the platform execute
methods. A spec that imports one is a platform spec and cannot satisfy shared-suite coverage; the
config factory rejects shared spec globs that name a platform. On Windows, `windows: powerShell`
and `windows: deleteFile` are disabled unless a caller opts in, because they turn a UI automation
session into general local code execution.

WebDriver screenshots do not reliably capture WinAppSDK Composition content. Use an OS-level
desktop capture when visual evidence matters on Windows.

## Prerequisites

**macOS** — macOS 11.3+, Xcode 13+ with Command Line Tools, Accessibility permission for Xcode
Helper, automation mode enabled, a logged-in GUI session, and a writable WebDriverAgentMac
derived-data cache. These are reported, not probed.

**Windows** — an interactive desktop session, an **unlocked** workstation, the application
installed or registered, and (for the `windows` backend) WinAppDriver plus Developer Mode.

A locked workstation is the failure mode worth knowing about: every read still works — the
accessibility tree, attributes, screenshots — while every click, key, and scroll is refused, so
interaction tests fail with opaque driver errors. `doctor` reports the prerequisite but cannot
probe it: no signal is readable from Node without a native call, and the obvious candidate
(`LogonUI.exe`) keeps running after an unlock. This is not incidental on Windows: a React Native
pressable publishes no UI Automation `InvokePattern`, so a click is always synthetic mouse input
and always needs a real interactive desktop.

`appium-windows-driver` locates WinAppDriver through the **`APPIUM_WAD_PATH`** environment
variable and then through `%ProgramFiles(x86)%\Windows Application Driver\WinAppDriver.exe`. No
other variable has any effect.

Run `desktop-driver doctor --platform <macos|windows>` to see what this machine actually has:
every prerequisite is reported with `ok`, `missing`, or `unknown`, and `unknown` always means the
probe could not run — never that the prerequisite is satisfied.

## Honest dependency notes

This package does not run the Appium CLI, the Appium extension manager, or the multi-driver
Appium router. It does reuse Appium code:

- `appium-mac2-driver` and `appium-windows-driver` are the platform backends;
- both peer-depend on Appium 3 and import from `appium/driver.js`, so `appium` is an optional
  backend dependency; and
- the current host uses Appium's `routeConfiguringFunction` and `server` helpers, which are a
  driver-author API, and whose convenience `server` export is marked deprecated for Appium 4.

Those imports are isolated in `src/driver-host/backends.ts` and only ever load inside the
driver-host child process, so replacing them with the local W3C route host in
`src/driver-host/w3c-server.ts` is a single-file change that no test notices. "No Appium CLI"
must never be shortened to "no Appium code".

The host child is spawned with loader registrations stripped from `NODE_OPTIONS`. A parent that
runs TypeScript sources — the WebdriverIO testrunner registers `tsx` this way to load
`wdio.conf.ts` — would otherwise push its transpiler hook into the host, where it rewrites module
resolution for the platform driver's dependency tree and breaks it. Other options are preserved.

Verified against `appium@3.2.0`, `appium-windows-driver@5.1.9`, `webdriverio@9.24.0`, and
WinAppDriver 1.2.1 on Windows 11 26200.

## Testing this package

```sh
yarn workspace @fluentui-react-native/desktop-driver build
yarn workspace @fluentui-react-native/desktop-driver test
yarn workspace @fluentui-react-native/desktop-driver lint
```

The `fake` backend is a deterministic in-process W3C endpoint plus a Storybook-compatible channel
surface. It exists so the service, commands, story controller, plan runner, and artifact pipeline
can be exercised anywhere — including where binding a loopback socket is not permitted, by
driving the same routes through `createRouteDispatcher`. It is a contract fake for this package's
own plumbing and is never a substitute for running the shared suite against a real backend.

Modules that resolve their own location from `import.meta.url` (`driver-host/client.ts`,
`driver-host/host-main.ts`, `cli/main.ts`) must stay out of the Jest module graph, because Jest
transpiles to CommonJS where `import.meta` does not parse. `wdio/service.ts` imports the
driver-host client dynamically for that reason.
