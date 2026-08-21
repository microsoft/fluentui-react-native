# Desktop driver design

This document describes the implemented architecture and the constraints that future changes must
preserve. See [README.md](./README.md) for the package overview,
[USAGE.md](./USAGE.md) for integration examples, and
[NEXT-STEPS.md](./NEXT-STEPS.md) for unfinished work and open decisions.

## Goals and boundaries

`@fluentui-react-native/desktop-driver` provides one deterministic test-authoring model for React
Native Windows and React Native macOS:

- one shared `*.spec.ts` source runs unchanged on both platforms;
- tests use standard WebdriverIO sessions, elements, expectations, hooks, page objects, and
  reporters;
- platform selection, native driver startup, and capability mapping stay outside shared tests;
- applications may be launched or safely attached to without confusing resource ownership;
- Storybook stories can declare serializable tests or link ordinary WebdriverIO specs;
- command-line, WebdriverIO, standalone, and Storybook service runs use the same lifecycle and
  artifact contracts; and
- deterministic suites remain usable from non-interactive agent workflows.

The package intentionally does not:

- automate Android, iOS, browsers, or React Native Web;
- replace Storybook portable stories or its web test runner;
- provide visual-diff approval infrastructure or device-farm scheduling;
- expose arbitrary shell execution through Storybook or an agent endpoint;
- guarantee that platform extension tests are portable; or
- introduce a second element/session API for ordinary tests.

## Architecture

```text
WebdriverIO runner or standalone client
                |
                | W3C WebDriver over loopback
                v
       owned single-driver host
          /                 \
   Mac2Driver          WindowsDriver
       |                    |
WebDriverAgentMac      WinAppDriver
                |
                v
       React Native application
```

The primary integration is `createDesktopWdioConfig()`. It:

1. validates the portable configuration;
2. selects one platform backend;
3. builds protected backend capabilities;
4. registers launcher and worker services;
5. groups specs into one warm worker/session by default;
6. adds the narrow `browser.desktop` command set; and
7. composes consumer hooks, services, framework options, and reporters.

The driver host is a child process that binds to loopback, constructs exactly one native driver,
publishes health metadata, and owns its logs and cleanup. Driver classes and Appium base-driver
types do not cross that process boundary. WebdriverIO sees an ordinary WebDriver endpoint.

The package does not run the Appium CLI, extension manager, or multi-driver router. It does reuse
`appium-mac2-driver` and `appium-windows-driver`; those packages peer-depend on Appium 3 and import
driver-author support from `appium/driver.js`. The hosting imports are isolated in
`src/driver-host/backends.ts`, with `src/driver-host/w3c-server.ts` retaining a product-owned route
host boundary for future migration.

### Public surfaces

| Export                                              | Responsibility                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `@fluentui-react-native/desktop-driver`             | Portable selectors, Storybook helper, plans, lifecycle and result types |
| `@fluentui-react-native/desktop-driver/wdio`        | Config factory, WebdriverIO services, standalone driver lifecycle       |
| `@fluentui-react-native/desktop-driver/storybook`   | Manifest generation, channel controller, loopback run service           |
| `@fluentui-react-native/desktop-driver/cli`         | JSON command-line interface                                             |
| `@fluentui-react-native/desktop-driver/macos`       | Explicit macOS-only execute extensions                                  |
| `@fluentui-react-native/desktop-driver/windows`     | Explicit Windows-only execute extensions                                |
| `@fluentui-react-native/desktop-driver/driver-host` | Internal host integration contract                                      |

Platform backend dependencies are loaded only after platform selection and only in the driver-host
process. The neutral package graph imports no React Native platform fork.

## Portability contract

### Test source

A shared spec:

- contains no platform branch;
- imports no platform extension;
- uses only the documented portable command set;
- runs from the same path in Windows and macOS jobs; and
- uses normal framework discovery, hooks, assertions, retries, and page objects.

Shared-spec globs are expanded before validation and reject platform-named files. Platform-specific
escape hatches belong in separately named suites and do not satisfy shared coverage.

### Selectors

React Native maps `testID` to UI Automation `AutomationId` on Windows and the native accessibility
identifier on macOS. Both native drivers expose it through the W3C accessibility-ID strategy.

Selector priority is:

1. `testID` through `byTestId()`;
2. role plus accessible name;
3. accessible name;
4. visible text as an explicit fallback; and
5. platform-specific selectors through an extension subpath.

