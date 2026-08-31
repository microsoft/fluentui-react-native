# Desktop Driver Plan

## Status

Active architecture and implementation plan. This document starts from the
current checked-out tree and public platform/protocol documentation. It does
not depend on work from other branches.

The platform-neutral protocol, fake host, Storybook orchestration, WebdriverIO
authoring, and agent contracts are complete. The native stage now has a selected
source-build architecture: a C++ Windows helper and a Swift Package Manager
macOS helper are built explicitly on the target operating system, reused from a
verified shared cache, and optionally replaced by an operator-provided prebuilt
artifact. The npm package does not publish native binaries or compile during
installation.

The 2026-08-31 native-stage refinement reconciles independent GPT-5.6 Sol and
Claude Opus 5 investigations plus reciprocal reviews. Decisions below retain
only conclusions supported by both reviews or by primary platform evidence;
remaining uncertainty is recorded as an explicit Stage 2 gate.

## Implementation status

Updated 2026-08-31.

### Stage 1 Phase 1: Complete

- Added the public `@fluentui-react-native/desktop-driver` package and repository
  project references.
- Implemented W3C response/error routing, capability negotiation,
  server-registered targets, one-session-per-target reservation, sessions,
  timeouts, windows, elements, actions, screenshots, source, and unsupported
  browser-command handling.
- Implemented stable WebDriver element references, native liveness checks,
  preview-scoped staleness, configurable click modes, input-state tracking,
  action validation, element-origin resolution, per-session command queues,
  a global input mutex, abortable host deadlines, drained runner cancellation,
  and ownership-safe shutdown.
- Added the deterministic fake host, typed low-level client, raw HTTP contract
  coverage, and a WebdriverIO remote-session contract with no Appium service.
- Portable fake-host coverage exercises element lookup, click, text entry,
  actions, waits, screenshots, stale references, concurrent session rejection,
  and shutdown during session creation.

### Stage 1 Phase 2: Complete

- Added exact-platform Story Manifest generation with statically extracted,
  validated `parameters.desktopDriver` plans, relocatable source paths,
  platform digests, and portable-plan digests.
- Added a per-enlistment driver port and generated driver manifest containing
  target identity, test-ID prefix, nonce, catalog digests, and service ports.
- Added authenticated, bridge-only runtime hello/readiness/error events with
  request/run correlation, explicit hello challenges, same-story reset, and
  preview generation.
- Added stable native app and story-root markers, native marker verification,
  preview-only element invalidation, and a keyed per-run remount/error boundary.
- Added Storybook selection, reset, manifest, current-story, and args extension
  commands to the WebDriver session.
- Added `storybook-desktop manifest`, `instance`, and `driver` flows. The
  `driver` supervisor runs Metro plus separate Storybook and WebDriver listeners
  while keeping both server protocols in one Node process.
- Added an embedded-server integration test and verified the live Windows
  Stage 1 supervisor exposes equivalent 136-story channel and driver manifests.
- All macOS, Windows, and Win32 JavaScript bundles include the runtime bridge.

### Stage 1 Phase 3: Complete

- Finalized strict static plan, selector, action, assertion, capability,
  platform, result, test, step, and artifact contracts under `/authoring`.
- Added deterministic filtering and sharding plus complete fake-host execution
  for clicks, text entry, key/action sequences, scrolling, waits, Storybook
  args, screenshots, source, and semantic assertions.
- Added the sanctioned `/wdio` API and typed browser commands for listing,
  opening, resetting, asserting, and running story plans without Appium.
- Added confined atomic artifacts, host metadata, `run.json`, and automatic
  screenshot, source, and compact-tree failure evidence.
- Added the bounded `/agent` API for listing, explaining, inspecting, finding,
  acting, checking, capturing, and running the same story plans.
- Added the JSON `desktop-driver` CLI for fake serving, story list/explain/run,
  sharding, evidence, and bounded agent describe/screenshot operations.
- Added manifest-derived fake elements and repeatable per-test state reset so
  real component plans can run repeatedly in Stage 1.
- Added typed, statically extractable `desktop-e2e` plans to Button, Checkbox,
  and Input. All three extract from real CSF and pass repeatedly through the
  sanctioned WebdriverIO runner.
- Evaluated MCP integration and deferred a composed executable adapter until
  Stage 2 proves the native command and security model; a schema-only claim is
  explicitly insufficient.
- Updated package, Storybook, runtime, app, component, skill, and agent
  documentation for the final Stage 1 responsibilities.

### Remaining work

Stage 1 is complete; no Phase 1, Phase 2, or Phase 3 deliverables are left
incomplete.

- Stage 2 Phase 4A remains: implement native helper build, resolution, cache,
  transport, verification, Storybook attachment, and crash-recovery
  infrastructure.
- Stage 2 Phases 4B and 4C remain: implement and complete the shared Windows and
  Win32 C++ provider.
- Stage 2 Phases 5A and 5B remain: prove macOS identity, authority, capture, and
  hosted-runner behavior, then complete the Swift provider.
- Stage 3 remains: release hardening, source-package proof, optional prebuilt
  trust policy, security review, reliability qualification, and CI promotion.
- On-device bridge execution is intentionally deferred to Stage 2; Phase 2 is
  validated through the fake host, runtime/server contract tests, live
  same-process services, and production bundles.

## Outcome

Create a public `@fluentui-react-native/desktop-driver` package that:

- implements a useful, explicitly documented subset of the W3C WebDriver
  Classic protocol without Appium;
- drives React Native macOS, React Native Windows Fabric, and React Native
  Win32 Paper applications;
- exposes platform-neutral window, accessibility-tree, input, screenshot, and
  diagnostics APIs;
- formalizes the device contracts required by desktop Storybook applications;
- lets component authors declare portable tests alongside stories;
- runs those tests as end-to-end automation or exposes the same operations to
  validation agents;
- reuses the existing Storybook channel server for story discovery, selection,
  and render events;
- avoids requiring another long-running Node server process for Storybook.

## Non-goals

- Do not expose Appium client APIs, Appium capabilities, or the Appium CLI.
- Do not emulate browser-only behavior such as navigation, cookies, frames,
  shadow roots, JavaScript execution, prompts, or printing.
- Do not make Storybook a dependency of the generic driver.
- Do not require Jest or a particular agent protocol for authored story tests.
  WebdriverIO is the sanctioned high-level automation API.
- Do not use visible text, layout order, or native class names as the stable
  selector contract.
- Do not include visual-regression baseline comparison or migration of the
  legacy E2E harness in the initial effort; both are future considerations.

## Architectural decisions

### Package topology

Create one new public package:

```text
@fluentui-react-native/desktop-driver
```

Do not initially create either `desktop-driver-server` or
`storybook-desktop-server`.

`desktop-driver` owns both an embeddable W3C remote end and a standalone CLI.
The server is central to the package rather than an independently useful
product boundary. Keep internal `protocol`, `server`, `client`, and `host`
seams so a server package can be extracted later without changing public
contracts.

`storybook-desktop` remains the owner of Storybook configuration, the channel
server, Metro and native app lifecycle, platform selection, generated
manifests, and Storybook-specific orchestration. It depends on
`desktop-driver`, registers a Storybook target and orchestration adapter, and
starts the embedded driver listener.

`storybook-desktop-runtime` remains React Native-only. It exposes the native
story root and sends versioned readiness/error messages over the existing
Storybook channel. It does not host WebDriver or import Node APIs.

```text
component story
  -- type-only --> desktop-driver/authoring

desktop-driver
  -- no dependency --> Storybook, React, React Native, or private apps

storybook-desktop
  --> desktop-driver

storybook-desktop-runtime
  --> Storybook channel only

apps/storybook
  --> storybook-desktop
  --> storybook-desktop-runtime
```

### Server and process model

The existing Storybook server remains the Storybook control plane:

- story index and documentation;
- WebSocket channel;
- story selection;
- Storybook events;
- existing MCP endpoint.

The W3C remote end uses a separate loopback port because the current upstream
channel server constructs and owns its HTTP server and handles unmatched
requests itself. Mounting WebDriver routes into that listener would couple the
driver to upstream internals and risk conflicting responses.

