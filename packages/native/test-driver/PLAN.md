# `@fluentui-react-native/desktop-driver`

> Status: proposed
>
> Research snapshot: 2026-08-18
>
> Initial consumer: `apps/storybook`
>
> Target platforms: React Native Windows and React Native macOS

## 1. Executive recommendation

Build a public desktop-testing package around one standard WebDriver contract
and WebdriverIO's normal test-authoring model. A shared `*.spec.ts` file must run
unchanged against Windows and macOS; platform selection belongs in
configuration and driver startup, not in test logic.

- Make the WebdriverIO testrunner the primary integration. Use its first-class
  Mocha adapter by default, while allowing Jasmine and Cucumber through standard
  WebdriverIO configuration. Do not require Jest.
- Expose normal WebdriverIO `browser`, element, expectation, hook, reporter, and
  page-object patterns to test authors. Add only a small portable helper layer
  for React Native selectors, Storybook selection, lifecycle, and artifacts.
- On macOS, reuse
  [`appium-mac2-driver`](https://github.com/appium/appium-mac2-driver), which
  already presents XCTest and WebDriverAgentMac through W3C WebDriver.
- On Windows, initially reuse
  [`appium-windows-driver`](https://github.com/appium/appium-windows-driver) as
  the compatibility layer over WinAppDriver. Evaluate
  [`appium-novawindows-driver`](https://github.com/AutomateThePlanet/appium-novawindows-driver)
  in Phase 0 because WinAppDriver is closed source and no longer actively
  maintained.
- Host each driver behind an owned, loopback-only, single-driver WebDriver
  process. First prove the driver-author hosting primitives exported through
  `appium/driver.js` and `@appium/base-driver`; do not launch the Appium CLI or
  multi-driver router in the preferred architecture.
- Treat the driver packages and their Appium base classes as internal backend
  dependencies. Test authors must not install drivers globally, run `appium`,
  use Appium client APIs, or inherit this repository's Appium E2E harness.
- Keep a fallback decision explicit: if the embedding API is too unstable,
  either maintain a narrow W3C host around the driver command contract or use a
  pinned Appium core process strictly as a private transport bridge. The latter
  requires an explicit decision because it weakens the "no Appium runtime"
  boundary.
- Keep [`agent-device`](https://github.com/callstack/agent-device) as an
  optional agent/exploration integration, not the deterministic execution
  backend. It has no Windows backend and does not expose a local W3C WebDriver
  endpoint.
- Run Storybook tests in a host-side test service. The on-device UI sends
  allowlisted run requests and receives progress; it never executes the runner
  or native automation code itself.

This architecture uses the common protocol and test ecosystem as the
portability boundary. Platform-native capability differences remain isolated
in configuration, services, and optional platform-specific suites rather than
leaking into shared tests.

## 2. Confirmed goals and constraints

### Goals

1. Author each deterministic test once and run the same source unchanged on
   React Native Windows and React Native macOS.
2. Use standard WebdriverIO test, hook, assertion, page-object, and reporter
   patterns rather than inventing a required custom test framework.
3. Support WebdriverIO's Mocha, Jasmine, and Cucumber adapters, with Mocha as
   the documented default.
4. Let any runner use a standalone WebdriverIO session when consumers need
   Jest, Vitest, `node:test`, or another framework.
5. Let a React Native story declare or link an end-to-end test.
6. Let the on-device Storybook UI run the current story's test or all story
   tests.
7. Launch an app or attach to an existing app without confusing ownership.
8. Observe readiness, normal exit, crash, timeout, and requested shutdown.
9. Provide portable selectors, interactions, waits, source trees, screenshots,
   logs, recordings where available, and structured artifacts.
10. Support deterministic CI and optional exploratory agent workflows without
    splitting the deterministic cross-platform suite.
11. Publish the package for consumers outside this repository.

### Confirmed constraints

- Appium is not the test-authoring API, runner, public product model, or source
  architecture. Reusing individual Appium driver implementations and their
  driver-author support packages is allowed.
- The implementation must be a clean analysis, not a refactoring of
  `apps/E2E`.
- Cross-platform shared tests take precedence over preserving either backend's
  native object model.
- Jest is optional, not required.
- WebdriverIO is the common client and primary runner integration.
- The first product integration is the agentic-components Storybook app.
- Tests and tools must not terminate app, server, or driver processes they do
  not own.

### Non-goals for the first release

- Mobile Android or iOS automation.
- Browser or React Native Web testing.
- Visual-diff approval infrastructure.
- Distributed device-farm scheduling.
- Arbitrary shell execution through an agent or MCP endpoint.
- Full XPath parity across platforms.
- A new general-purpose or multi-driver W3C WebDriver server.
- Replacing Storybook's unit-test portable stories or web test runner.
- Guaranteeing that platform-specific escape-hatch tests are portable.

## 3. Success criteria

The first public release is complete when all of the following are true:

1. The same `*.spec.ts` file, with no platform branch or platform-specific
   import, passes against the same sample story on Windows and macOS.
2. The shared test uses normal WebdriverIO `browser`, `$`, element,
   `expect-webdriverio`, and Mocha APIs.
3. `testID` resolves through the accessibility-ID strategy to the intended
   native element on both platforms.
4. The portable command subset can wait for, inspect, click, inspect focus,
   clear/set values, read, scroll, capture source, and take a screenshot on
   both platforms.
5. Launch mode records and shuts down only the process it launched.
6. Attach mode leaves the externally launched app running after the test.
7. Unexpected app termination fails the active test with process, endpoint,
   driver, and app diagnostics.
8. The Storybook "Run current test" action runs only the selected story test
   and renders pass/fail output.
9. The Storybook "Run all tests" action selects each tested story, waits for
   render completion, executes its test, and reports a summary.
10. CLI, WebdriverIO runner, and standalone-session runs emit the same
    normalized events and artifact manifest.
11. The preferred backend starts no Appium CLI or multi-driver Appium server.
    Any Appium driver/base packages are pinned, isolated, and absent from the
    test-authoring API. If Phase 0 proves that a private Appium core host is the
    only viable route, this criterion requires explicit owner revision before
    implementation or release; the fallback does not silently satisfy it.
12. A clean external consumer can install the package, run one platform job,
    and understand every native prerequisite without global driver setup.
13. Public API, portable command subset, platform extensions, troubleshooting,
    and compatibility ranges are documented.

## 4. Research findings

### 4.1 WebdriverIO as the portable authoring layer

**Observed**

- WebdriverIO's testrunner has first-class Mocha, Jasmine, and Cucumber
  framework adapters. It does not have a first-class Jest adapter.
- Its standard configuration accepts protocol, host, port, path, capabilities,
  specs, hooks, services, and reporters independently of the server
  implementation.
- Its standalone `remote()` API can create the same kind of session from Jest,
  Vitest, `node:test`, scripts, or a custom Storybook service.
- A capabilities array can run the same specs against multiple endpoints.
  Normal cross-platform CI should instead use two OS jobs that point the same
  spec glob at the local platform capability.
- `@wdio/appium-service` only spawns the Appium CLI. It is not appropriate for
  the preferred backend; a custom desktop-driver service should own the
  single-driver host.
- The published WebdriverIO version inspected during this research was 9.31.1.

**Decision**

Use WebdriverIO's runner, session, element, expectation, hook, service, and
reporter contracts directly. The package defines and tests a portable subset;
it does not wrap every WebdriverIO command in a competing API.

### 4.2 Reusing Appium drivers without adopting Appium as the product

Appium separates driver implementations from its CLI and multi-driver router.
The target driver packages subclass `BaseDriver` and implement WebDriver
commands. The `appium` package's `driver.js` export is a thin re-export of
`@appium/base-driver`.

Appium's own `fake-driver` package demonstrates a single-driver host:

```ts
import { routeConfiguringFunction, server } from 'appium/driver.js';
import { Mac2Driver } from 'appium-mac2-driver';

const driver = new Mac2Driver({});
const host = await server({
  hostname: '127.0.0.1',
  port,
  routeConfiguringFunction: routeConfiguringFunction(driver),
});
```

This starts a W3C HTTP endpoint for one driver instance. It does not invoke the
Appium CLI, extension manager, or multi-driver `AppiumDriver` router.
WebdriverIO only sees the configured WebDriver endpoint.

Important boundaries:

- `appium-mac2-driver` and `appium-windows-driver` currently peer-depend on
  Appium 3 and import from `appium/driver.js`; installing the driver packages
  therefore still brings Appium packages into the backend dependency graph.
- The single-driver server pattern is public and used by Appium's own reference
  driver and tests, but embedding it is a driver-author API, not a documented
  stable host-application contract.
- The current `@appium/base-driver` source marks its convenience `server`
  export as deprecated for Appium 4. The exact Appium 4 replacement is not yet
  documented.
- A product package must not claim to be Appium-free merely because it does not
  run the CLI. Dependency manifests, notices, versions, and process topology
  must be explicit.

**Preferred Phase 0 order**

1. Prove the minimal single-driver host with exact pinned versions.
2. Isolate it in a private backend package and child process.
3. Test whether the route host can be replaced by a small maintained adapter
   without importing unsupported internals.
4. If neither route is supportable, evaluate a pinned private Appium core host
   as a fallback and require an explicit architecture decision before adopting
   it.

| Hosting option                       | Appium CLI/router | Benefit                                                              | Primary risk                                                                           | Disposition                           |
| ------------------------------------ | ----------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| Base-driver single-driver host       | No                | Smallest path that reuses both driver classes and their command maps | Embedding contract is not stable and the convenience server is deprecated for Appium 4 | **Preferred Phase 0 prototype**       |
| Maintained desktop-driver route host | No                | Product owns lifecycle and compatibility boundary                    | Must track W3C routes, driver command maps, and upstream changes                       | Preferred product fallback if bounded |
| Private Appium core host             | Yes, internally   | Uses the drivers through their best-supported loader                 | Adds the runtime explicitly excluded from the preferred design                         | Decision-gated fallback only          |
| Direct endpoint access               | No                | Fewest Node layers                                                   | WinAppDriver loses compatibility shims; WebDriverAgentMac lifecycle still needs Mac2   | Diagnostic spike, not default         |

### 4.3 macOS: Mac2 Driver

**Observed at `appium-mac2-driver` 4.2.0**

- `Mac2Driver` extends Appium `BaseDriver` and exposes a W3C WebDriver session.
- It builds and starts its bundled WebDriverAgentMac Xcode project, then proxies
  most commands to that XCTest-based HTTP service.
- Standard commands include session lifecycle, source, screenshot, element
  lookup and interaction, timeouts, and window rect.
- Locator strategies include accessibility ID, name, XPath, class name,
  predicate string, and class chain.
- macOS-specific execute commands add click variants, hover, drag, keys,
  scrolling, app launch/activate/terminate/state, source formats, multi-display
  screenshots, screen recording, clipboard, alerts, and optional AppleScript.
- Capabilities cover `bundleId`, `appPath`, arguments, environment, reset/kill
  behavior, bring-your-own WebDriverAgentMac URL, host/port, startup timeout,
  locale, and time zone.
- Its own functional tests connect with WebdriverIO `remote()`, which directly
  validates the desired client/driver pairing.

Host prerequisites remain significant: macOS 11.3 or newer, Xcode 13 or newer,
Command Line Tools, Xcode Helper accessibility permission, and automation-mode
setup on current macOS releases. Phase 0 must prove these on clean developer
and CI machines and determine how WebDriverAgentMac build products are cached.

### 4.4 Windows: Windows Driver, WinAppDriver, and NovaWindows

**Observed at `appium-windows-driver` 6.1.1**

- `WindowsDriver` extends Appium `BaseDriver` and acts as a compatibility proxy
  to the separate WinAppDriver executable.
- It owns WinAppDriver startup by default or accepts `wadUrl` for an externally
  owned endpoint.
- Capabilities cover executable or UWP launch, root-desktop sessions,
  `appTopLevelWindow` attachment, arguments, working directory, startup waits,
  force-quit behavior, and endpoint selection.
- It compensates for WinAppDriver protocol gaps, including W3C element/window
  rect commands and screenshot base64 padding.
- It adds app lifecycle, recording, clipboard, file transfer, context, gesture,
  and optional PowerShell commands.

Direct WebdriverIO-to-WinAppDriver is possible and has fewer processes, but it
loses those compatibility shims. The initial spike should therefore retain
`WindowsDriver` unless measurements show that the extra layer is unnecessary.

WinAppDriver itself is closed source and its upstream repository has not been
actively maintained for years. The current Windows Driver documentation points
to NovaWindows Driver as a modern alternative. NovaWindows removes the
WinAppDriver and Developer Mode prerequisites and currently uses a PowerShell
UI Automation backend, with a .NET backend on its roadmap. It fits the same
single-driver hosting shape but needs independent compatibility, performance,
and reliability evidence.

`@react-native-windows/automation` remains useful prior art:

- it proves WebdriverIO-to-WinAppDriver and root-session attachment;
- it maps `testID` through WebdriverIO accessibility-ID selectors;
- it demonstrates ownership-safe attach with `rootLaunchApp: false`; and
- it identifies RNW-specific diagnostics and window-discovery needs.

It should not define the new runner architecture because it is Jest-specific
and currently pins WebdriverIO 6. Reuse or upstream focused RNW helpers rather
than copying its environment wholesale.

### 4.5 Cross-platform React Native selector and command parity

React Native maps the same `testID` concept to each platform's native
automation identifier:

- React Native Windows Fabric exposes `testID` through UI Automation's
  `AutomationId`; and
- React Native macOS exposes it through the native accessibility identifier.

Both target drivers support the WebDriver `accessibility id` locator strategy,
and WebdriverIO's shorthand is the same:

```ts
const button = await $('~button-default');
await button.click();
```

This is the strongest existing portability seam. Shared specs should prefer:

1. accessibility ID from `testID`;
2. accessible name plus role through package helpers where both trees prove
   equivalent;
3. visible text only when semantics require it.

XPath, class name, predicate strings, class chains, coordinates, AppleScript,
PowerShell, and platform execute commands are extension APIs. They are allowed
only in explicitly platform-specific specs.

The Phase 0 parity suite must exercise the same WebdriverIO calls for element
existence, display, enablement, click, focus-state inspection, clear/set value,
text/value read, selected state, scrolling, source, screenshot, and wait
behavior. A command enters the portable subset only after both backends pass
the same contract test.

### 4.6 What `agent-device` provides

**Observed at version 0.20.10**

| Area                | Current capability                                                                                                                            | Relevance                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Interfaces          | CLI, typed Node API, and stdio MCP tools share one command implementation                                                                     | Reference the parity principle for optional integration                |
| Session model       | Named and default sessions, worktree-scoped defaults, state directories, per-session logs, serialized mutation guidance                       | Strong model for parallel agents and artifact ownership                |
| macOS app surface   | XCUITest runner for app snapshots, selectors, click/press, focus, type/fill, scroll/gestures, alerts, and app screenshots                     | Complementary exploration capability                                   |
| macOS host surfaces | Swift `AXUIElement` helper for frontmost app, desktop, and menu bar; app discovery/open/quit; permissions; coordinate press/read; screenshots | Useful for lifecycle discovery and agent exploration                   |
| Selectors           | Accessibility snapshots, semantic selectors, transient refs, ref generations, and snapshot diffs                                              | Adopt the durable-selector lessons, not the runtime                    |
| Evidence            | Screenshots, recordings, logs, events, performance data, request logs, and bounded/redacted timelines depending on platform                   | Align the artifact schema where practical                              |
| Deterministic runs  | `.ad` recording/replay, serial suite runner, retries, JUnit, divergence details, ranked selector suggestions, and resumable unchanged plans   | Optional interoperability; shared WebdriverIO specs remain primary     |
| Agent support       | Token-efficient output, structured MCP results, no generic shell tool, and the inspect-act-verify workflow                                    | Directly relevant to agent workflows                                   |
| Security            | Loopback-only daemon, per-boot token, state-file permissions, path-safe artifacts, and explicit sensitive-artifact guidance                   | Use as a minimum bar                                                   |
| Packaging           | Node 22.12+, MIT; source checkouts build a Swift 5.9/macOS 13 helper lazily                                                                   | Compatible with this repository, but distribution needs a release gate |

Important boundaries:

- `agent-device` does not currently support Windows.
- Its macOS `appstate` result reflects tracked session state; it is not a live
  launch/termination event stream.
- App-surface automation and host-surface automation have different native
  backends and capability depth.
- Its documentation says a production distribution should provide a stable
  signed/notarized helper so macOS trust and TCC grants bind to a durable code
  signature.
- Its built-in replay runner is valuable for agent-authored flows, but using it
  as the primary runner would replace the required shared WebdriverIO suite.

**Recommended integration**

1. Do not use `agent-device` as either platform backend for the deterministic
   suite. Translating its session/ref grammar into WebDriver only on macOS would
   undermine write-once behavior.
2. Keep it optional for agent-led discovery, accessibility inspection,
   evidence capture, and `.ad` replay outside the portable suite.
3. If interoperability is added, depend only on public exports, pin the
   reviewed version, and keep its session/artifact state separate from the
   WebDriver host.
4. Do not make `agent-device` or its MCP server a dependency of normal
   WebdriverIO test execution.

### 4.7 Storybook and test execution

**Observed**

- Storybook for React Native supports CSF stories, serializable parameters,
  on-device addons, a WebSocket channel, and portable stories for external
  unit tests.
- Portable stories compose React Native stories into Jest plus React Native
  Testing Library tests. They do not drive the installed native desktop app.
- Storybook's test runner is Jest plus Playwright and is explicitly web-based;
  it does not drive the React Native on-device UI directly.
- Storybook's MCP package currently exposes documentation and story metadata
  tools (`list-all-documentation`, `get-documentation`, and
  `get-documentation-for-story`). It does not run native tests.
- The first consumer already has a Storybook channel server that can select a
  story and wait for its rendered event. Reuse that product integration point,
  but keep the driver package independent of that app.
- The first consumer also has a Windows-only Jest smoke harness using
  `@react-native-windows/automation`, direct WinAppDriver startup, and the
  Storybook controller. It is migration evidence, not the new architecture.
  The new service must use separate ports and commands until it reaches parity,
  then replace rather than run permanently alongside that harness.

**Inferred**

- Native story tests must execute in a host Node/WebdriverIO process.
- The on-device button needs a small authenticated loopback test service.
- Story test metadata crossing the device/host boundary must be serializable.
- Full spec functions should live in colocated host-side test files, not be
  imported into the React Native bundle.

## 5. Architecture decisions

### D1. Portability boundary

The shared test contract is a documented subset of standard WebdriverIO:

- `browser`, `$`, and `$$`;
- accessibility-ID selectors;
- element existence, display, enabled, selected, focused, text, value, click,
  clear, and set-value operations;
- WebdriverIO waits and `expect-webdriverio` matchers;
- screenshots and page source;
- standard hooks, page objects, retries, and reporters; and
- package helpers for Storybook selection, app state, and failure artifacts.

Do not build a second element/session API for ordinary deterministic tests.
Platform-specific execute methods remain available through explicit backend
exports, but a test that imports them is not a shared test.

### D2. Runner

Use the WebdriverIO testrunner with Mocha as the default documented framework.
Jasmine and Cucumber are supported through their normal adapters. Standalone
sessions allow other test frameworks without making them package-level
requirements.

Default to one instance. Permit parallelism only when each worker has an
isolated app, WebDriver endpoint, ports, Storybook channel, and artifact
directory. `maxInstances: 1` alone is not sufficient because WebdriverIO
normally creates a worker and session per spec file. The desktop config defaults
to a suite-session strategy that groups shared specs into one ordered spec
array, preserving one warm worker/session. Consumers may opt into per-spec
sessions only when startup cost and isolation requirements justify it.

### D3. Driver host

A desktop-driver WebdriverIO service owns a loopback-only child process that
hosts exactly one selected platform driver. It allocates ports, waits for
health, captures logs, publishes normalized endpoint metadata, and tears down
only processes it started.

Driver classes and Appium base-driver types never cross this process boundary.
Test code receives an ordinary WebdriverIO session.

### D4. Session ownership

Every session target is explicitly one of:

```ts
type DesktopAppTarget =
  | { mode: 'launch'; app: string; args?: string[]; workingDirectory?: string }
  | {
      mode: 'attach';
      identity?: string;
      processId?: number;
      windowHandle?: string;
      title?: string;
    };
```

Only `mode: 'launch'` permits automatic app termination. Driver and helper
processes have the same ownership rule. Validation requires at least one attach
identity and rejects ambiguous matches. PID and native window handle take
precedence over package/bundle identity, which takes precedence over title.

### D5. Selector policy

Selector priority:

1. `testID` / native automation identifier;
2. role plus accessible name;
3. accessible name;
4. visible text as an explicit fallback;
5. platform-specific selector through an opt-in escape hatch.

XPath and layout-order selectors are not portable API. Coordinate actions are
evidence/debug fallbacks, not preferred deterministic tests.

### D6. Capability and extension policy

The package publishes a versioned portable-command matrix backed by contract
tests. `browser.desktop.getSessionInfo()` reports portable and platform
extension support at runtime. A missing portable capability is an
infrastructure failure, not a silent skip.

Platform extensions live under `macos` and `windows` namespaces and require
platform-specific spec naming. Shared spec globs reject those imports.

### D7. Story tests

Support two complementary forms:

1. **Inline serializable plan** in `parameters.desktopTest` for simple story
   smoke and interaction tests.
2. **Colocated WebdriverIO spec** registered against a stable story ID for
   arbitrary TypeScript logic.

Do not serialize or evaluate arbitrary JavaScript received from the app.

### D8. MCP

MCP is useful as an agent entry point, not as the internal protocol. Implement
it after the service and CLI stabilize. Default to stdio. Any HTTP transport
must bind to loopback and require a per-run token.

## 6. Proposed package surfaces

### 6.1 WebdriverIO config and service

The primary consumer surface is a config factory and WebdriverIO service:

```ts
import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';

export const config = createDesktopWdioConfig({
  platform: process.env.DESKTOP_TEST_PLATFORM,
  specs: ['./desktop-tests/**/*.spec.ts'],
  framework: 'mocha',
  sessionStrategy: 'suite',
  target: process.env.DESKTOP_TEST_ATTACH
    ? { mode: 'attach', title: process.env.DESKTOP_TEST_WINDOW_TITLE }
    : { mode: 'launch', app: process.env.DESKTOP_TEST_APP },
  artifactsDirectory: './artifacts/desktop-tests',
});
```

The factory:

1. validates the portable config;
2. selects one platform backend;
3. generates internal namespaced driver capabilities;
4. registers the desktop-driver launcher and worker services;
5. groups resolved specs into one worker/session by default and configures
   serial execution unless isolation is explicit;
6. adds `browser.desktop` lifecycle, capability, Storybook, and artifact
   commands without replacing standard WebdriverIO commands; and
7. composes user hooks and reporters rather than overwriting them.

The generated backend capabilities remain internal, for example:

```ts
// macOS
{
  platformName: 'mac',
  'appium:automationName': 'Mac2',
  'appium:bundleId': resolvedBundleId,
  'appium:skipAppKill': target.mode === 'attach',
}

// Windows
{
  platformName: 'Windows',
  'appium:automationName': selectedWindowsDriver,
  'appium:app': resolvedAppOrRoot,
  'appium:appTopLevelWindow': resolvedWindowHandle,
}
```

The `appium:` capability prefix is required by the reused W3C driver
implementations; it does not imply that tests use an Appium client or that the
Appium CLI is running.

The augmentation remains intentionally narrow:

```ts
interface DesktopBrowserCommands {
  getSessionInfo(): Promise<DesktopSessionInfo>;
  waitForAppState(state: DesktopAppState, options?: WaitOptions): Promise<void>;
  captureArtifacts(reason: string): Promise<ArtifactManifest>;
  selectStory(storyId: string): Promise<void>;
  waitForStory(storyId: string): Promise<void>;
}
```

Element lookup, interaction, state, waits, screenshots, and source continue to
use standard WebdriverIO APIs.

Consumers may use plain WebdriverIO config instead of the factory by
registering the exported service and platform capability adapter directly.

### 6.2 Shared spec authoring

One ordinary spec runs on both platforms:

```ts
import { byTestId, story } from '@fluentui-react-native/desktop-driver';

describe('[story:components-button--default] Button default story', () => {
  before(async () => {
    await story.select('components-button--default');
  });

  it('invokes onPress', async () => {
    const button = await $(byTestId('button-default'));
    await expect(button).toBeDisplayed();
    await button.click();

    const status = await $(byTestId('button-status'));
    await expect(status).toHaveText('Pressed');
  });
});
```

`byTestId(id)` returns the WebDriver accessibility-ID selector `~${id}`. The
helper exists to encode policy and escaping, not to hide WebdriverIO.

Shared specs:

- contain no platform branch;
- import no platform extension;
- use only the documented portable command matrix;
- run from the same path in Windows and macOS jobs; and
- use standard framework discovery, hooks, assertions, retries, and page
  objects.

### 6.3 Standalone sessions and optional runners

The package also exposes owned service lifecycle for scripts and other test
frameworks:

```ts
import { remote } from 'webdriverio';
import { startDesktopDriver } from '@fluentui-react-native/desktop-driver/wdio';

const service = await startDesktopDriver(options);
const browser = await remote(service.webdriverOptions);

try {
  // Use the same WebdriverIO commands and shared page objects.
} finally {
  await browser.deleteSession();
  await service.stop();
}
```

Recipes may integrate this with Jest, Vitest, or `node:test`. Those integrations
must not introduce a different test API, backend contract, or required peer
dependency.

### 6.4 Inline story plan

```ts
export const Default = {
  args: {},
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

Arbitrary TypeScript uses a static link in the story metadata:

```ts
export const RichInteraction = {
  parameters: {
    desktopTest: {
      kind: 'spec',
      id: 'button-rich-interaction',
      spec: './Button.desktop.spec.ts',
    },
  },
};
```

The schema must be JSON-serializable, versioned, validated on both sides, and
limited to driver operations or a relative spec link. The generator resolves
spec paths within configured test roots, rejects traversal and duplicates, and
emits an exact spec path plus an escaped `[story:<story-id>]` grep for every
story. It compiles inline plans into a generated host-side WebdriverIO spec with
one tagged Mocha test per story. Colocated specs use ordinary `describe`/`it`
patterns and put the derived stable tag in the suite title. A discovery-only
Mocha pass fails generation when a linked spec or test tag cannot be found.

## 7. Platform implementation

### 7.1 Single-driver host

Implement one small child-process host shared by both backend packages:

1. accept a validated backend ID and an allowlisted configuration file;
2. bind only to `127.0.0.1` on an allocated port;
3. construct exactly one driver class;
4. configure the W3C routes for that instance;
5. expose health and protocol-version metadata outside the WebDriver route;
6. stream structured stdout/stderr and driver events to the parent service;
7. reject arbitrary module names, insecure features, and non-loopback hosts;
8. support cooperative session deletion and bounded forced cleanup; and
9. exit when its owning parent disappears.

The first prototype may use the current base-driver `server` and
`routeConfiguringFunction`. The product boundary must isolate those imports so
an Appium 4 migration or a maintained local route host does not affect tests.

### 7.2 Windows backend

Implement the first Windows backend by constructing `WindowsDriver` inside the
single-driver host.

Required work:

1. map portable launch config to `app`, arguments, working directory, and
   startup-wait capabilities;
2. map attach config to a root session followed by PID/native-window-handle
   discovery and `appTopLevelWindow`;
3. record ownership for the driver host, WinAppDriver endpoint, app process,
   native window, and any root-discovery session;
4. preserve Windows Driver's W3C rect and screenshot compatibility shims;
5. capture Windows Driver and WinAppDriver stdout/stderr;
6. monitor launched and attached app processes independently from the
   WebDriver session;
7. validate accessibility-ID, action, wait, source, and screenshot parity;
8. test whether Composition content requires a Windows Graphics Capture
   fallback;
9. keep PowerShell and arbitrary file-transfer features disabled by default;
10. reuse focused RNW window-discovery or automation-channel helpers only when
    they preserve the common WebdriverIO contract; and
11. run the same backend contract against NovaWindows Driver before committing
    to WinAppDriver for the published compatibility range.

### 7.3 macOS backend

Implement the macOS backend by constructing `Mac2Driver` inside the same host.

Required work:

1. map portable launch config to `bundleId` or `appPath`, arguments,
   environment, and startup-timeout capabilities;
2. prove attach-without-relaunch semantics for an existing Storybook process,
   including the exact `noReset` and `skipAppKill` behavior;
3. record ownership for the driver host, WebDriverAgentMac/xcodebuild process,
   app process, and app window;
4. cache WebDriverAgentMac build products safely across serial runs;
5. capture driver, xcodebuild, and WebDriverAgentMac logs;
6. validate accessibility-ID, action, wait, source, and screenshot parity;
7. expose macOS execute methods only from the platform extension;
8. monitor app lifecycle independently when `queryAppState` cannot distinguish
   exit, crash, and monitor failure;
9. validate cancellation and bounded teardown of blocked XCTest commands; and
10. document Xcode, Accessibility, automation-mode, signing, and GUI-session
    prerequisites with a clean-machine doctor command.

Using an externally started WebDriverAgentMac through
`webDriverAgentMacUrl` may improve warm-run performance, but the service must
retain explicit ownership and compatibility checks.

## 8. App lifecycle and readiness

Use a common state machine:

```text
created -> starting|attaching -> connected -> ready -> stopping -> stopped
                                      |          |
                                      +-> exited +-> crashed
                                      +-> timed_out
```

Required events:

- `launchRequested`;
- `driverHostStarted`;
- `processStarted`;
- `windowDiscovered`;
- `webDriverSessionCreated`;
- `ready`;
- `exitObserved`;
- `crashObserved`;
- `shutdownRequested`;
- `shutdownCompleted`;
- `monitorError`.

Readiness is configurable and may require:

1. process exists;
2. top-level window exists;
3. WebDriver session responds;
4. optional Storybook channel is connected;
5. optional selector is visible; and
6. optional application health callback succeeds.

Every event includes timestamp, session ID, platform, ownership, PID when
known, and a bounded diagnostic payload. Exit classification must distinguish
normal exit, requested shutdown, crash/nonzero exit, lost process, and monitor
failure.

A persisted session manifest records every owned PID and port. Cleanup resolves
those exact resources; it never kills by process name.

## 9. Storybook integration

### 9.1 Components

1. **Story test manifest generator**

   Reads story metadata during Storybook generation and emits stable story ID,
   tags, and one executable spec/grep entry. Inline plans compile into a
   generated WebdriverIO spec; linked specs resolve from the static metadata
   described in Section 6.4.

2. **Story controller**

   Lists stories, selects a story, updates args, and waits for the matching
   rendered event.

3. **Desktop test service**

   Owns the test queue, WebdriverIO runner child process, app/session
   attachment, progress events, cancellation, and artifact paths.

4. **On-device controls**

   A small Storybook addon or host component renders Run current, Run all,
   Cancel, and latest result.

### 9.2 Service protocol

Minimum loopback API:

| Endpoint                   | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `GET /v1/health`           | Liveness and protocol version                         |
| `GET /v1/stories`          | Tested story manifest                                 |
| `POST /v1/runs`            | Start current-story, selected-story, or all-story run |
| `GET /v1/runs/:id`         | Current structured status                             |
| `GET /v1/runs/:id/events`  | Server-sent progress events                           |
| `POST /v1/runs/:id/cancel` | Cooperative cancellation                              |

The service binds to `127.0.0.1`, generates a random token per boot, validates
origin/protocol versions, permits one mutating run per app session, and never
accepts arbitrary command lines or module paths from the app.

### 9.3 Run current

1. App sends the current story ID.
2. Service validates that the ID exists in the generated manifest.
3. Service attaches to the already running app.
4. The service selects the single allowlisted spec and exact Mocha grep from
   the generated manifest; inline and colocated tests use this same path.
5. Test confirms or reselects the story and waits for render completion.
6. Events and final result stream back to the app.
7. Attach ownership leaves the Storybook app running.

### 9.4 Run all

1. Service starts one warm platform session.
2. The generated config groups all manifest specs, including the generated
   inline-plan spec, into one ordered WebdriverIO worker/session.
3. Before each story test, the story controller selects the story and waits for
   its exact rendered event.
4. Tests run serially by default.
5. Failures capture page source, screenshot, lifecycle state, and relevant
   logs.
6. The run continues or bails according to explicit configuration.
7. A summary groups pass, fail, skipped, flaky, and infrastructure error.

## 10. Agent workflows and MCP

### 10.1 CLI first

Provide auditable JSON-capable commands:

```text
desktop-driver doctor
desktop-driver start
desktop-driver status
desktop-driver stories list
desktop-driver test story <story-id>
desktop-driver test all
desktop-driver source
desktop-driver click --test-id <id>
desktop-driver screenshot --out <path>
desktop-driver stop
```

All commands call the same service, lifecycle, Storybook, and artifact handlers
used by the WebdriverIO integration.

### 10.2 MCP usefulness

MCP is useful for discovery and coarse agent actions:

- list tested stories;
- run one or all story tests;
- inspect run status and failures;
- inspect current accessibility source;
- perform a bounded interaction;
- capture evidence; and
- stop a session owned by the caller.

It is not needed for WebdriverIO execution, Storybook-to-host communication, or
platform driver transport.

Implement stdio MCP tools after Phase 4. Each tool must have a typed input and
structured output, return command failures as tool errors, and call the shared
command layer. Do not expose a shell tool.

The existing Storybook MCP endpoint remains useful for component and story
documentation. Initially keep documentation MCP and desktop-test MCP separate.
Later, if one endpoint materially improves clients, compose the Storybook docs
tools and desktop-driver tools in a single `tmcp` server without coupling the
driver core to Storybook.

### 10.3 `agent-device` interoperability

Adopt these patterns:

- inspect -> act -> verify;
- semantic source snapshots before screenshots;
- transient refs plus durable selectors;
- per-worktree or explicitly named sessions;
- serialized mutations;
- bounded/redacted event timelines;
- one handler set projected to Node, CLI, and MCP; and
- replay divergence with fresh state and ranked selector suggestions.

Optional post-MVP integration:

- export simple inline story plans to `.ad`;
- invoke `agent-device` replay for agent-authored macOS exploratory flows;
- attach desktop-driver artifact metadata to an `agent-device` session; and
- investigate an upstream Windows provider only if `agent-device` publishes a
  supported external platform-plugin contract.

## 11. Results, artifacts, and reporting

Each run writes:

```text
artifacts/desktop-tests/<run-id>/
  run.json
  events.ndjson
  junit.xml
  tests/<test-id>/
    result.json
    source.xml
    screenshot.png
    webdriver.log
    driver-host.log
    native-driver.log
    app.log
```

`run.json` includes protocol version, package version, platform, app target,
ownership, capabilities, story IDs, test results, timings, and relative
artifact paths. It must not contain access tokens, arbitrary environment
variables, clipboard contents, or typed text values.

Reporters consume structured run events. Initial reporters:

- concise terminal;
- JSON;
- JUnit; and
- Storybook event stream.

Screenshots, logs, and accessibility source may contain private content.
Documentation must require ignored artifact directories and review before
sharing.

## 12. Package and dependency design

Proposed exports:

```text
@fluentui-react-native/desktop-driver
@fluentui-react-native/desktop-driver/wdio
@fluentui-react-native/desktop-driver/storybook
@fluentui-react-native/desktop-driver/cli
@fluentui-react-native/desktop-driver/mcp
@fluentui-react-native/desktop-driver/windows
@fluentui-react-native/desktop-driver/macos
```

Guidelines:

- Main export contains portable selectors, Storybook helpers, shared types, and
  WebdriverIO type augmentation.
- The WebdriverIO subpath contains the config factory, launcher/worker service,
  standalone host lifecycle, hooks, and reporters.
- Platform packages are loaded lazily after platform selection.
- WebdriverIO 9 and the selected framework adapter are peer dependencies.
- `appium-mac2-driver`, `appium-windows-driver` or NovaWindows Driver, Appium 3,
  and compatible base-driver packages are exact-pinned optional backend
  dependencies until their embedding contract stabilizes.
- Backend dependencies are isolated by OS and loaded only in the driver-host
  child process.
- No global Appium or driver installation is required, and no package script
  invokes the Appium CLI in the preferred path.
- `@react-native-windows/automation` is optional prior art or a source of
  focused helpers, not the session runtime.
- `agent-device` is not a core or platform dependency. Optional interoperability
  belongs in a separate integration.
- Storybook dependencies live only under the Storybook subpath.
- MCP dependencies live only under the MCP subpath.
- No React Native platform fork is imported by the neutral TypeScript graph.
- Public exports are explicit; no wildcard barrel exports.
- Native executables and Xcode build products have explicit ownership, version,
  OS/CPU, path, and integrity validation.
- Package notices document all reused driver and server components accurately;
  "no Appium CLI" must not be shortened to "no Appium code."

## 13. Implementation phases

### Phase 0: feasibility spikes and decisions

Deliver disposable or isolated prototypes, not product abstractions.

1. Host `Mac2Driver` with the minimal single-driver route server and connect
   through WebdriverIO without starting the Appium CLI.
2. Host `WindowsDriver` the same way and prove its managed WinAppDriver path.
3. Run one shared Mocha spec against both endpoints using the same
   accessibility-ID selector and standard element commands.
4. Verify clean-lockfile dependency resolution, exact version pins, licenses,
   process topology, and the base-driver server deprecation boundary.
5. Prototype a maintained fallback route host or document the private Appium
   core fallback cost; do not silently select the fallback.
6. Compare Windows Driver plus WinAppDriver with NovaWindows Driver using the
   same spec and startup/command timing set.
7. Prove Windows and macOS launch, attach-without-relaunch, ownership, crash
   detection, cancellation, and cleanup.
8. Validate macOS Xcode, Accessibility, automation-mode, WDA build-cache, and CI
   prerequisites on a clean machine.
9. Compare Windows WebDriver screenshots with Windows Graphics Capture for
   Composition content.
10. Prove Storybook current-story extraction, runner filtering, loopback run
    request, and result streaming.

Exit criteria:

- the exact same spec source passes the portable command matrix on both
  platforms;
- no Appium CLI or multi-driver router process is started;
- all Appium-derived runtime packages are enumerated honestly;
- the single-driver host API is either accepted with a version/migration policy
  or replaced by a bounded maintained host;
- Mac2 attach and clean-machine prerequisites are proven;
- Windows Driver versus NovaWindows is decided from evidence; and
- every remaining success criterion is assigned to a bounded later phase.

### Phase 1: contracts and in-memory core

1. Define portable config, app target, capability matrix, lifecycle, error,
   artifact, story-plan, and run-result schemas.
2. Implement schema versioning and JSON validation.
3. Implement driver-host and app-process ownership state machines.
4. Implement the launcher/worker service against a fake W3C endpoint.
5. Implement capability mapping, cancellation, timeout, hook composition, and
   artifact events.
6. Unit test normal, crash, timeout, cancellation, partial startup, and cleanup
   behavior.

Exit criteria: the WebdriverIO runner can drive the fake endpoint through the
desktop service and emit the final artifact schema without platform code.

### Phase 2: platform backends

1. Productize the isolated single-driver host.
2. Implement and validate the Mac2 backend.
3. Implement the selected Windows backend.
4. Add platform doctor checks, capability output, and backend log capture.
5. Add platform contract jobs that run the exact same shared WebdriverIO suite.

Exit criteria: the same spec digest and test IDs pass on Windows and macOS.

### Phase 3: WebdriverIO integration and CLI

1. Implement the config factory and launcher/worker service.
2. Register portable `browser.desktop` commands and type augmentation.
3. Implement failure artifacts through standard WebdriverIO hooks.
4. Implement standalone service lifecycle for optional external runners.
5. Implement CLI commands and JSON output.
6. Implement terminal, JSON, JUnit, and Storybook event reporters.
7. Add shared-spec, page-object, Mocha, Jasmine, Cucumber, and standalone
   examples.

Exit criteria: package consumers can run a normal WebdriverIO config or
standalone session without Storybook-specific code or global driver setup.

### Phase 4: Storybook integration

1. Implement story plan schema and manifest generation.
2. Implement reusable story controller.
3. Implement authenticated loopback test service.
4. Implement current/all/cancel controls and result UI.
5. Convert representative agentic-component stories to inline and colocated
   tests.
6. Migrate the existing Windows-only Jest smoke tests, then retire their direct
   WinAppDriver/session startup after parity. Before retirement, commands and
   ports are mutually exclusive and ownership manifests prevent collisions.
7. Add service and protocol compatibility tests.

Exit criteria: the Storybook app runs current and all story tests on both
platforms while remaining open.

### Phase 5: agent integration and MCP

1. Add token-efficient source and result formatting.
2. Add stdio MCP tools over the shared service handlers.
3. Add session scoping and mutation serialization.
4. Add optional `.ad` interoperability.
5. Document agent safety, evidence handling, and recovery.

Exit criteria: an MCP client and the CLI produce equivalent structured results
for the same story test.

### Phase 6: hardening and publication

1. Validate Windows and macOS CI, including clean-machine prerequisites.
2. Stabilize Mac2/WebDriverAgentMac build caching and prerequisite diagnostics.
3. Add compatibility tests for supported RNW, RN macOS, WebdriverIO, Mac2,
   Windows/Nova driver, WinAppDriver where selected, and Storybook versions.
4. Add package publishing metadata, changeset, migration guidance, and sample
   external consumer.
5. Run dependency/license/security review.
6. Publish a prerelease, gather first-consumer data, then stabilize the API.

## 14. Validation strategy

### Unit

- config and namespaced-capability mapping;
- selector policy and accessibility-ID escaping;
- host route, health, version, and security configuration;
- hook and reporter composition;
- timeout and cancellation;
- lifecycle state transitions;
- ownership-safe cleanup;
- artifact path and redaction rules;
- story plan schema and manifest conflicts;
- service-handler parity across WebdriverIO, standalone, CLI, and MCP; and
- protocol version negotiation.

### Contract

Run one unchanged WebdriverIO suite against fake, Windows, and macOS endpoints:

- find by test ID;
- role/name lookup;
- click/focus-state/clear/set-value/read;
- visible/enabled/selected state;
- scroll and wait;
- screenshot and page source;
- expected app exit;
- unexpected exit;
- attach cleanup; and
- launch cleanup.

### Integration

- Storybook select/render handshake;
- current-story filtering;
- all-story sequencing;
- service authentication and cancellation;
- WebdriverIO primary failure plus cleanup failure;
- warm-session reuse;
- occupied port and stale session recovery; and
- artifact generation after app or driver crash.

### Portability gate

- Both platform jobs consume the same shared spec manifest and record its SHA
  in `run.json`.
- CI compares spec SHA, test IDs, and portable command-matrix version before
  accepting the pair of results.
- Shared spec globs reject platform extension imports, `.windows`/`.macos`
  modules, `process.platform`, and platform-name conditionals.
- A portable command is added only with one contract assertion that passes
  unchanged on both platforms.
- Platform-specific suites remain separate and cannot satisfy shared-suite
  coverage requirements.

### CI

- Windows: dedicated GUI-capable runner with RNW prerequisites and the
  Phase 0-selected WinAppDriver or NovaWindows backend.
- macOS: dedicated logged-in GUI runner initially; evaluate hosted runners only
  after XCUITest, permissions, helper identity, and screen capture are proven.
- Keep platform jobs serial until isolated multi-session support is measured.
- Upload artifacts on failure and JUnit on every run.

## 15. Risks and mitigations

| Risk                                                | Impact                                   | Mitigation                                                                                               |
| --------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Base-driver single-host API is removed in Appium 4  | backend cannot upgrade                   | exact pins, isolated host boundary, maintained route-host spike, explicit private-core fallback decision |
| Driver packages require Appium 3 peer imports       | larger or misleading dependency boundary | backend-only optional dependencies, accurate notices, no CLI invocation, dependency compatibility tests  |
| Mac2/Xcode/WDA startup is slow                      | poor run-all UX                          | WDA build cache, one warm host/session, measured budgets                                                 |
| macOS Accessibility or automation-mode setup drifts | developer and CI failures                | doctor command, clean-machine CI, versioned prerequisites                                                |
| WinAppDriver remains unmaintained                   | Windows compatibility and security risk  | compare NovaWindows in Phase 0; pin and isolate WinAppDriver if retained                                 |
| NovaWindows is not mature enough                    | incomplete or slow Windows backend       | run identical parity and performance suite; retain evidence-based fallback                               |
| Driver protocol behavior differs                    | shared specs become flaky or branched    | conservative portable matrix and identical cross-platform contract suite                                 |
| Windows title attachment selects wrong window       | destructive or flaky tests               | PID/handle-first target resolution and ownership manifest                                                |
| WebDriver screenshot misses Composition content     | invalid visual evidence                  | OS-level Windows capture fallback and explicit capability result                                         |
| Storybook app requests arbitrary execution          | local code execution risk                | versioned allowlisted plans, generated manifest, token, loopback, no arbitrary paths                     |
| Inline plan becomes too limited                     | duplicated tests                         | companion WebdriverIO specs are first-class; keep inline DSL intentionally small                         |
| Portable subset collapses real platform differences | misleading portability                   | versioned matrix, runtime capabilities, explicit platform suites                                         |
| Parallel tests fight over one desktop               | nondeterminism                           | serial default; require isolated app/ports/artifacts before enabling workers                             |
| Cleanup hides the original failure                  | poor diagnostics                         | preserve primary failure and append structured cleanup failures                                          |
| Agent tools expose sensitive evidence               | data leak                                | local-only defaults, redacted event log, bounded output, artifact guidance                               |

## 16. Open decisions resolved by Phase 0

Status recorded from a Windows 11 (26200) machine on 2026-08-19, running Node
24.15, Yarn 4.18, `appium@3.2.0`, `appium-windows-driver@5.1.9`,
`webdriverio@9.24.0`, WinAppDriver 1.2.1, and React Native Windows 0.81.32.
Anything not marked **Resolved** is still open, and macOS was not reachable from
that machine.

1. **Resolved.** The base-driver `server` plus `routeConfiguringFunction` host is
   acceptable behind the isolated adapter. `startAppiumHostedDriver` constructs
   `WindowsDriver` inside the child host, serves real W3C sessions on loopback,
   and spawns and reaps WinAppDriver. The imports stay confined to
   `src/driver-host/backends.ts`, and `src/driver-host/w3c-server.ts` remains the
   maintained fallback.
2. **Open.** WinAppDriver plus Windows Driver is proven for session creation,
   attach-by-window-handle, element lookup by accessibility id, state and text
   reads, source, and screenshots. NovaWindows has still never been constructed;
   `appium-novawindows-driver` is not installed. Note that WinAppDriver 1.2.1 is
   distributed only as an MSI, and 1.2.99 only as per-architecture installers.
3. **Open.** Mac2 attach and WDA ownership are unchanged and unverified.
4. **Resolved for Windows.** Version 1 of the portable matrix holds, with two
   implementations corrected by measurement: `isFocused` reads the backend focus
   attribute (`HasKeyboardFocus`) because WinAppDriver implements no
   active-element route at all, and `scrollIntoView` is a no-op when the element
   is already displayed and otherwise sends a real wheel delta. One portability
   limit is now documented rather than assumed: `getText` returns an element's
   own accessible name, which is empty for a React Native pressable whose label
   lives in a child `Text`.
5. **Open.** A WinAppDriver screenshot of the Storybook window returned a PNG at
   exactly the window's size with varied content, which argues against needing a
   Windows Graphics Capture fallback — but the only capture obtained was taken
   while the workstation was locked, so it cannot yet be trusted as evidence
   about Composition content. Repeat it on an unlocked session before deciding.
6. **Resolved.** Static extraction of `parameters.desktopTest` is sufficient; no
   Storybook plugin is required. The manifest digest is byte-identical to the
   value produced on macOS, so the portability gate works as designed.
7. **Partly resolved.** Measured on Windows: driver-host start plus attach-window
   discovery took 5.5 s; enumerating 16 top-level windows cost about 5 s, nearly
   all of it inside a single WinAppDriver XPath query; the six-test shared suite
   ran in 51 s wall clock against the live app. No macOS numbers yet.
8. **Partly resolved.** The versions listed above are the first verified set for
   Windows. macOS ranges are still unverified.

### 16.1 Environment findings that belong in the contract

- `appium:app` and `appium:appTopLevelWindow` are mutually exclusive.
  WinAppDriver rejects a session that carries both with `Bad capabilities.
Specify either app or appTopLevelWindow`, which makes attach a strict two-step
  operation: discover through a root session, then create the real session with
  the handle alone.
- The driver host must not inherit loader registrations from `NODE_OPTIONS`. The
  WebdriverIO testrunner registers `tsx` there to load `wdio.conf.ts`, and that
  hook breaks module resolution inside the platform driver's dependency tree.
- A locked workstation is the most confusing failure mode available: reads all
  succeed while every click, key, and scroll is refused, and WinAppDriver's own
  click can report success while doing nothing. `doctor` now detects it.
- A WinAppDriver session negotiates as JSONWireProtocol (`isW3C === false`) while
  Mac2 is W3C. Pinning `browserName: ''` still makes WebdriverIO resolve the same
  command implementations, which is what the portable set depends on.

## 17. Research sources

### Primary upstream sources

- [`@react-native-windows/automation` README](https://github.com/microsoft/react-native-windows/blob/main/packages/%40react-native-windows/automation/README.md)
- [`AutomationEnvironment` source](https://github.com/microsoft/react-native-windows/blob/main/packages/%40react-native-windows/automation/src/AutomationEnvironment.ts)
- [`AutomationClient` source](https://github.com/microsoft/react-native-windows/blob/main/packages/%40react-native-windows/automation/src/AutomationClient.ts)
- [React Native Windows Fabric automation provider](https://github.com/microsoft/react-native-windows/blob/main/vnext/Microsoft.ReactNative/Fabric/Composition/CompositionDynamicAutomationProvider.cpp)
- [WebdriverIO setup types](https://webdriver.io/docs/setuptypes/)
- [WebdriverIO framework adapters](https://webdriver.io/docs/frameworks/)
- [WebdriverIO configuration](https://webdriver.io/docs/configuration/)
- [WebdriverIO suite organization and grouped specs](https://webdriver.io/docs/organizingsuites/)
- [WebdriverIO multiremote and capability matrices](https://webdriver.io/docs/multiremote/)
- [Appium driver architecture](https://appium.io/docs/en/latest/intro/drivers/)
- [Appium driver-author guide](https://appium.io/docs/en/latest/developing/build-drivers/)
- [Appium base-driver server implementation](https://github.com/appium/appium/blob/master/packages/base-driver/lib/express/server.ts)
- [Appium base-driver protocol routing](https://github.com/appium/appium/blob/master/packages/base-driver/lib/protocol/protocol.ts)
- [Appium fake-driver single-driver host](https://github.com/appium/appium/blob/master/packages/fake-driver/lib/server.ts)
- [Appium Mac2 Driver](https://github.com/appium/appium-mac2-driver)
- [Mac2 Driver source](https://github.com/appium/appium-mac2-driver/blob/master/lib/driver.ts)
- [Mac2 WebDriverAgentMac launcher](https://github.com/appium/appium-mac2-driver/blob/master/lib/wda-mac.ts)
- [Appium Windows Driver](https://github.com/appium/appium-windows-driver)
- [Windows Driver compatibility commands](https://github.com/appium/appium-windows-driver/blob/master/lib/commands/general.ts)
- [WinAppDriver documentation](https://github.com/microsoft/WinAppDriver)
- [WinAppDriver supported APIs](https://github.com/microsoft/WinAppDriver/blob/master/Docs/SupportedAPIs.md)
- [WinAppDriver FAQ and source-status note](https://github.com/microsoft/WinAppDriver/blob/master/Docs/FAQ.md)
- [NovaWindows Driver](https://github.com/AutomateThePlanet/appium-novawindows-driver)
- [`agent-device` README](https://github.com/callstack/agent-device)
- [`agent-device` Node client](https://github.com/callstack/agent-device/blob/main/src/agent-device-client.ts)
- [`agent-device` macOS helper](https://github.com/callstack/agent-device/tree/main/apple/macos-helper)
- [`agent-device` macOS/XCTest interactor](https://github.com/callstack/agent-device/blob/main/src/platforms/apple/interactor.ts)
- [`agent-device` sessions](https://oss.callstack.com/agent-device/docs/sessions)
- [`agent-device` replay and E2E](https://oss.callstack.com/agent-device/docs/replay-e2e)
- [`agent-device` security and trust](https://oss.callstack.com/agent-device/docs/security-trust)
- [Storybook for React Native](https://github.com/storybookjs/react-native)
- [React Native portable stories](https://github.com/storybookjs/react-native/blob/next/PORTABLE_STORIES.md)
- [Storybook test runner](https://github.com/storybookjs/test-runner)
- [Storybook MCP](https://github.com/storybookjs/mcp/tree/main/packages/mcp)
- [Apple XCUIAutomation](https://developer.apple.com/documentation/xcuiautomation)
- [Apple Accessibility](https://developer.apple.com/documentation/applicationservices/axuielement)
- [Apple ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit)

### First-consumer context

- [`apps/storybook/README.md`](../../../apps/storybook/README.md)
- [`apps/storybook/storybook-server.cjs`](../../../apps/storybook/storybook-server.cjs)
- [`apps/storybook/scripts/storybook-control.cjs`](../../../apps/storybook/scripts/storybook-control.cjs)
- [`apps/storybook/jest.windows.config.cjs`](../../../apps/storybook/jest.windows.config.cjs)
- [`apps/storybook/windows-tests/storybook-smoke.test.cjs`](../../../apps/storybook/windows-tests/storybook-smoke.test.cjs)
- [`apps/storybook/scripts/start-windows-agent-session.ps1`](../../../apps/storybook/scripts/start-windows-agent-session.ps1)

These Storybook files establish integration and migration context only. The
existing Windows smoke harness and legacy repository E2E harness were
intentionally not used as the architecture model.