`byTestId()` rejects identifiers that WebdriverIO would reinterpret as another selector strategy.
XPath, predicate strings, class chains, layout order, and coordinates are not portable API.

`getText()` reads the element's own accessible name. On React Native Windows, a `Pressable` whose
label exists only in child `Text` may expose an empty name. Tests should assert text on the element
that owns it or give the control an explicit `accessibilityLabel`.

### Commands

The versioned portable matrix is reported by `browser.desktop.getSessionInfo()`. A missing portable
capability is an infrastructure error, not a skip.

| Command                                     | Surface              |
| ------------------------------------------- | -------------------- |
| `findElement`, `findElements`, `isExisting` | Standard WebdriverIO |
| `isDisplayed`, `isEnabled`, `isSelected`    | Standard WebdriverIO |
| `click`, `clearValue`, `setValue`           | Standard WebdriverIO |
| `getText`, `getValue`                       | Standard WebdriverIO |
| `waitForDisplayed`, `waitForExist`          | Standard WebdriverIO |
| `getPageSource`, `takeScreenshot`           | Standard WebdriverIO |
| `isFocused`, `scrollIntoView`               | `browser.desktop`    |

Native desktop drivers cannot execute the DOM scripts that WebdriverIO's browser implementations of
focus and scrolling use:

- `isFocused()` reads `HasKeyboardFocus` on Windows and `focused` on macOS, falling back to the W3C
  active-element route only when a backend supports it.
- `scrollIntoView()` returns when the element is already displayed; otherwise it sends a native
  wheel delta and verifies the result.

Generated capabilities pin `browserName: ''` so WebdriverIO selects the same native command
implementations for both backends. WinAppDriver negotiates as JSONWireProtocol while Mac2 is W3C;
the portability boundary is therefore the tested WebdriverIO behavior, not wire-level equivalence.

The package adds only these browser commands:

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

Every application target is explicit:

```ts
type DesktopAppTarget =
  | {
      mode: 'launch';
      app: string;
      args?: readonly string[];
      workingDirectory?: string;
      environment?: Readonly<Record<string, string>>;
    }
  | {
      mode: 'attach';
      identity?: string;
      processId?: number;
      windowHandle?: string;
      title?: string;
    };
```

Only `launch` grants permission to terminate the application. `attach` records the app and window
as external resources and must leave them running.

Ownership-sensitive backend capabilities are protected from consumer overrides, including launch,
attach, routing, and shutdown controls. Direct platform termination methods require positively
observed `self` ownership and otherwise fail closed.

Every owned PID, port, window, endpoint, and session is written to `ownership.json`. Cleanup:

- targets exact recorded resources, never a process name;
- attempts graceful shutdown first;
- uses a bounded deadline;
- escalates to process-tree termination only for owned resources; and
- preserves cleanup failures alongside the primary run failure.

POSIX host and runner processes use dedicated process groups. Windows runner and host descendants
are terminated by exact PID tree with `taskkill /T`; a future Job Object implementation remains an
option after cross-version proof.

### Windows attach

WinAppDriver attaches through `appium:appTopLevelWindow`, so non-handle targets are resolved before
the real session starts:

1. a temporary root-desktop session enumerates top-level windows;
2. process ID, identity, or title must select exactly one window;
3. the handle, title, and owning PID are recorded as external;
4. a `windowDiscovered` event is emitted; and
5. the real session starts with the normalized native handle.

An exact title match wins over a substring match. Ambiguity is always an error. `appium:app` and
`appium:appTopLevelWindow` are mutually exclusive, so root discovery and application attachment are
separate sessions.

### macOS attach

Mac2 attach currently requires `identity`, the bundle identifier. PID, title, and native-window
selectors are rejected until a verified Mac2 discovery path exists. This is runtime-enforced even
though the current cross-platform target type still represents all selectors.

## Lifecycle and readiness

The common state model is:

```text
created -> starting|attaching -> connected -> ready -> stopping -> stopped
                                      |          |
                                      +-> exited +-> crashed
                                      +-> timed_out
```

Normalized events include:

- `launchRequested`
- `driverHostStarted`
- `processStarted`
- `windowDiscovered`
- `webDriverSessionCreated`
- `ready`
- `exitObserved`
- `crashObserved`
- `shutdownRequested`
- `shutdownCompleted`
- `monitorError`