Both listeners should run in the same `storybook-desktop` Node process:

```text
storybook-desktop supervisor process
  |- Storybook HTTP/WebSocket/MCP listener
  |- WebDriver HTTP listener
  |- Metro child process, when needed
  |- native host transport, when needed
  `- owned application process or attached application lease
```

This meets the goal of avoiding another long-running server process while
keeping the two protocols isolated. A non-Storybook application can run the
same WebDriver remote end through the standalone `desktop-driver` CLI.

Create a separate server package only if one of these triggers occurs:

1. a consumer needs the server without the client, authoring, and testing APIs;
2. remote host deployment requires a release cadence independent of the
   package;
3. native artifacts make the server install materially heavier than the
   client;
4. authentication, TLS, or fleet management becomes a separate product
   concern.

### Target registration

Clients select a server-registered target:

```json
{
  "capabilities": {
    "alwaysMatch": {
      "browserName": "furn-native-desktop",
      "platformName": "windows",
      "furn:target": "agentic-storybook-windows",
      "furn:launchMode": "attach"
    }
  }
}
```

Capabilities must not accept arbitrary executable paths, command arguments,
environment variables, manifest paths, or artifact roots. Target definitions
are registered when the server starts and resolve to controlled launch/attach
providers and a confined artifact root.

An explicit local-development mode may allow ad hoc targets later, but it must
be disabled by default and unavailable to agent-facing APIs.

### V1 support scope

V1 supports:

- Windows 11 x64;
- macOS 14 on Apple Silicon;
- Windows Fabric, Win32 Paper, and macOS Storybook endpoints;
- exactly one active session per physical target.

Broader operating-system, architecture, and concurrency support is deferred.

## Package responsibilities

### `desktop-driver`

Own:

- W3C routing, response envelopes, errors, and capability processing;
- session, timeout, window, input, and element state;
- server-side target registry;
- platform-neutral host contract;
- native host transport protocol;
- WebDriver element identity and staleness;
- typed low-level client;
- sanctioned WebdriverIO runner, configuration, matchers, and custom commands;
- generic serializable story-test schema and runner primitives;
- screenshots, artifacts, logs, and diagnostics;
- token-efficient agent operations;
- deterministic fake host and protocol conformance harness.

Do not depend at runtime on:

- Appium;
- Storybook;
- React or React Native;
- a private application package.

### `storybook-desktop`

Own:

- a generated platform-specific Story Manifest;
- a Storybook implementation of the driver's `StoryOrchestrator` interface;
- authenticated/correlated channel messages;
- Storybook extension commands;
- one supervisor for channel, Metro, driver, app, and test lifecycle;
- driver port allocation in the existing per-enlistment instance identity;
- Storybook test-plan extraction and digest generation;
- machine-readable readiness output;
- `driver`, `test`, and `agent` CLI flows.

### `storybook-desktop-runtime`

Own:

- a stable native application/root marker;
- a stable native story-canvas marker;
- native-observable current story and preview generation;
- runtime hello, story-ready, story-error, and reset acknowledgements;
- a per-test remount boundary keyed by run ID;
- render-error forwarding.

### Consuming Storybook app

Own:

- target registration and native identity;
- story package discovery and platform exclusions;
- exceptional launch/run commands;
- artifact root;
- concrete `testID` prefix;
- pilot story tests;
- cross-package contract tests.

## W3C remote-end contract

Describe the package as a **W3C WebDriver Classic-compatible native desktop
remote end**, not a conforming browser remote end. Unsupported browser commands
return `unsupported operation`; they never return fabricated success values.

### Initial standard endpoints

Implement:

- `GET /status`;
- `POST /session` and `DELETE /session/{id}`;
- `GET|POST /session/{id}/timeouts`;
- current window, window handles, switch window, close window;
- get/set window rectangle where the host reports support;
- find element(s) from the window or an element;
- active element;
- element name/role, text, attributes, properties, rectangle, enabled, and
  selected state where supported;
- click, clear, and send keys;
- perform and release actions;
- window screenshot and element screenshot;
- normalized accessibility source.

Return `unsupported operation` for:

- navigation and history;
- cookies;
- frames and shadow roots;
- arbitrary JavaScript execution;
- browser prompts;
- printing;
- CSS values;
- new-window creation until native semantics are specified.

Do not repurpose the standard `pageLoad` timeout for story readiness. Add
namespaced driver timeouts:

```ts
type DesktopTimeouts = {
  appLaunch: number;
  nativeCommand: number;
  storyRender: number;
  stableLayout: number;
};
```

### Capability negotiation

Implement W3C `alwaysMatch` and ordered `firstMatch` processing, including:

- extension capability names containing `:`;
- rejection of duplicate keys during merge;
- ordered candidate evaluation;
- `session not created` when no target/provider can satisfy a candidate;
- truthful returned capabilities based on the selected host.

Use:

- `platformName: "macos"` or `"windows"` for the operating system;
- `furn:endpoint: "macos" | "windows" | "win32"` for the repository endpoint;
- `furn:renderer: "fabric" | "paper"` for renderer semantics;
- `furn:target` for the registered target;
- `furn:clickMode: "physical" | "accessibility" | "auto"` for environment-
  appropriate element-click behavior;
- `furn:features` for negotiated input, tree, state, screenshot, and window
  capabilities.

Return a standard capability only when its semantics are implemented.

### Errors

Map native failures to specific WebDriver errors:

| Condition                                     | WebDriver error             |
| --------------------------------------------- | --------------------------- |
| target cannot launch or attach                | `session not created`       |
| missing/closed session                        | `invalid session id`        |
| missing/closed window                         | `no such window`            |
| lookup does not resolve                       | `no such element`           |
| retained native node is detached/replaced     | `stale element reference`   |
| malformed locator                             | `invalid selector`          |
| disabled, unfocusable, or empty-bounds target | `element not interactable`  |
| another node owns the hit-tested point        | `element click intercepted` |
| capture backend fails                         | `unable to capture screen`  |
| deadline expires                              | `timeout`                   |
| capability/property/operation is unavailable  | `unsupported operation`     |

Error `data` may contain redacted native error codes, operation names, and
artifact IDs. It must not expose environment variables, arbitrary paths, or
private window content.

### Element identity and staleness

Expose only session-generated UUIDs under the standard key:

```text
element-6066-11e4-a52e-4f735466cecf
```

Never expose UIA runtime IDs, AX references, React tags, HWNDs, or accessibility
paths as public element IDs.

Each stored element records:

- native handle;
- application and window;
- logical scope: `application`, `chrome`, `preview`, or `secondary-window`;
- preview generation, when applicable;
- diagnostic locator fingerprint.

Every element command performs a cheap liveness check. A story reset increments
the preview generation and invalidates preview elements only. Storybook chrome
and still-live secondary-window elements remain valid.

Do not reconstruct a missing native object from a role/index path. Re-resolving
to a different object must produce staleness rather than silently changing the
meaning of an existing WebDriver reference.

### Selectors

The portable authoring API exposes:

```ts
by.testId('button-primary');
by.role('button', { name: 'Save' });
by.accessibleName('Save');
by.text('Saved');
```

Wire strategies in the first release:

- `accessibility id` as a documented extension mapping to `testID`;
- `tag name` mapping to normalized native role;
- `link text` and `partial link text` mapping to accessible name only where
  those standard semantics are meaningful.

Defer CSS and XPath. Do not redefine CSS for a non-DOM tree, and do not add the
cost and brittleness of normalized XML/XPath until a concrete client need is
demonstrated.

Deterministic authored tests use `testID`. Role and accessible name are
important for accessibility validation and agent exploration, but are not a
replacement for stable IDs.

### State

Native platforms expose different state sets. Absence must never become a
false-shaped passing assertion.

```ts
type SupportedValue<T> = { supported: true; value: T } | { supported: false; reason: string };
```

Normalize, when supported:

- automation ID;
- accessible name and help;
- role and native role;
- value/text;
- enabled;
- focused/focusable;
- selected, checked/mixed, and expanded;
- visible/offscreen;
- logical rectangle;
- supported accessibility actions/patterns.

The runner checks declared capabilities before a test. Unsupported required
state produces an explicit skip or unsupported result, not a passing
assertion.

### Input

Standard `element.click()` uses the session's negotiated click mode:

```ts
type ClickMode = 'physical' | 'accessibility' | 'auto';
```

- `physical` performs real pointer input and is the default for local
  component validation;
- `accessibility` invokes the native accessibility action and is intended for
  environments such as CI where physical input is blocked;
- `auto` prefers physical input and falls back to accessibility activation
  only when the host reports that physical input is unavailable.

The selected mode is returned in `furn:features`. Session creation fails when
the requested mode is unsupported, rather than silently changing interaction
semantics. Accessibility mode is necessarily capability-limited because not
every React Native control projects an activation action.

Physical click executes:

1. validate liveness;
2. scroll into view when supported;
3. activate the owning window;
4. refresh bounds;
5. compute an in-view point;
6. hit-test the point;
7. reject interception;
8. send pointer down/up.

An explicit extension command may invoke accessibility activation regardless
of the session default for accessibility-focused validation.

Implement W3C Actions with:

- key, mouse pointer, wheel, and null sources;
- tick grouping and duration;
- viewport, pointer, and element origins;
- depressed key/button tracking;
- Release Actions on normal teardown, timeout, cancellation, and host failure.

There is one global input mutex per physical desktop. V1 permits exactly one
active session per physical target.

Public rectangles use logical points/DIPs relative to the current window client
area. Hosts privately convert to screen pixels using window origin, frame
insets, Windows DPI, Retina backing scale, and virtual-desktop origin. Capture
metadata records both logical and pixel dimensions and the scale factor.

### Screenshots

Standard screenshot commands return Base64 PNG:

- session screenshot: current native window content;
- element screenshot: current window capture cropped to the visible element
  bounds;
- window decorations excluded by default.

Extensions may request:

- window frame inclusion;
- a named artifact;
- all windows, returned as an artifact manifest;
- display capture for diagnostics.

The platform-neutral stage uses fake captures to establish protocol and
artifact behavior. Real screenshot support arrives with the later native-host
stage. Windows native work includes occlusion-independent HWND capture before
the Windows screenshot capability is advertised.

### Diagnostics and artifacts

Provide namespaced commands for:

- compact JSON accessibility tree;
- full normalized tree/source;
- host and permission diagnostics;
- recent driver, host, story, input, and device events;
- named screenshots and evidence bundles;
- Storybook manifest and current story state.

Suggested failure bundle:

```text
artifacts/desktop-driver/<run-id>/
  run.json
  host.json
  sessions/<session-id>/
    commands.ndjson
    windows.json
    source.xml
    tree.json
    screenshots/
    logs/
  stories/<story-id>/<test-id>/
    result.json
    before.png
    failure.png
