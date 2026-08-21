# Desktop test-driver usage

`@fluentui-react-native/desktop-driver` runs the same WebdriverIO tests against React Native Windows
and React Native macOS applications. It supports two ownership modes:

- **Launch mode** boots the configured application, runs the suite, and permits the driver to shut
  down only the application and processes it owns.
- **Attach mode** connects to an application that is already running and leaves it running when the
  suite finishes.

The package starts a loopback-only, single-driver WebDriver host. Tests use standard WebdriverIO
APIs plus a small portable layer for React Native `testID` selectors, Storybook navigation,
lifecycle, and artifacts. It does not start the Appium CLI or a multi-driver Appium server.

This guide covers:

1. [Booting an app, running its complete E2E suite, and shutting it down](#1-run-a-complete-e2e-suite-in-launch-mode)
2. [Navigating and testing every relevant Storybook component page](#2-end-to-end-test-every-relevant-storybook-page)
3. [Running all tests from inside a Storybook app](#3-run-all-tests-from-inside-storybook)
4. [Running tests for the current Storybook component page](#4-run-tests-for-the-current-storybook-page)
5. [Testing an already-running app without shutting it down](#5-test-an-already-running-app-without-shutting-it-down)

All five workflows are non-interactive and suitable for local development, CI, and coding-agent
workflows.

## Prerequisites

Use Node 20.19 or newer and WebdriverIO 9. The repository currently uses Yarn 4.

**macOS**

- macOS 11.3 or newer and Xcode 13 or newer
- Accessibility permission for Xcode Helper
- Automation mode enabled
- An interactive GUI session

**Windows**

- An interactive, unlocked desktop session
- The application installed or registered
- Developer Mode
- WinAppDriver for the `windows` backend
- `APPIUM_WAD_PATH` set when WinAppDriver is not in its default installation directory

Synthetic clicks do not work on a locked Windows workstation even though source, screenshots, and
element reads may continue to work.

Before a real run, inspect the machine-readable prerequisite report:

```sh
desktop-driver doctor --platform macos
desktop-driver doctor --platform windows
```

The command prints JSON and exits nonzero when it has warnings. An agent should parse the JSON and
treat `missing` as a blocker and `unknown` as something that still requires explicit verification.

## Integrate the package

### Dependencies

Add the driver, WebdriverIO runner, framework adapter, and reporter to the application or test
workspace:

```sh
yarn add --dev \
  @fluentui-react-native/desktop-driver \
  webdriverio \
  @wdio/cli \
  @wdio/local-runner \
  @wdio/mocha-framework \
  @wdio/spec-reporter \
  expect-webdriverio
```

The platform drivers are optional dependencies of the package. A consumer that manages optional
dependencies explicitly must make the backend needed by its job available:

- `appium`, `appium-mac2-driver` for macOS
- `appium`, `appium-windows-driver` for Windows

### Base WebdriverIO configuration

Create `wdio.conf.ts` in the application workspace:

```ts
import * as path from 'node:path';

import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopAppTarget, DesktopPlatform } from '@fluentui-react-native/desktop-driver';

const platform = process.env.DESKTOP_TEST_PLATFORM as DesktopPlatform;

if (!['macos', 'windows', 'fake'].includes(platform)) {
  throw new Error('Set DESKTOP_TEST_PLATFORM to macos, windows, or fake');
}

const target: DesktopAppTarget = process.env.DESKTOP_TEST_APP
  ? {
      mode: 'launch',
      app: process.env.DESKTOP_TEST_APP,
    }
  : platform === 'macos'
    ? {
        mode: 'attach',
        identity: process.env.DESKTOP_TEST_IDENTITY,
      }
    : {
        mode: 'attach',
        processId: process.env.DESKTOP_TEST_PID ? Number(process.env.DESKTOP_TEST_PID) : undefined,
        windowHandle: process.env.DESKTOP_TEST_WINDOW,
        title: process.env.DESKTOP_TEST_WINDOW_TITLE,
      };

export const config = createDesktopWdioConfig({
  platform,
  target,
  rootDir: process.cwd(),
  framework: 'mocha',
  sessionStrategy: 'suite',
  specs: ['./desktop-tests/**/*.spec.ts'],
  readiness: {
    requireWindow: true,
    timeout: 60_000,
  },
  artifactsDirectory: path.resolve('artifacts/desktop-tests'),
  reporters: ['spec'],
  logLevel: 'error',
});
```

Important configuration rules:

- Use `sessionStrategy: 'suite'` to run the ordered suite in one worker and one warm desktop
  session.
- `target.mode: 'launch'` is the only mode allowed to stop the app.
- macOS attach currently requires the bundle identifier in `identity`.
- Windows attach may use a process ID, native window handle, package/executable identity, or an
  unambiguous window title.
- Keep shared specs free of platform branches and platform-extension imports.
- Address React Native elements with `testID` through `byTestId()`.

### Write a portable test

```ts
import { byTestId } from '@fluentui-react-native/desktop-driver';

describe('Application smoke test', () => {
  it('submits the form', async () => {
    const submit = await $(byTestId('submit-button'));
    await expect(submit).toBeDisplayed();
    await expect(submit).toBeEnabled();

    await submit.click();

    const status = await $(byTestId('submit-status'));
    await expect(status).toHaveText('Submitted');
  });
});
```

Standard WebdriverIO element commands and `expect-webdriverio` assertions remain the primary API.
Use `browser.desktop` only for desktop-specific portable operations:

```ts
await browser.desktop.waitForAppState('ready');
await browser.desktop.isFocused(byTestId('submit-button'));
await browser.desktop.scrollIntoView(byTestId('offscreen-item'));
await browser.desktop.captureArtifacts('manual-diagnostic');
```

## 1. Run a complete E2E suite in launch mode

Use this mode when the test run must own the complete application lifecycle:

1. The driver host starts.
2. The configured application boots.
3. Readiness waits for a real application window and any additional configured gates.
4. All matching specs run in one warm session.
5. Assertion failures and infrastructure failures are printed by the `spec` reporter.
6. WebDriver session cleanup shuts down the app launched by that session.
7. The owned driver host and descendant processes are stopped with bounded cleanup.

Add scripts:

```json
{
  "scripts": {
    "desktop:e2e:macos": "cross-env DESKTOP_TEST_PLATFORM=macos wdio run wdio.conf.ts",
    "desktop:e2e:windows": "cross-env DESKTOP_TEST_PLATFORM=windows wdio run wdio.conf.ts"
  }
}
```

Run every configured test against a packaged app:

```sh
# macOS: .app path or bundle identifier accepted by Mac2
DESKTOP_TEST_APP=/absolute/path/MyApp.app yarn desktop:e2e:macos

# Windows: executable path, UWP application id, or other Windows Driver launch identity
DESKTOP_TEST_APP='Contoso.MyApp_abc123!App' yarn desktop:e2e:windows
```

Do not start the app separately in this workflow. Setting `DESKTOP_TEST_APP` is what gives the
driver ownership and permission to shut it down.

The `spec` reporter writes failures and stacks to stdout/stderr, and WebdriverIO exits nonzero when
the suite fails. Detailed artifacts are written under:

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

For an agent workflow, run the declared script synchronously, retain its exit code, and inspect
`run.json` plus `driver-host.log` when it fails. Do not infer success from the app closing; use the
runner exit code and report summary.

## 2. End-to-end test every relevant Storybook page

Storybook integration adds static test discovery and page navigation. A story opts into desktop
testing with either an inline serializable plan or a linked WebdriverIO spec.

### Declare tests on stories

Use an inline plan for common interactions:

```ts
export const Default = {
  parameters: {
    desktopTest: {
      kind: 'inline',
      id: 'button-default',
      steps: [
        { action: 'expectVisible', target: { testId: 'button-default' } },
        { action: 'expectEnabled', target: { testId: 'button-default' } },
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

Link a colocated spec when a story needs ordinary TypeScript, hooks, loops, or richer assertions:

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

The linked suite title must carry the exact story tag, and the suite must contain a runnable test:

```ts
import { byTestId, story } from '@fluentui-react-native/desktop-driver';

describe('[story:components-button--interaction] Button interaction', () => {
  before(async () => {
    await story.select('components-button--interaction');
  });

  it('responds to a press', async () => {
    await (await $(byTestId('button-interaction'))).click();
    await expect(await $(byTestId('button-status'))).toHaveText('Pressed');
  });
});
```

`story.select()` asks the Storybook channel server to navigate to the story and waits for
`storyRendered`. The generated inline-plan spec does this automatically. This is how one run
navigates through the tested component pages without platform-specific navigation code.

### Generate the executable manifest

```sh
desktop-driver stories generate \
  --story-root src \
  --spec-root src \
  --out desktop-tests/generated
```

Generation writes:

- `story-tests.manifest.json`
- `story-plans.generated.spec.ts`

Only stories that declare `parameters.desktopTest` enter the manifest. Generation fails rather
than silently passing when roots are missing, no tested stories exist, story IDs conflict, a linked
spec is missing, or a tagged suite has no runnable test. The manifest digest includes linked spec
contents and is verified again when loaded.

Add the generated inline spec and linked specs to the WDIO configuration:

```ts
export const config = createDesktopWdioConfig({
  platform,
  target,
  rootDir: process.cwd(),
  framework: 'mocha',
  sessionStrategy: 'suite',
  specs: [
    './desktop-tests/generated/story-plans.generated.spec.ts',
    './src/**/*.desktop.spec.ts',
  ],
  storyManifest: './desktop-tests/generated/story-tests.manifest.json',
  storybook: {
    host: '127.0.0.1',
    port: 7007,
    specRoots: [path.resolve('src')],
  },
  readiness: {
    requireWindow: true,
    requireStorybookChannel: true,
  },
  artifactsDirectory: path.resolve('artifacts/desktop-tests'),
  reporters: ['spec'],
});
```

The Storybook app must connect to a host-side channel server. Configure React Native Storybook with
websockets enabled and the same host and port:

```ts
const StorybookUI = view.getStorybookUI({
  enableWebsockets: true,
  host: '127.0.0.1',
  port: 7007,
  CustomUIComponent: YourStorybookUI,
});
```

Start the channel server through the Storybook application's declared script, then run the suite:

```sh
# Terminal or supervised process 1
yarn storybook-server

# Terminal or supervised process 2: launch and own the app
DESKTOP_TEST_APP=/absolute/path/MyStorybook.app \
  DESKTOP_TEST_PLATFORM=macos \
  yarn desktop:test
```

The same flow works on Windows with the Windows application identity. The suite navigates to every
tested story as its declared tests run, prints failures to the console, and shuts down the
driver-launched Storybook app at completion.

The repository implementation is a working reference:

- [`apps/storybook/wdio.conf.ts`](../../../apps/storybook/wdio.conf.ts)
- [`packages/agentic-components/src/components/button/button.stories.tsx`](../../agentic-components/src/components/button/button.stories.tsx)
- [`packages/agentic-components/src/components/button/button.desktop.spec.ts`](../../agentic-components/src/components/button/button.desktop.spec.ts)

## 3. Run all tests from inside Storybook

The app cannot safely run native automation inside its own process. Instead:

1. A host-side `desktop-driver serve` process owns the test runner.
2. It announces its loopback URL, token, protocol version, and manifest digest over the existing
   Storybook channel.
3. The app receives the announcement and renders a **Run all tests** control.
4. Pressing the control sends an allowlisted `mode: "all"` request.
5. The service runs the manifest's tests and returns structured progress.

### Host integration

Add scripts equivalent to:

```json
{
  "scripts": {
    "desktop:generate": "desktop-driver stories generate --story-root src --spec-root src --out desktop-tests/generated",
    "desktop:service": "desktop-driver serve --manifest desktop-tests/generated/story-tests.manifest.json --runner yarn --runner-arg wdio --runner-arg run --runner-arg wdio.conf.ts",
    "desktop:service:macos": "cross-env DESKTOP_TEST_PLATFORM=macos yarn desktop:service",
    "desktop:service:windows": "cross-env DESKTOP_TEST_PLATFORM=windows yarn desktop:service"
  }
}
```

For in-app runs, the WDIO target must be **attach mode**. The app is already running and initiated
the request, so setting `DESKTOP_TEST_APP` here would incorrectly create a second owned app.

Start the channel server, app, and service as separately supervised processes:

```sh
yarn desktop:generate
yarn storybook-server
yarn desktop:service:macos
```

Use `desktop:service:windows` on Windows. Always select the platform explicitly; a service inherits
its environment, and an omitted platform may run a configured fake backend instead of the app.

### App integration

In the Storybook app:

1. Subscribe to the `desktopTestServiceAnnounce` Storybook channel event.
2. Validate `protocolVersion`, `url`, `token`, and `manifestDigest`.
3. Check `GET <url>/v1/health`.
4. Send an authenticated request to `POST <url>/v1/runs`:

```json
{
  "protocolVersion": 1,
  "mode": "all"
}
```

5. Poll `GET <url>/v1/runs/<run-id>` or subscribe to
   `GET <url>/v1/runs/<run-id>/events`.
6. Render or log the returned `state`, `results`, and error messages.

The per-boot token is announced at runtime; do not compile it into the app, commit it, or print it
in durable logs.

The host process forwards WebdriverIO stdout/stderr to its own console. To inspect results in the
React Native debugger, log the structured run status received by the app:

```ts
useEffect(() => {
  if (status) {
    console.info('[desktop tests]', status.state, status.results);
  }
}, [status]);
```

For a debuggable custom Node host, use the programmatic API and place a breakpoint or logger in
`onOutput`:

```ts
import { startDesktopTestServer } from '@fluentui-react-native/desktop-driver/storybook';

const server = await startDesktopTestServer({
  manifestPath: 'desktop-tests/generated/story-tests.manifest.json',
  runner: {
    command: 'yarn',
    args: ['wdio', 'run', 'wdio.conf.ts'],
    cwd: process.cwd(),
  },
  onOutput: (chunk) => {
    console.log(chunk);
  },
});
```

The repository's app-side reference is:

- [`apps/storybook/src/useDesktopTestService.ts`](../../../apps/storybook/src/useDesktopTestService.ts)
- [`apps/storybook/src/DesktopTestControls.tsx`](../../../apps/storybook/src/DesktopTestControls.tsx)
- [`apps/storybook/src/StorybookApp.tsx`](../../../apps/storybook/src/StorybookApp.tsx)

### Agent workflow

An agent can start the declared channel-server and service scripts, wait for their readiness
messages, and then either:

- activate the `desktop-test-run-all` control by `testID`; or
- send the same allowlisted HTTP request after obtaining the current service announcement.

The agent should wait for a terminal run state (`passed`, `failed`, `cancelled`, or `error`) and
inspect both the structured results and host process output. A successful HTTP `202` means the run
started; it does not mean the tests passed.

## 4. Run tests for the current Storybook page

Track the currently rendered story from Storybook's `storyRendered` channel event. Enable **Run
current test** only when:

- a service announcement has been received;
- `/v1/health` succeeds; and
- the current story ID appears in `GET /v1/stories`.

Start a page-specific run with:

```json
{
  "protocolVersion": 1,
  "mode": "selected",
  "storyIds": ["components-button--interaction"]
}
```

The service looks up the story ID in the generated manifest. It never accepts a module path, test
file, grep expression, or command line from the app. The host-side executor converts the selected
story into the known spec path and exact `[story:<id>]` grep.

In practice:

```sh
yarn desktop:generate
yarn storybook-server
yarn desktop:service:windows
```

Navigate to a tested component story and press **Run current test**. The repository control exposes
the stable `testID` `desktop-test-run-current`, so an agent can activate the same workflow through
native automation. Progress is available in the UI, service console, status endpoint, and events
stream.

For a host-initiated one-page run without using the on-device control, set the exact generated grep:

```sh
DESKTOP_TEST_PLATFORM=windows \
DESKTOP_TEST_GREP='\[story:components-button--interaction\]' \
wdio run wdio.conf.ts \
  --spec packages/agentic-components/src/components/button/button.desktop.spec.ts
```

Prefer a declared workspace script around this command in CI or agent automation so the working
directory, environment, and runner version remain stable.

## 5. Test an already-running app without shutting it down

Use attach mode by omitting `DESKTOP_TEST_APP`.

**Windows**

From PowerShell, select the target and invoke the declared platform script:

```powershell
# Exact PID
$env:DESKTOP_TEST_PID = '12345'
yarn desktop:e2e:windows

# Or use an unambiguous window title
Remove-Item Env:DESKTOP_TEST_PID
$env:DESKTOP_TEST_WINDOW_TITLE = 'Agentic Components Storybook'
yarn desktop:e2e:windows
```

The equivalent environment settings for a POSIX-compatible shell are:

```sh
# Exact PID
DESKTOP_TEST_PLATFORM=windows \
DESKTOP_TEST_PID=12345 \
wdio run wdio.conf.ts

# Exact native window handle
DESKTOP_TEST_PLATFORM=windows \
DESKTOP_TEST_WINDOW=0x501e2 \
wdio run wdio.conf.ts

# Unambiguous window title
DESKTOP_TEST_PLATFORM=windows \
DESKTOP_TEST_WINDOW_TITLE='Agentic Components Storybook' \
wdio run wdio.conf.ts
```

**macOS**

```sh
DESKTOP_TEST_PLATFORM=macos \
DESKTOP_TEST_IDENTITY=com.contoso.MyApp \
wdio run wdio.conf.ts
```

Attach-mode capability and platform termination APIs fail closed:

- conflicting ownership/routing capability overrides are rejected;
- an ambiguous Windows window match fails instead of selecting the first result;
- macOS requires an identity-pinned target; and
- application termination methods require positively observed self ownership.

At completion the driver session and driver host are cleaned up, but the external app and window
remain running.

To run only a chosen set, use ordinary WDIO spec selection and framework filtering:

```sh
DESKTOP_TEST_PLATFORM=windows \
DESKTOP_TEST_WINDOW_TITLE='MyApp' \
wdio run wdio.conf.ts \
  --spec desktop-tests/auth.spec.ts \
  --spec desktop-tests/settings.spec.ts
```

For Storybook, use the generated exact story grep as shown in the previous section.

An agent should verify attach safety behaviorally after the run: confirm the original PID/window is
still alive, and inspect `ownership.json` to ensure it is recorded as `external`. Never clean up by
process name; stop only processes whose exact PIDs were created and recorded by the agent's own
workflow.

## Console output, debugger output, and artifacts

Choose output surfaces based on the workflow:

| Surface | Use |
| ------- | --- |
| WDIO `spec` reporter | Immediate pass/fail details and stacks in a terminal or CI log |
| `desktop-driver serve` stdout/stderr | Host-side output for in-app Storybook runs |
| Run status JSON | App UI, React Native debugger, agents, and custom dashboards |
| SSE events endpoint | Streaming in-app or agent progress |
| `run.json` | Complete machine-readable run result |
| `junit.xml` | CI test reporting |
| `events.ndjson` | Lifecycle and infrastructure diagnosis |
| Per-test source and screenshots | Native UI failure diagnosis |

Screenshots and accessibility source can contain private content. Keep artifact directories ignored,
review them before sharing, and never publish the service token.

## Recommended agent protocol

For deterministic agent execution:

1. Run `desktop-driver doctor --platform <platform>` and parse its JSON.
2. Generate Storybook tests when applicable and record the manifest digest.
3. Start long-lived channel, Metro, app, and service processes through declared scripts.
4. Verify each process is ready before starting the next dependent step.
5. Select launch or attach mode explicitly; never infer ownership from whether an app happens to
   be running.
6. Run the declared WDIO or service workflow and wait for its terminal state.
7. Treat a nonzero runner exit, `failed`, `error`, or `infrastructureError` result as failure.
8. Preserve console output and inspect `run.json`, `events.ndjson`, and `driver-host.log`.
9. In attach mode, confirm the original app remains alive.
10. Stop only exact PIDs owned by the workflow; never kill by process name.

See [README.md](./README.md) for the package overview and [DESIGN.md](./DESIGN.md) for the portable
command matrix, ownership contract, architecture, and security details.