Readiness may require an observed window, a responsive WebDriver session, the Storybook channel,
and a visible `testID`. Session hooks do not by themselves prove readiness. Driver-host and attached
application liveness are monitored after readiness; a terminal lifecycle state aborts waits and
cannot produce a passing run.

The current backend contract does not expose every launched application or native-driver PID.
Where a PID cannot be observed, the package must not manufacture ownership or process telemetry.

## Runner model

WebdriverIO with Mocha is the documented default. Jasmine and Cucumber work through their standard
adapters. `startDesktopDriver()` supports Jest, Vitest, `node:test`, scripts, and other consumers
without introducing another test API.

`sessionStrategy: 'suite'` is the default. It groups resolved specs into one ordered WebdriverIO
unit, producing one worker and one warm desktop session. Desktop automation is a single shared
resource; parallelism is safe only when every worker owns an isolated application, endpoint, port
set, Storybook channel, and artifact directory.

The launcher owns driver-host startup and endpoint publication. Workers consume the published
endpoint, apply readiness, augment `browser.desktop`, record results, and delete their sessions.
The exported service remains a compatibility wrapper around those responsibilities.

The driver host strips loader registrations such as `--require`, `--import`, and `--loader` from
inherited `NODE_OPTIONS`. WebdriverIO uses a `tsx` registration to load TypeScript configuration;
allowing that hook into the isolated driver dependency tree changes module resolution and breaks
native backend startup.

On Windows, Node cannot directly spawn a `.cmd` launcher. The Storybook executor uses an explicit
`cmd.exe /d /s /c` invocation with validated quoting rather than `shell: true`, which would flatten
arguments unsafely.

## Storybook model

### Static test declarations

A story opts in through `parameters.desktopTest`:

1. an **inline plan** for a closed, serializable set of common interactions; or
2. a **linked spec** for arbitrary host-side TypeScript.

The app never receives or evaluates test code. `desktop-driver stories generate` parses story
source statically and emits:

- `story-tests.manifest.json`, containing stable story IDs, exact tags, resolved spec paths, exact
  Mocha grep, and an executable-content digest; and
- `story-plans.generated.spec.ts`, containing one tagged Mocha test per inline plan.

The generator rejects missing roots, empty tested-story sets, duplicate plan or story IDs,
malformed or indirect hidden declarations, paths outside configured roots, and linked specs
without a runnable tagged suite. It writes output only after validation succeeds.

The manifest digest includes normalized entries and linked spec bytes. Consumers recompute it when
loading the manifest, so stale generated output or modified linked code fails before execution.
Transitive modules imported by a linked spec are not currently part of the digest.

### Story selection

Linked specs call `story.select(storyId)`. Generated inline tests call the equivalent desktop
browser command. The host-side Storybook controller sends the selection through the existing
channel server and waits for the matching `storyRendered` acknowledgement.

### On-device service

The Storybook app cannot execute Node, WebdriverIO, or native automation. `desktop-driver serve`
combines:

- the loopback HTTP run service;
- a manifest-constrained WebdriverIO executor; and
- a Storybook channel announcer.

The service binds to loopback, mints a per-boot token, allows one mutating run at a time, and accepts
only story IDs already present in the manifest. The runner command is fixed by host configuration;
no device-supplied value can become a command, module path, or grep expression.

| Endpoint                   | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `GET /v1/health`           | Liveness and protocol version                   |
| `GET /v1/stories`          | Tested story manifest                           |
| `POST /v1/runs`            | Start current, selected, or all-story execution |
| `GET /v1/runs/:id`         | Structured run status                           |
| `GET /v1/runs/:id/events`  | Server-sent progress                            |
| `POST /v1/runs/:id/cancel` | Bounded cancellation                            |

The service announces `{ url, token, protocolVersion, manifestDigest }` over the Storybook channel.
The token prevents requests from clients that have not observed an announcement, but it is not a
defense against a local attacker because the channel is also local and unauthenticated. The primary
controls are loopback binding, manifest allowlisting, serialized mutation, and rejection of
arbitrary execution.

The spawned runner inherits the service environment. Consumers must start explicit platform
scripts; otherwise a configuration that defaults to `fake` can return a valid fake-backend pass
without touching the real app.

## Results and artifacts

Each run writes:

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

`run.json` is the complete machine-readable result. `events.ndjson` records bounded lifecycle
evidence, and JUnit supports CI reporting. Test failures may capture accessibility source and a
screenshot.