```

Result status distinguishes:

- passed;
- assertion failed;
- skipped unsupported capability;
- timed out;
- cancelled;
- app crashed;
- driver/host failed;
- configuration failed;
- permission failed.

## Platform-neutral host contract

The protocol layer depends only on an injected host:

```ts
interface DesktopHost {
  readonly endpoint: 'macos' | 'windows' | 'win32';

  probe(): Promise<DesktopHostInfo>;
  launch(target: RegisteredTarget): Promise<ApplicationLease>;
  attach(target: RegisteredTarget): Promise<ApplicationLease>;

  windows(app: ApplicationLease): Promise<DesktopWindow[]>;
  activate(window: DesktopWindow): Promise<void>;
  getWindowRect(window: DesktopWindow): Promise<Rect>;
  setWindowRect(window: DesktopWindow, rect: Partial<Rect>): Promise<Rect>;

  find(root: DesktopRoot, selector: NativeSelector, options: FindOptions): Promise<NativeElement[]>;
  snapshot(element: NativeElement): Promise<NativeElementSnapshot>;
  isAlive(element: NativeElement): Promise<boolean>;
  hitTest(window: DesktopWindow, point: Point): Promise<NativeElement | null>;

  performActions(actions: readonly NativeActionTick[]): Promise<void>;
  releaseActions(): Promise<void>;

  captureWindow(window: DesktopWindow): Promise<NativeImage>;
  captureRect(window: DesktopWindow, rect: Rect): Promise<NativeImage>;