Artifact paths are confined to the run directory. Sensitive keys such as tokens, authorization,
clipboard values, environment, and entered values are redacted before persistence. Screenshots,
source, and logs can still contain private content and must remain ignored and be reviewed before
sharing.

## Platform constraints

### Windows

- Tests require a real, interactive, unlocked desktop.
- React Native Windows pressables generally expose no UI Automation `InvokePattern`; clicks use
  synthetic input and fail on a locked workstation.
- A locked session can still return source, attributes, and screenshots, making the failure look
  like an application defect.
- WinAppDriver is located through `APPIUM_WAD_PATH` or its standard installation path.
- Window enumeration is intentionally performed per run; caching a native handle risks attaching
  to an unrelated later window.
- WebDriver screenshots may not reliably capture all WinAppSDK Composition content. Visual evidence
  requires separate real-platform verification.

### macOS

- macOS 11.3+, Xcode 13+, Command Line Tools, Xcode Helper accessibility permission, automation
  mode, a logged-in GUI session, and a writable WDA build cache are required.
- Mac2 owns WebDriverAgentMac/xcodebuild startup unless configured against an external WDA.
- Attach behavior, window observation, focused-state lookup, scrolling, and bounded cancellation
  require continued real-platform compatibility coverage.

### Fake backend

The fake backend is a deterministic contract endpoint for package plumbing. It covers the
single-driver host, commands, Storybook controller, service, generated plans, lifecycle, and
artifact pipeline without a GUI. It does not prove native driver behavior and cannot substitute for
the identical suite on Windows and macOS.

## Security invariants

- All hosts and services bind only to allowlisted loopback addresses.
- Attach never grants termination ownership.
- Cleanup never targets a process by name.
- Backend capability overrides cannot weaken ownership or routing.
- Storybook requests cannot choose commands, paths, or test code.
- Inline plans use a closed schema and `testID` selectors only.
- Platform commands capable of arbitrary local execution stay disabled by default.
- Artifact paths remain inside the run directory and sensitive fields are redacted.
- Protocol and manifest versions are validated at every process boundary.

## Validation strategy

The package uses four complementary layers:

1. **Unit tests** cover configuration, capabilities, selectors, lifecycle, ownership, process
   supervision, manifest validation, redaction, and protocol behavior.
2. **Fake-backend contract tests** drive the full WebdriverIO and Storybook paths without native
   dependencies.
3. **Shared real-platform tests** run the exact same spec digest and test IDs on Windows and macOS.
4. **Platform-specific integration tests** prove launch, attach, native driver process ownership,
   readiness, cancellation, screenshots, and prerequisites.

A portable command is added only with one unchanged contract assertion on both real platforms.
Platform jobs remain serial until isolated multi-session execution is explicitly designed and
measured.

## Alternatives and rationale

### Direct WinAppDriver access

WebdriverIO can connect directly to WinAppDriver, but this loses
`appium-windows-driver` compatibility shims for protocol and screenshot differences. The package
uses Windows Driver as the compatibility layer until a measured alternative is selected.

### NovaWindows

NovaWindows avoids the aging WinAppDriver dependency, but it has not passed this package's
real-backend contract. It is not a supported backend until dependency resolution, ownership,
capability, command parity, and performance are verified.

### Private Appium server

Running Appium core would use the drivers through their best-supported loader, but would add the CLI
or router architecture deliberately excluded from this product. It remains a decision-gated
fallback, not an implicit migration path.

### `agent-device`

`agent-device` offers useful macOS exploration, snapshots, evidence, and replay patterns, but has no
Windows backend and does not expose the common local WebDriver endpoint this package requires. It
may be used independently for agent-led exploration; it is not a deterministic suite dependency.

### MCP

MCP can eventually expose coarse agent operations such as listing stories, starting allowlisted
runs, and reading structured results. It is not the internal transport and is not needed for normal
WebdriverIO or Storybook execution. Any future MCP surface must call the same service handlers,
default to stdio, and expose no shell tool.

## Implementation constraints

- Keep explicit named exports; do not introduce wildcard barrels.
- Keep backend imports out of neutral modules.
- Keep `import.meta` entry modules out of the Jest CommonJS graph.
- Keep generated Storybook tests and artifacts uncommitted.
- Preserve the package-version drift test while `PACKAGE_VERSION` remains a literal.
- Keep consumer hooks and reporters composed rather than overwritten.
- Preserve primary failures when cleanup also fails.
- Update this document whenever ownership, portability, protocol, process topology, or security
  behavior changes.