  subscribe(listener: DesktopHostEventListener): Disposable;
  dispose(): Promise<void>;
}
```

`ApplicationLease` records:

- `launched` or `attached` ownership;
- PID and process creation time;
- target identity;
- known windows;
- graceful close behavior.

Attached apps are preserved by default. Cleanup uses exact owned resource
records, never process-name matching.

Host events should include:

- structure changed;
- focus/property changed;
- window opened/closed;
- app exited;
- host transport failed.

The host transport begins with a versioned handshake containing protocol and
helper versions, endpoint, architecture, capabilities, and permission state.
A host crash invalidates the session and produces an infrastructure failure; it
is not silently restarted during a test.

## Native implementation staging

Keep all operating-system code replaceable behind `DesktopHost`. The Node
package owns target registration, W3C semantics, cancellation deadlines,
session state, element identity, artifacts, and public APIs. Native helpers own
only operating-system automation and communicate through a private versioned
process protocol.

### Selected native implementations

| Provider          | Selected implementation                                                                                                                                                                           | Runtime dependency contract                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Windows and Win32 | One C++20 x64 helper using Win32 and COM for UI Automation, process/window management, input, Direct3D, and WIC, with narrow C++/WinRT use for Windows Graphics Capture and `Windows.Data.Json`   | Windows system DLLs only; link the multithreaded CRT statically with `/MT`; do not depend on Windows App SDK or the VC++ Redistributable |
| macOS             | One Swift Package Manager arm64 executable wrapped after compilation in a minimal signed agent `.app`, using Foundation, AppKit, ApplicationServices, CoreGraphics, ScreenCaptureKit, and ImageIO | Apple system frameworks and the Swift runtime shipped by supported macOS versions; no third-party Swift packages or bundled Swift dylibs |

The React Native Windows Storybook application may independently require
Windows App Runtime. That target dependency does not create a helper-side
Windows App SDK dependency.

C# remains a documented fallback rather than the Stage 2 implementation:

- framework-dependent modern .NET requires an installed runtime;
- self-contained and single-file deployments carry and service a managed
  runtime payload;
- .NET Framework is an in-box but legacy dependency with a worse modern WinRT
  capture fit;
- NativeAOT is credible, but it requires the .NET SDK in addition to the C++
  toolchain and moves the event-heavy UI Automation surface onto generated COM
  interop with known `VARIANT`, `SAFEARRAY`, and callback risk.

Reconsider NativeAOT only if a focused UI Automation event/cancellation spike
passes and native C++ maintenance proves materially worse than expected.
PowerShell remains useful for throwaway probes, but is not the production host.

### Native source distribution and explicit builds

The public npm package contains JavaScript output, CLI/config files,
documentation, and `native/**` source. It contains no `.exe`, `.app`, native
object, Swift build, Visual Studio build, or signed helper output.

Do not add `install`, `postinstall`, or package-download hooks. Native
compilation occurs only through a declared command on the target operating
system:

```text
desktop-driver build-driver --platform windows
desktop-driver build-driver --platform macos
storybook-desktop build-driver --windows|--win32|--macos
```

`desktop-driver build-driver` is the strict isolated source-build command. It
may reuse an already verified build produced from the same inputs, but it does
not select a direct helper path or managed prebuilt root. A separate
`resolve-driver` API and JSON CLI select a direct artifact, managed install
root, verified cache artifact, or source build according to policy.

Windows uses a checked-in MSBuild C++ project and the installed Visual Studio
C++ toolchain plus Windows SDK. It requires no CMake, NuGet restore, .NET
runtime, or Windows App SDK package. macOS invokes `swift build` with explicit
package and scratch paths, locates the product through `--show-bin-path`,
assembles the minimal application bundle, writes its `Info.plist`, and applies
the configured code signature.

### Native build and prebuilt configuration

The typed resolver accepts:

```ts
type DesktopNativeDriverOptions = {
  buildPolicy?: 'if-missing' | 'never';
  cacheRoot?: string;
  configuration?: 'debug' | 'release';
  helperPath?: string;
  installRoot?: string;
  macosSigningIdentity?: string;
};
```

V1 accepts only Windows/Win32 x64 and macOS arm64. Unsupported cross-builds and
architectures fail before any compiler is probed.

Configuration precedence is:

1. explicit CLI option;
2. explicit environment variable;
3. explicitly loaded config or typed API option;
4. built-in default.

Do not walk the current directory for an implicit executable-selecting config.
Storybook passes its validated typed configuration. The supported environment
surface is limited to helper path, install root, cache root, build policy, and
macOS signing identity; none may come from WebDriver capabilities.

Helper source resolution and selection precedence is:

1. explicit helper path;
2. explicit managed install root;
3. verified shared cache;
4. source build when `buildPolicy` is `if-missing`.

An invalid explicit path or install root fails immediately rather than silently
falling through. The package never downloads or updates a prebuilt helper.

### Shared cache and build-once behavior

The default native store is user-level and shared across repositories,
worktrees, applications, and packages:

```text
Windows: %LOCALAPPDATA%\Microsoft\FluentUIReactNative\desktop-driver\native
macOS:   ~/Library/Caches/com.microsoft.fluentui-react-native.desktop-driver/native
```

CI and managed environments may override it with `--cache-root` or
`FURN_DESKTOP_DRIVER_CACHE_ROOT`, including a workspace-local `.cache` path.
Never write beneath the resolved npm package, a pnpm store, or `node_modules`.

Separate identifiers prevent rebuild and multi-version conflicts:

- a **compatibility key** covers provider, architecture, configuration, native
  source and build-coordinator digests, wire protocol range and required
  features, minimum operating system, runtime model, bundle identifier, and
  signing policy;
- a **build fingerprint** adds the actual compiler, linker, SDK, MSBuild or
  SwiftPM, build flags, and signing identity;
- an **artifact ID** adds hashes of the verified output tree.

Artifacts are immutable:

```text
<cache-root>/v1/
  artifacts/<provider>-<arch>/<compatibility-key>/<build-fingerprint>/<artifact-id>/
  selections/<compatibility-key>/<generation>-<artifact-id>.json
  locks/<compatibility-key>/
  staging/
  runtime/
  trash/
```

Multiple package versions and multiple toolchains may coexist. Identical native
sources and compatible build settings may reuse one artifact. `--force`
publishes a new immutable selection generation and never replaces a running
Windows executable. Cleanup removes only unselected, unleased artifacts and
reports sharing violations rather than truncating or replacing in-use files.

Builds use an atomic directory lock with owner PID, process start time,
hostname, random token, and heartbeat. A contender rechecks for a published
winner while waiting. Stale-lock recovery requires proven-dead owner identity
and atomic lock-directory quarantine; a merely slow build is never broken
automatically. Build into same-volume staging, verify completely, atomically
rename to the immutable artifact directory, then atomically publish the
selection generation.

### Verification and trust

Every selected helper is verified before use:

- real-path and confinement checks;
- architecture and platform inspection;
- executable or app-bundle hashes;
- dependency inspection;
- platform signature policy;
- source-build metadata consistency when the artifact claims the current
  source;
- native wire major/minor and required-feature negotiation;
- handshake on the actual long-lived helper process used by the provider.

Do not rely on a short-lived probe plus a time-based verification cache for the
process that receives automation commands. Direct mutable paths are rehashed
immediately before spawn. The long-lived child must identify the same artifact
and complete the mandatory handshake before target registration succeeds.

Trust policy depends on origin:

- a locally built Windows helper may be unsigned but must pass hash,
  dependency, and handshake checks;
- a locally built macOS helper is always code signed, using the configured
  stable identity when available and ad hoc signing as an explicitly warned
  development fallback;
- an explicit developer path is trusted by operator choice, with optional
  signer pinning;
- an organization-managed install root requires its configured Authenticode or
  Developer ID identity, hashes, and handshake.

Notarization applies only to an externally distributed optional macOS prebuilt.
It is not required for a locally source-built, non-quarantined helper and does
not grant Accessibility or Screen Recording authority.

### Native host transport and cancellation

Run one long-lived helper child per native provider instance. Use inherited
stdin/stdout with a fixed binary frame header, UTF-8 JSON control frames, and
raw binary payload frames for PNG data. Reserve stderr for bounded native logs.
Do not add another loopback listener, platform-specific named-pipe protocol, or
per-command process.

The handshake reports:

- wire protocol major and minor;
- helper and build identity;
- provider, architecture, and minimum OS;
- supported commands, events, and feature flags;
- signing identity and live permission/desktop state;
- process ID and command limits.

Reject wire-major mismatches. Negotiate the lower compatible minor and require
every feature used by the Node provider. A cache artifact claiming to be built
from the current source must also match its recorded source and artifact
identity.

Requests, responses, events, cancellation, and cancellation acknowledgements
carry correlation IDs. Queries remain authoritative; events are hints for
waits, invalidation, and failure classification. Helper, application, primary
window, or event-sequence failure marks the session unusable and is never
silently restarted during a test.

When a command deadline aborts:

1. stop dispatching new session commands while retaining the session queue and
   physical-input ownership;
2. send `cancel` and require a prompt acknowledgement;
3. allow a separate bounded cleanup deadline for the helper to stop side
   effects and release input;
4. terminate the helper only after cleanup fails;
5. invalidate the session and classify the failure as infrastructure.

Node mirrors the planned depressed-key and pointer-button ledger. If the helper
dies after input-down and cannot release normally, start the same verified
binary in a restricted release-only mode that may emit only the required
key/button-up events. Keep physical input disabled and the machine input lock
held until recovery succeeds or the server is stopped with an actionable
diagnostic.

The existing in-process input mutex remains, and every native helper also
acquires an operating-system-level lock for the physical action chain so two
driver processes cannot interleave input on the same interactive desktop.

### Storybook integration and application ownership

`storybook-desktop` imports the typed build/resolution API; it does not
duplicate native source, compiler commands, cache rules, or verification.

- `build-driver` builds only the helper and returns structured JSON.
- `prep` ensures the helper with `if-missing` before running existing native
  project preparation. Win32 therefore gains a real prep action even though it
  has no generated native project.
- `driver` resolves the helper before allocating services or starting Metro so
  missing tools fail quickly.
- `smoke --mode stories` remains render-only and neither resolves a helper nor
  starts WebDriver.
- `smoke --mode stories-and-tests` resolves the helper before services or app
  launch and uses the native provider.
- `bundle`, `build`, `run`, `server`, `manifest`, and `instance` remain
  independent of helper compilation.

Build policy never changes implicitly because a generic `CI` variable exists.
The default is `if-missing` for `prep`, `driver`, and
`stories-and-tests`. A CI or managed workflow may explicitly set `never` after
provisioning or restoring a verified artifact.

The private generated driver manifest advances to schema version 2 and records
two separate objects:

1. immutable helper artifact identity, path, hashes, wire range, features,
   origin, architecture, configuration, and signing metadata;
2. a validated server-owned application descriptor containing the allowed
   bundle identifier, AUMID/package identity, canonical executable identity,
   fixed launch arguments, expected window/root identity, and a nonce-bound
   runtime lease-hint path.

Live permissions, interactive-desktop state, capture availability, and
integrity level come from `probe` or `doctor`, not the immutable manifest.
Machine-local helper paths are allowed in the ignored private manifest but are
redacted from WebDriver capabilities, agent APIs, and public diagnostics.

Storybook smoke already owns application launch. It must atomically provide the
native provider with exact PID and process-start identity plus endpoint-specific
bundle, AUMID, executable, and window information. The provider independently
verifies the nonce-bound hint against the live OS. Storybook WebdriverIO
sessions explicitly request `furn:launchMode: "attach"`, return an attached
lease, preserve the app during session deletion, and leave final app cleanup to
the Storybook owner.

### Current constraints

- package installation scripts are disabled in this repository, but external
  consumers may not disable them; the package manifest must therefore contain
  no native install lifecycle;
- public packages are built and packed on Linux, so Linux validation must
  prove that native source is included, native outputs are excluded, and a
  target build is not attempted;
- Windows source builds use the installed Visual Studio C++ workload and
  Windows SDK already expected for React Native Windows development;
- macOS Storybook already requires Xcode and CocoaPods; Command Line Tools-only
  Swift builds are a useful portability check, not a blocker when full Xcode
  succeeds;
- current macOS E2E uses a Mac2/XCTest substrate on hosted CI. The Swift helper
  is the selected implementation, while XCTest remains only a measured fallback
  if the direct helper cannot satisfy required hosted authority;
- current hosted Windows Storybook and Win32 jobs establish a useful baseline,
  but UIA events, physical input, WGC, and cancellation remain empirical gates;
- real automation requires an interactive user desktop and matching integrity
  authority.

### Stage 2 entry gates

Before each provider is promoted beyond an advisory vertical slice, prove:

- the packed npm artifact builds from extracted native source without writing
  beneath the package;
- two packages and two compatible package versions resolve concurrently without
  duplicate builds or selection interference;
- a direct helper, managed install root, shared cache, source build, explicit
  `never` policy, force rebuild, corrupt artifact, stale lock, and in-use
  Windows artifact all produce deterministic outcomes;
- the actual long-lived helper passes hash, dependency, signature-policy, and
  handshake validation;
- cancellation at the command deadline settles under the separate cleanup
  deadline, and forced helper death after key/button-down either releases the
  exact owned inputs or disables further physical input;
- Storybook `stories` smoke succeeds without a helper, while
  `stories-and-tests` attaches to exactly the app Storybook launched;
- Windows Graphics Capture produces correct occluded-window content and
  element crops at supported DPI values without promising borderless or
  minimized capture before measurement;
- hosted Windows support is decided per capability from the current repository
  runner rather than assumed;
- macOS direct-spawn versus Launch Services identity, Accessibility and Screen
  Recording behavior across signing/rebuild modes, AX-to-ScreenCaptureKit
  window correlation, and hosted authority are measured;
- every existing `DesktopHost` method has an implementation or explicit
  unsupported result plus a shared conformance test.

If the direct Swift helper cannot provide required hosted-macOS authority, use
the existing XCTest substrate only after an explicit fallback decision. A
second transport must pass the same native-host conformance suite and must not
change the public W3C or authoring contract.

## Storybook device contract

### Instance manifest

Extend the current per-enlistment instance model with one generated manifest:

```ts
type DesktopStorybookDriverManifest = {
  schemaVersion: 1;
  instanceId: string;
  endpoint: 'macos' | 'windows' | 'win32';
  renderer: 'fabric' | 'paper';
  targetId: string;
  appName: string;
  displayName: string;
  testIDPrefix: string;
  storybookPort: number;
  metroPort: number;
  driverPort: number;
  platformManifestDigest: string;
  portablePlanDigest: string;
  bridgeNonce: string;
};
```

This generated projection becomes the single source for the runtime,
supervisor, server target, and smoke/test commands. Its `testIDPrefix`
originates from the consuming app's custom `app.json` Storybook identity, so
the app does not maintain a second identity file or duplicate runtime setting.

Use two digests:

1. `platformManifestDigest` covers the exact platform catalog and plans;
2. `portablePlanDigest` covers only explicitly portable stories/tests and
   excludes physical paths and platform-only metadata.

Manifests contain package names and package-relative POSIX paths. Absolute
package roots stay in process memory and are excluded from digests and agent
output.

### Required native markers

Every desktop Storybook endpoint must expose:

1. a stable application/root marker;
2. a stable story canvas/root `testID`;
3. the active story ID in native-observable state;
4. the preview generation or run ID in native-observable state.

Only the story root is a universal chrome contract. Do not require macOS or
Windows to fork upstream LiteUI merely to expose the Win32-specific sidebar,
addon, or resize-handle IDs.

### Runtime bridge

The runtime sends versioned channel events:

```ts
type DesktopBridgeEvent =
  | {
      type: 'furn:desktop:hello';
      version: 1;
      instanceId: string;
      endpoint: 'macos' | 'windows' | 'win32';
      targetId: string;
      platformManifestDigest: string;
      nonce: string;
    }
  | {
      type: 'furn:desktop:story-ready';
      requestId: string;
      runId: string;
      storyId: string;
      previewGeneration: number;
      portablePlanDigest: string;
    }
  | {
      type: 'furn:desktop:story-error';
      requestId: string;
      runId: string;
      storyId: string;
      message: string;
    };
```

The supervisor rejects wrong instance, endpoint, target, digest, nonce,
duplicate bridge, and stale reconnect messages.

Story selection:

1. authenticate the runtime hello;
2. validate the story against the platform manifest;
3. create request and run IDs;
4. issue selection through the existing Storybook channel;
5. await the correlated runtime `story-ready`;
6. verify the native story marker and preview generation;
7. wait for the native canvas root;
8. invalidate prior preview element references;
9. optionally wait for stable layout.

Each test receives a fresh run ID and remount boundary. The runtime resets local
story state and, when requested, Storybook args before acknowledging readiness.

### Story Manifest

`storybook-desktop` generates a platform-specific manifest from the same story
configuration used by the app. It must preserve data not guaranteed by the
current `/index.json` response:

- canonical story ID;
- package name and package-relative source path;
- platform membership;
- authored tags;
- extracted `parameters.desktopDriver`;
- capability requirements;
- exact-platform and portable-plan digests.

Static extraction fails loudly with file and location when a test plan is not
serializable. It must never silently omit an authored plan.

Pass the manifest to the embedded driver in memory or through an owned
generated file. Do not introduce a fourth manifest HTTP listener.

## Component-authored story tests

The primary contract is a versioned, statically serializable plan in story
parameters:

```tsx
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

export const Default: Story = {
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'pointer-and-keyboard-focus',
          title: 'Supports pointer and keyboard focus',
          requires: ['pointer', 'keyboard', 'focus'],
          steps: [
            {
              expect: {
                target: { testId: 'button-primary' },
                state: 'enabled',
              },
            },
            {
              action: 'click',
              target: { testId: 'button-primary' },
            },
            {
              expect: {
                target: { testId: 'button-primary' },
                state: 'focused',
              },
            },
            {
              action: 'keys',
              value: ['TAB'],
            },
            {
              action: 'screenshot',
              name: 'keyboard-focus',
            },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};
```

Initial actions:

- wait for target/state/stable layout;
- click and double-click;
- clear and type;
- key and W3C action sequences;
- scroll;
- update Storybook args;
- screenshot;
- capture tree/source;
- annotate evidence.

Initial assertions:

- exists/count;
- displayed;
- enabled;
- focused/focusable;
- selected/checked/mixed/expanded;
- accessible name/help;
- role;
- value/text;
- bounds;
- active element.

Rules:

- no platform branches inside a portable plan;
- differences use declarative `requires`, platform inclusion, and explicit skip
  reasons;
- selectors use stable IDs for deterministic interaction;
- plans are hashable, listable before app launch, shardable, and
  agent-readable;
- the test runner distinguishes unsupported capability from failed assertion.

Reserve a later imperative escape hatch for cases the DSL cannot express. It
must be an explicitly referenced React Native-free module, marked nonportable
or less agent-readable, and must not enter component package build/publish
output accidentally. Do not add it until real authored tests demonstrate the
need.

## Public APIs

### Typed client

```ts
const client = await createDesktopDriverClient({ url: ready.webdriverUrl });
const session = await client.newSession({
  platformName: 'windows',
  'furn:target': 'agentic-storybook-windows',
});

const story = await session.storybook.open('components-button--default');
const button = await story.find(by.testId('button-primary'));

await button.click();
await button.waitFor({ focused: true });
await story.screenshot({ name: 'focused-button' });
await story.runTest('pointer-and-keyboard-focus');
await session.delete();
```

The high-level client calls the same W3C and extension routes available to
external clients.

### WebdriverIO automation API

WebdriverIO is the sanctioned high-level test API for component authors and
automation suites. The package provides supported configuration, typed custom
commands, selectors, matchers, lifecycle integration, and Storybook commands.
The serializable story-plan DSL runs through this same WebdriverIO integration.

The W3C server remains client-neutral and does not require Appium. Validate it
with:

- a raw HTTP protocol suite;
- the low-level typed client;
- the sanctioned WebdriverIO remote client and runner.

WebdriverIO is a supported dependency of the high-level testing surface, while
the protocol server modules remain independent of it.

### Agent API

Expose coarse, JSON-safe operations:

```ts
agent.listStories();
agent.openStory(storyId);
agent.describe({ scope: 'canvas', depth: 3 });
agent.find({ testId: 'button-primary' });
agent.click({ testId: 'button-primary' });
agent.type({ testId: 'input', text: 'hello' });
agent.check({ testId: 'button-primary', role: 'button', enabled: true });
agent.screenshot({ scope: 'window', name: 'button' });
agent.runStoryTest(storyId, testId);
agent.getArtifacts();
agent.dispose();
```

`describe` returns a bounded projection containing role, name, `testID`,
supported state, bounds, and child count. Lookup failures may include bounded
nearest-ID suggestions.

Ship the typed API and JSON CLI first. MCP requires an actual executable
adapter, not only a tool-schema file. Later, add an MCP route to the driver
listener or a composed adapter owned by `storybook-desktop`; do not create a
separate MCP package.

### CLI and supervisor

`desktop-driver`:

```text
desktop-driver build-driver --platform windows|macos
desktop-driver resolve-driver --platform windows|win32|macos --json
desktop-driver doctor --platform windows|win32|macos --json
desktop-driver serve
desktop-driver tree --session <id> --json
desktop-driver screenshot --session <id> --output <path>
```

`storybook-desktop`:

```text
storybook-desktop build-driver --windows|--win32|--macos
storybook-desktop prep --windows|--win32|--macos
storybook-desktop driver --windows
storybook-desktop smoke --windows --mode stories-and-tests
storybook-desktop manifest --windows
storybook-desktop instance --windows --json
```

The Storybook supervisor:

1. resolves platform and instance identity;
2. resolves and verifies the selected native helper when the operation needs
   authored tests;
3. generates private helper and application descriptors plus Storybook
   manifests;
4. starts the channel server and embedded driver listener;
5. starts Metro when needed;
6. registers the exact target;
7. launches the app or attaches through the owner-provided runtime lease;
8. authenticates the runtime bridge;
9. runs tests or writes agent-ready connection data;
10. releases input and tears down only owned resources.

## Package shape

```text
packages/agentic/desktop-driver/
  AGENTS.md
  PLAN.md
  README.md
  SPEC.md
  package.json
  tsconfig.json
  jest.config.cjs
  config/
    cli.cjs
  native/                         # Stage 2 source; included in the npm package
    protocol.json
    PROTOCOL.md
    windows/
      DesktopDriverHost.vcxproj
      src/
    macos/
      Package.swift
      Sources/DesktopDriverHost/
  src/
    index.ts
    authoring/
      index.ts
      results.ts
      storyTests.ts
    artifacts/
      ArtifactManager.ts
      index.ts
    client/
      DesktopDriverClient.ts
      index.ts
    cli/
      createDesktopDriverCommand.ts
      index.ts
    protocol/
      actions.ts
      capabilities.ts
      constants.ts
      errors.ts
      timeouts.ts
      types.ts
    server/
      createDesktopDriverServer.ts
      index.ts
      SessionManager.ts
      TargetRegistry.ts
    host/
      types.ts
    hosts/
      fake/FakeDesktopHost.ts
      native/
        NativeDesktopHost.ts
        NativeHostProcess.ts
        index.ts
    native/
      build/
      cache/
      protocol/
      resolve/
      verify/
    runner/
      index.ts
      StoryTestRunner.ts
    wdio/
      DesktopWebdriver.ts
      index.ts
    agent/
      DesktopAgent.ts
      index.ts
    testing/
      FakeStoryOrchestrator.ts
      fakeStoryElements.ts
      index.ts
      protocolHarness.ts
```

The native stage adds platform-neutral build and process modules under
`src/native`, provider adapters under `src/hosts/native`, and checked-in source
under `native/windows` and `native/macos`. Do not create platform artifact npm
packages initially. Optional organization-built helpers use the same verified
artifact layout outside npm.

Potential subpath exports:

- `.`;
- `./authoring`;
- `./artifacts`;
- `./client`;
- `./cli`;
- `./server`;
- `./agent`;
- `./runner`;
- `./testing`;
- `./wdio`;
- `./package.json`.

Use explicit named exports. Keep platform code under `hosts`. The package
`AGENTS.md` should require no Storybook imports, no platform branching outside
host providers, exact ownership cleanup, and declared-script validation.

When implementation starts, conform to repository package rules:

- `build` is `tsc -b`;
- composite TypeScript output and build info are configured;
- workspace dependencies and project references match;
- the root project references the package;
- dependencies satisfy catalog and package-age policy;
- publishing checks and a changeset are included.

## Milestones

### Stage 1: Platform-neutral foundation

Stage 1 intentionally contains no Windows or macOS native code.

#### Phase 1: W3C core and fake host - Complete

Deliver:

- package skeleton;
- W3C router and response/error model;
- capability negotiation;
- target/session/window/element stores;
- timeouts and input state machine;
- deterministic fake host;
- raw HTTP, typed-client, and WebdriverIO contract tests.

Exit:

- a client creates and deletes a session;
- portable element, action, wait, and screenshot tests pass against the fake
  host;
- unsupported routes return explicit W3C errors.

#### Phase 2: Storybook manifests, bridge, and supervisor - Complete

Deliver:

- instance/driver manifest and driver port;
- Story Manifest and static test-plan extraction;
- `StoryOrchestrator` adapter;
- correlated runtime bridge and native story marker;
- per-test remount/reset;
- `storybook-desktop` supervisor;
- Storybook extension commands.

Exit:

- a fake host can select/reset a story and run a declarative plan;
- stale preview elements are deterministic;
- exact-platform and portable-plan digests are checked;
- no additional Node server process is required.

#### Phase 3: WebdriverIO, authoring, and agent surface - Complete

Deliver:

- public serializable story-plan schema;
- representative plans validated against the fake host;
- sanctioned WebdriverIO configuration, runner, custom commands, and matchers;
- low-level typed client;
- JSON CLI and bounded agent API;
- standardized reports and failure bundles;
- optional real MCP adapter evaluation.

Exit:

- an author can declare, list, shard, and run a plan through WebdriverIO against
  the fake host;
- an agent can list, explain, execute, and diagnose the same plan;
- protocol, authoring, artifacts, and agent APIs are stable before platform
  code is introduced.

### Stage 2: Native desktop providers

Stage 2 implements the platform contracts proven in Stage 1.

#### Phase 4A: Native build, cache, transport, and Storybook attachment - Not started

Deliver:

- checked-in native wire specification and protocol version/feature contract;
- `desktop-driver build-driver`, `resolve-driver`, and native `doctor` flows;
- target-OS toolchain discovery and strict V1 platform validation;
- compatibility-scoped, content-addressed cache, immutable selections,
  cross-process locks, exact verification, cleanup, and runtime leases;
- direct helper and managed install-root resolution without automatic download;
- long-lived framed stdio transport, correlated events, cancellation
  acknowledgements, separate cleanup deadlines, and fatal transport handling;
- Node-mirrored input state, release-only crash recovery, and an
  operating-system-level physical-input lock;
- Storybook `build-driver` and `prep` integration;
- private driver manifest schema version 2 with separate helper and application
  descriptors;
- exact Storybook runtime lease hints and `furn:launchMode: "attach"`;
- mode-specific smoke behavior that leaves `stories` independent of the helper.

Exit:

- a packed Linux npm artifact contains all native source and no native output,
  install hook, or automatic downloader;
- extracted package source builds from a read-only installation on Windows and
  macOS;
- two packages and compatible package versions request the helper concurrently
  and produce one reusable build without selection interference;
- direct path, managed install root, cache hit, source build, explicit
  prebuilt-only failure, force rebuild, corrupt artifact, stale lock, and
  in-use Windows artifact cases are deterministic;
- the exact long-lived helper process passes hash, dependency, signature-policy,
  wire, feature, and build-identity verification;
- a forced helper death after key/button-down either releases exactly the
  owned inputs or disables further physical input with an actionable failure;
- `smoke --mode stories` passes with no helper or native helper toolchain;
- `stories-and-tests` creates exactly one app, attaches to it, preserves it on
  WebDriver teardown, and leaves final cleanup to Storybook.

#### Phase 4B: Windows C++ vertical slice - Not started

Deliver:

- one C++20 x64 MSBuild helper with `/MT`, no NuGet restore, and no Windows App
  SDK dependency;
- mandatory handshake, self-test, logging, and dependency inventory;
- a windowless MTA UI Automation thread with cached bulk reads and event
  subscription/removal on the same thread;
- exact packaged and unpackaged launch/attach leases;
- window discovery, activation verification, DPI awareness, `testID` lookup,
  snapshot, focus, hit testing, physical click/key input, and release;
- HWND Windows Graphics Capture through a free-threaded D3D11 frame pool and
  WIC PNG encoding;
- Button coverage through the unchanged Storybook/WebdriverIO plan.

Exit:

- the helper depends only on an empirically frozen Windows-system import and
  loaded-module allowlist;
- the Button plan passes through the native provider on Windows Fabric and
  Win32 Paper;
- occluded capture and element crop geometry pass at 100%, 150%, and 200% DPI;
- the current hosted Windows runner is measured for UIA events, physical input,
  WGC, and cancellation; unsupported or unreliable capabilities move to a
  self-hosted interactive runner based on evidence rather than assumption.

#### Phase 4C: Complete Windows and Win32 native provider - Not started

Deliver:

- UI Automation tree and event support;
- configurable physical and accessibility click modes;
- physical keyboard, pointer, and wheel actions;
- app attach/launch leases;
- occlusion-independent HWND capture through Windows Graphics Capture;
- multi-window and Callout handling.

Exit:

- one unchanged Button, Checkbox, Input, scrolling, screenshot, and
  secondary-window suite passes on Windows Fabric and Win32 Paper;
- attached apps survive teardown;
- exact owned resources are cleaned;
- artifacts distinguish assertion, app, and host failures.

Minimized capture returns an explicit unsupported/capture-unavailable result by
default. Add restore/capture/restore only as an explicit registered-target
policy after its foreground and state-restoration effects are measured.

#### Phase 5A: macOS identity, authority, and capture gate - Not started

Deliver:

- zero-dependency Swift Package Manager executable and minimal agent app-bundle
  assembly;
- stable bundle identifier, `LSUIElement`, macOS 14 deployment target,
  `NSScreenCaptureUsageDescription`, and explicit code signing;
- direct-spawn versus Launch Services identity experiment;
- Accessibility and Screen Recording behavior across unchanged ad hoc,
  rebuilt ad hoc, Apple Development, and Developer ID signatures;
- AX window to ScreenCaptureKit window correlation experiment;
- `testID`, CGEvent, SCScreenshotManager, scale/crop, secondary-window, and
  hosted-runner authority experiments;
- comparison with the existing XCTest substrate only as a fallback gate.

Exit:

- one signed Swift helper builds through SwiftPM and can attach, find, click,
  and capture the macOS Storybook application locally;
- missing permissions fail before session creation with exact remediation;
- signing and launch choices are based on measured Accessibility and Screen
  Recording behavior rather than assumed TCC matching;
- hosted native authority is either proven repeatable or assigned to a
  self-hosted interactive runner;
- any XCTest fallback decision is explicit and carries the same native-host
  conformance requirements.

#### Phase 5B: Complete macOS native provider - Not started

Deliver:

- Swift native host transport;
- accessibility tree and events;
- configurable physical and accessibility click modes;
- keyboard and pointer actions;
- bundle-identity launch/attach;
- direct window capture;
- permission diagnostics;
- multi-window and secondary-Callout support.

Exit:

- the unchanged portable WebdriverIO suite passes on macOS 14 Apple Silicon;
- missing authority fails before session creation with actionable diagnostics;
- attached apps survive teardown;
- the chosen CI environment is repeatable.

### Stage 3: Release hardening

#### Phase 6: Release readiness - Not started

Deliver:

- wire major/minor/feature compatibility suite;
- security review;
- performance/timeout budgets;
- clean-install, extracted-package build, and package-pack validation;
- package-size review;
- dependency and platform-signature policy;
- cache corruption, stale-lock, multi-version, force-rebuild, running-artifact,
  and garbage-collection coverage;
- optional organization-built signed/notarized prebuilt pipeline using the
  managed install-root format;
- documentation, changeset, and CI promotion criteria.

Exit:

- the native build procedure, inputs, provenance, and artifact hashes are
  reproducible and auditable; byte-identical output remains a measured goal
  rather than an unsupported promise;
- source builds remain complete when no optional prebuilt pipeline exists;
- no required install scripts are needed;
- each endpoint completes at least 100 representative runs over 14 days with at
  least 99% infrastructure success, zero leaked app/helper processes, zero
  unreleased-input incidents, complete helper metadata/logs for every
  infrastructure failure, and no unexplained recurring failure signature;
- supported platform jobs are promotable to required gates.

## Validation matrix

| Capability                | macOS                                              | Windows Fabric               | Win32 Paper                            |
| ------------------------- | -------------------------------------------------- | ---------------------------- | -------------------------------------- |
| attach and preserve       | bundle/window identity                             | process/AUMID/HWND           | process/HWND                           |
| launch and owned cleanup  | provider-defined                                   | packaged activation          | prebuilt-host provider                 |
| `testID` lookup           | verify AX mapping                                  | verify UIA mapping           | current UIA smoke establishes baseline |
| role/name/state           | AX; XCTest only if selected fallback               | UIA                          | UIA                                    |
| pointer input             | CGEvent; XCTest only if selected fallback          | SendInput                    | SendInput                              |
| keyboard/Unicode          | CGEvent; XCTest only if selected fallback          | SendInput                    | SendInput                              |
| wheel/scroll              | provider capability                                | SendInput/UIA                | SendInput/UIA                          |
| window screenshot         | ScreenCaptureKit; XCTest only if selected fallback | WGC                          | WGC                                    |
| element screenshot        | crop with scale                                    | crop with DPI                | crop with DPI                          |
| multiple windows          | app windows                                        | HWNDs                        | REX/Callout HWNDs                      |
| story select/reset        | channel bridge                                     | channel bridge               | channel bridge                         |
| stale preview detection   | generation + native liveness                       | generation + native liveness | generation + native liveness           |
| app/render error          | bridge + process watch                             | bridge + process watch       | bridge + process watch                 |
| permission/desktop doctor | TCC/test authority                                 | interactive session/UIPI     | interactive session/UIPI               |

Build and resolution validation:

| Scenario                         | Expected result                                                        |
| -------------------------------- | ---------------------------------------------------------------------- |
| Linux package pack               | native source present; native outputs and install hooks absent         |
| read-only package installation   | build succeeds with all scratch/output under the native store          |
| two packages request one helper  | one build and one selected compatible artifact                         |
| two compatible package versions  | independent compatibility-scoped selections without overwrite          |
| Windows and Win32                | identical Windows helper artifact                                      |
| direct helper override           | explicit verification; invalid selection hard-fails without fallback   |
| managed install root             | confined relative paths, publisher trust policy, hashes, and handshake |
| source build disabled            | deterministic machine-readable failure before Metro or app launch      |
| concurrent build                 | one publisher; waiters adopt the verified winner                       |
| force rebuild                    | new immutable selection; running executables remain untouched          |
| actual helper startup            | rehash/signature policy plus handshake on the long-lived child         |
| render-only smoke                | no helper resolution or WebDriver listener                             |
| authored-test smoke              | exact attached application lease; app survives session teardown        |
| hard helper failure during input | exact release-only recovery or physical input is disabled              |

Also validate:

- Windows 11 x64;
- macOS 14 on Apple Silicon;
- Windows 100%, 150%, and 200% scaling;
- Retina and non-Retina macOS where supported;
- multiple monitors and non-primary virtual-desktop origins;
- light, dark, and high-contrast themes;
- foreground, background, minimized, and occluded windows;
- default non-mutating failure for minimized capture;
- denied macOS permissions;
- elevated Windows targets;
- locked/disconnected desktops;
- duplicate matching windows;
- secondary Callout windows;
- channel reconnect, duplicate runtime, stale nonce, and wrong digest;
- app and host failure during a command;
- port collision and parallel enlistments;
- concurrent independent driver processes contending for physical input;
- raw HTTP, first-party, and WebdriverIO clients.

Pilot stories:

- Button pointer and keyboard focus;
- Checkbox checked/indeterminate state;
- Input type and clear;
- scrollable content;
- a secondary Callout window;
- a controlled failure for artifact verification.

## Security and reliability

- Bind loopback only by default.
- Reject browser-origin requests; do not enable permissive CORS.
- Require explicit authentication and configuration for any non-loopback bind.
- Use server-registered targets, not client-supplied commands.
- Never accept helper paths, cache roots, install roots, signing identities,
  app paths, launch arguments, or lease paths from WebDriver capabilities.
- Scope trees and screenshots to registered target windows.
- Cap request body size, tree depth/node count, screenshot dimensions, command
  deadlines, and retained logs.
- Confine artifact paths beneath an owned run root; reject absolute paths,
  traversal, Windows device/alternate-stream paths, and symlink escapes.
- Redact environment variables and physical roots from public diagnostics.
- Resolve selected helpers to real paths, verify the actual long-lived process,
  and quarantine failing cache artifacts.
- Require configured publisher identities for organization-managed prebuilts;
  hashes stored beside an artifact are not a publisher trust boundary.
- Record PID plus process creation time.
- Never kill by process name or fixed port.
- Preserve attached applications.
- Release all input state on every teardown path.
- Mirror depressed input in Node, use restricted release-only recovery after a
  helper crash, and block further physical input if recovery cannot be proven.
- Serialize physical input both inside the Node server and across independent
  native helper processes on the same interactive desktop.
- Run automation only in an interactive desktop session.
- Treat screenshots and accessibility trees as potentially sensitive evidence.

## Principal risks

| Risk                                                        | Mitigation                                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| platform state projection differs                           | capability-gated assertions; unsupported is not false                                         |
| native element identity changes on remount                  | session UUIDs, liveness checks, preview generations                                           |
| physical input is global and flaky                          | in-process mutex, OS-level lock, foreground verification, serialized actions                  |
| helper dies while input is depressed                        | Node ledger, bounded cancel cleanup, restricted release-only recovery, disable on uncertainty |
| macOS authority differs locally and in CI                   | signing/launch/TCC matrix, fail-fast doctor, explicit XCTest fallback gate                    |
| composited-window capture is backend-specific               | direct capture gate before advertising screenshots                                            |
| shared native cache is corrupted or races                   | immutable artifacts, compatibility-scoped selections, locks, hashes, quarantine               |
| native C++ raises maintenance cost                          | narrow protocol surface, RAII, shared conformance tests, measured NativeAOT re-entry gate     |
| optional prebuilt is substituted                            | explicit origin policy, configured publisher identity, hash and live handshake                |
| hosted runners differ from local desktops                   | capability-specific hosted spikes with self-hosted fallback only where measured               |
| Storybook channel is broadcast-oriented                     | nonce/instance/digest handshake plus native marker verification                               |
| static test extraction misses dynamic values                | literal schema and loud file/location errors                                                  |
| authored DSL becomes too limited                            | add an imperative escape hatch only from demonstrated cases                                   |
| agent/server can control a real desktop                     | loopback, origin rejection, target registry, bounded APIs                                     |
| Storybook upgrades change channel behavior                  | isolate behind adapter and contract tests                                                     |
| sanctioned WebdriverIO surface drifts from raw W3C behavior | run the same contract cases through raw HTTP and WebdriverIO                                  |

## Open questions

1. **Imperative test escape hatch:** What concrete scenarios must the initial
   serializable DSL support before an executable sidecar is justified?
2. **MCP:** Is typed API plus JSON CLI enough for the initial agent experience,
   or is a real MCP endpoint required for the first release?
3. **Hosted Windows capability:** Which of UIA events, physical input, WGC, and
   cancellation are repeatable on the current hosted runner, and which require
   a self-hosted interactive machine?
4. **macOS authority:** Does the directly spawned bundled helper receive stable
   Accessibility and Screen Recording identity across the supported signing
   modes, and can the hosted runner provide repeatable authority?
5. **macOS fallback:** If the direct Swift helper cannot satisfy required
   hosted authority, does the existing XCTest substrate justify a second
   transport after shared conformance cost is measured?
6. **Minimized capture:** Should registered targets be allowed to opt into a
   restore/capture/restore policy, or should minimized windows always return an
   explicit capture-unavailable result?

## Future considerations

### Visual testing

V1 captures screenshots and complete scale/window/story metadata as evidence.
Baseline storage, image comparison, tolerances, approval workflows, and
cross-platform visual-diff policy are deferred until native capture fidelity
has been proven on all endpoints.

### Legacy E2E migration

The initial effort does not migrate or retire the existing Appium E2E harness.
After the new driver reaches platform and scenario parity, evaluate incremental
migration, dual-running duration, and retirement criteria as a separate
project.

### Additional platforms and concurrency

V1 supports Windows 11 x64 and macOS 14 on Apple Silicon, with one active
session per physical target. Windows 10, Windows ARM64, Intel/universal macOS,
and concurrent sessions are future expansion work.

## References

- [W3C WebDriver](https://www.w3.org/TR/webdriver2/)
- [Apple Accessibility for macOS](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/)
- [AXUIElement](https://developer.apple.com/documentation/applicationservices/axuielement)
- [Quartz Event Services](https://developer.apple.com/documentation/coregraphics/quartz-event-services)
- [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit)
- [SCScreenshotManager](https://developer.apple.com/documentation/screencapturekit/scscreenshotmanager)
- [Swift ABI stability on Apple platforms](https://www.swift.org/blog/abi-stability-and-apple/)
- [Swift Package Manager build settings](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0238-package-manager-build-settings.md)
- [Inside Code Signing: Requirements](https://developer.apple.com/documentation/technotes/tn3127-inside-code-signing-requirements)
- [XCUIApplication](https://developer.apple.com/documentation/xcuiautomation/xcuiapplication)
- [Microsoft UI Automation](https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32)
- [UI Automation threading](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-threading)
- [UI Automation caching](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-cachingforclients)
- [UI Automation and screen scaling](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-screenscaling)
- [UI Automation control patterns](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-controlpatternsoverview)
- [SendInput](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput)
- [Windows screen capture](https://learn.microsoft.com/en-us/windows/apps/develop/media-authoring-processing/screen-capture)
- [Create a capture item for an HWND](https://learn.microsoft.com/en-us/windows/win32/api/windows.graphics.capture.interop/nf-windows-graphics-capture-interop-igraphicscaptureiteminterop-createforwindow)
- [Use C++/WinRT](https://learn.microsoft.com/en-us/windows/uwp/cpp-and-winrt-apis/)
- [Use the static multithreaded runtime](https://learn.microsoft.com/en-us/cpp/build/reference/md-mt-ld-use-run-time-library)
- [Windows Imaging Component](https://learn.microsoft.com/en-us/windows/win32/wic/-wic-about-windows-imaging-codec)
- [Modern .NET deployment](https://learn.microsoft.com/en-us/dotnet/core/deploying/)
- [Native AOT interop](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/interop)
- [Windows App SDK](https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/)
- [WinAppCLI NativeAOT reference implementation](https://github.com/microsoft/winappCli)
