# Desktop Driver Plan

## Status

Initial architecture plan. This document starts from the current checked-out
tree and public platform/protocol documentation. It does not depend on work
from other branches.

The effort starts with the platform-neutral protocol, fake host, Storybook
orchestration, WebdriverIO authoring, and agent contracts. Windows and macOS
native code is an explicit later stage, so native transport, signing, and
distribution choices do not block the initial implementation.

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

| Condition | WebDriver error |
| --- | --- |
| target cannot launch or attach | `session not created` |
| missing/closed session | `invalid session id` |
| missing/closed window | `no such window` |
| lookup does not resolve | `no such element` |
| retained native node is detached/replaced | `stale element reference` |
| malformed locator | `invalid selector` |
| disabled, unfocusable, or empty-bounds target | `element not interactable` |
| another node owns the hit-tested point | `element click intercepted` |
| capture backend fails | `unable to capture screen` |
| deadline expires | `timeout` |
| capability/property/operation is unavailable | `unsupported operation` |

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
type SupportedValue<T> =
  | { supported: true; value: T }
  | { supported: false; reason: string };
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

Keep the transport replaceable behind `DesktopHost`. Do not make an unproven
FFI library or an unsigned native binary a permanent API decision.

The initial stage contains no Windows or macOS native code. It delivers the
complete protocol, fake host, Storybook integration, WebdriverIO authoring
surface, agent API, and native-host contract using TypeScript/Node only.

Native platform providers are a separate second delivery stage:

- Windows 11 x64 and Win32 Paper share a Windows provider built around UI
  Automation, configurable physical/accessibility interaction, app/window
  ownership, and occlusion-independent Windows Graphics Capture;
- macOS 14 on Apple Silicon receives a provider selected to preserve the
  required local and hosted-CI authority while implementing the same host
  contract;
- native build, signing, notarization, and artifact distribution are scoped to
  that stage rather than prerequisites for the platform-neutral package.

### Current constraints

- package installation scripts are disabled;
- new dependencies must satisfy the repository age policy;
- public packages are built and packed on Linux;
- the current publish pipeline does not build, sign, or notarize Windows/macOS
  native artifacts;
- current macOS E2E uses a Mac2/XCTest substrate on hosted macOS CI;
- current Win32 Storybook smoke uses in-box Windows UI Automation from
  PowerShell on hosted Windows CI.

### Native-stage feasibility gates

Evaluate at least these options against the same host contract:

| Endpoint | Candidate | Purpose |
| --- | --- | --- |
| Windows/Win32 | long-lived PowerShell UIA worker with P/Invoke input | zero-published-binary baseline |
| Windows/Win32 | C++/WinRT helper using UIA, SendInput, and WGC | highest-fidelity capture and typed native implementation |
| macOS local | direct AX/CGEvent transport | fast developer attach loop, requires TCC |
| macOS CI | first-party XCTest-based transport | preserve hosted-CI automation without Appium |
| macOS | Swift helper using AX, CGEvent, and ScreenCaptureKit | stable native implementation if build/signing is funded |

Before native implementation begins, the stage must answer:

- Can the candidate be built, packaged, and invoked through declared repository
  scripts without install-time compilation?
- What identity receives Accessibility and Screen Recording permission?
- Can hosted CI grant or inherit the required authority?
- Can it enumerate and interact with current app windows?
- Does physical pointer/keyboard input reach React Native controls?
- Can it capture composited window content when occluded, scaled, and spread
  across monitors? Occlusion-independent capture is required for the Windows
  provider in this stage.
- Can it capture secondary Callout windows?
- What is its cold-start and command latency?
- How are native errors and events represented?

Current direction:

- keep these platform experiments out of the initial implementation;
- start the native Windows/Win32 stage with a long-lived PowerShell UIA worker
  as a contract probe because the current tree proves that substrate can
  inspect Win32 on hosted CI;
- implement Windows.Graphics.Capture or equivalent direct HWND capture as part
  of that same native stage before advertising full screenshot support;
- retain an XCTest-backed macOS CI transport unless a non-Appium replacement
  proves the same hosted-runner authority;
- allow a raw AX/CGEvent macOS provider for local attach workflows;
- introduce signed Swift/C++ helpers only within the native stage and only
  after build/sign/notarization and artifact-package ownership are approved.

Using XCTest as an internal host transport does not make Appium part of the
authoring or wire contract; the package still owns the W3C server, sessions,
capabilities, errors, and public APIs.

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

This becomes the single source for the runtime, supervisor, server target, and
smoke/test commands. In particular, it removes duplicate `testIDPrefix`
configuration.

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
desktop-driver serve
desktop-driver doctor --target <id> --json
desktop-driver tree --session <id> --json
desktop-driver screenshot --session <id> --output <path>
```

`storybook-desktop`:

```text
storybook-desktop driver --windows
storybook-desktop test --windows [--story <glob>] [--tag <tag>]
storybook-desktop agent --windows
storybook-desktop manifest --windows
storybook-desktop instance --windows --json
```

The Storybook supervisor:

1. resolves platform and instance identity;
2. generates manifests;
3. starts the channel server and embedded driver listener;
4. starts Metro when needed;
5. registers the exact target;
6. launches or attaches the app;
7. authenticates the runtime bridge;
8. runs tests or writes agent-ready connection data;
9. releases input and tears down only owned resources.

## Proposed package shape

```text
packages/agentic/desktop-driver/
  AGENTS.md
  PLAN.md
  README.md
  SPEC.md
  package.json
  tsconfig.json
  jest.config.cjs
  eslint.config.js
  config/
    cli.cjs
  src/
    index.ts
    authoring/
      index.ts
      selectors.ts
      storyTests.ts
      results.ts
    client/
      DesktopDriverClient.ts
      DesktopSession.ts
      DesktopElement.ts
    protocol/
      routes.ts
      codecs.ts
      capabilities.ts
      errors.ts
      elements.ts
      actions.ts
    server/
      createDesktopDriverServer.ts
      SessionManager.ts
      CommandQueue.ts
      TargetRegistry.ts
      ArtifactManager.ts
    host/
      DesktopHost.ts
      protocol.ts
      types.ts
      errors.ts
    hosts/
      fake/
    runner/
      StoryTestRunner.ts
      assertions.ts
      waits.ts
    agent/
      DesktopAgent.ts
      describe.ts
    testing/
      FakeDesktopHost.ts
      protocolHarness.ts
```

The later native stage adds `hosts/windows` and `hosts/macos`, plus any
platform artifact packages approved by the native distribution design.

Potential subpath exports:

- `.`;
- `./authoring`;
- `./client`;
- `./server`;
- `./agent`;
- `./testing`;
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

#### Phase 1: W3C core and fake host

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

#### Phase 2: Storybook manifests, bridge, and supervisor

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

#### Phase 3: WebdriverIO, authoring, and agent surface

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

#### Phase 4: Windows and Win32 native provider

Deliver:

- selected Windows host transport;
- UI Automation tree and event support;
- configurable physical and accessibility click modes;
- physical keyboard, pointer, and wheel actions;
- app attach/launch leases;
- occlusion-independent HWND capture through Windows Graphics Capture or an
  equivalent native implementation;
- multi-window and Callout handling.

Exit:

- one unchanged Button, Checkbox, Input, scrolling, screenshot, and
  secondary-window suite passes on Windows Fabric and Win32 Paper;
- attached apps survive teardown;
- exact owned resources are cleaned;
- artifacts distinguish assertion, app, and host failures.

Land the first platform jobs as non-required until reliability and artifact
quality are established.

#### Phase 5: macOS native provider

Deliver:

- selected local and CI transport(s);
- accessibility tree and events;
- configurable physical and accessibility click modes;
- keyboard and pointer actions;
- bundle-identity launch/attach;
- direct window capture;
- permission diagnostics;
- XCTest-backed provider if required to preserve hosted CI.

Exit:

- the unchanged portable WebdriverIO suite passes on macOS 14 Apple Silicon;
- missing authority fails before session creation with actionable diagnostics;
- attached apps survive teardown;
- the chosen CI environment is repeatable.

### Stage 3: Release hardening

#### Phase 6: Release readiness

Deliver:

- protocol compatibility suite;
- security review;
- performance/timeout budgets;
- clean-install and package-pack validation;
- package-size review;
- helper signing/notarization and artifact packages if selected;
- documentation, changeset, and CI promotion criteria.

Exit:

- public package contents are reproducible;
- native artifacts have an owned build/signing pipeline;
- no required install scripts are needed;
- supported platform jobs are promotable to required gates.

## Validation matrix

| Capability | macOS | Windows Fabric | Win32 Paper |
| --- | --- | --- | --- |
| attach and preserve | bundle/window identity | process/AUMID/HWND | process/HWND |
| launch and owned cleanup | provider-defined | packaged activation | prebuilt-host provider |
| `testID` lookup | verify AX mapping | verify UIA mapping | current UIA smoke establishes baseline |
| role/name/state | AX/XCTest | UIA | UIA |
| pointer input | CGEvent/XCTest | SendInput | SendInput |
| keyboard/Unicode | CGEvent/XCTest | SendInput | SendInput |
| wheel/scroll | provider capability | SendInput/UIA | SendInput/UIA |
| window screenshot | SCK/XCTest/provider | WGC/provider | WGC/provider |
| element screenshot | crop with scale | crop with DPI | crop with DPI |
| multiple windows | app windows | HWNDs | REX/Callout HWNDs |
| story select/reset | channel bridge | channel bridge | channel bridge |
| stale preview detection | generation + native liveness | generation + native liveness | generation + native liveness |
| app/render error | bridge + process watch | bridge + process watch | bridge + process watch |
| permission/desktop doctor | TCC/test authority | interactive session/UIPI | interactive session/UIPI |

Also validate:

- Windows 11 x64;
- macOS 14 on Apple Silicon;
- Windows 100%, 150%, and 200% scaling;
- Retina and non-Retina macOS where supported;
- multiple monitors and non-primary virtual-desktop origins;
- light, dark, and high-contrast themes;
- foreground, background, minimized, and occluded windows;
- denied macOS permissions;
- elevated Windows targets;
- locked/disconnected desktops;
- duplicate matching windows;
- secondary Callout windows;
- channel reconnect, duplicate runtime, stale nonce, and wrong digest;
- app and host failure during a command;
- port collision and parallel enlistments;
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
- Scope trees and screenshots to registered target windows.
- Cap request body size, tree depth/node count, screenshot dimensions, command
  deadlines, and retained logs.
- Confine artifact paths beneath an owned run root; reject absolute paths,
  traversal, Windows device/alternate-stream paths, and symlink escapes.
- Redact environment variables and physical roots from public diagnostics.
- Record PID plus process creation time.
- Never kill by process name or fixed port.
- Preserve attached applications.
- Release all input state on every teardown path.
- Run automation only in an interactive desktop session.
- Treat screenshots and accessibility trees as potentially sensitive evidence.

## Principal risks

| Risk | Mitigation |
| --- | --- |
| platform state projection differs | capability-gated assertions; unsupported is not false |
| native element identity changes on remount | session UUIDs, liveness checks, preview generations |
| physical input is global and flaky | one input owner, foreground verification, serialized actions |
| macOS authority differs locally and in CI | native-stage dual-transport evaluation and fail-fast doctor |
| composited-window capture is backend-specific | direct capture gate before advertising screenshots |
| native artifacts cannot be built by current publish pipeline | keep binaries off critical path until an owned pipeline exists |
| Storybook channel is broadcast-oriented | nonce/instance/digest handshake plus native marker verification |
| static test extraction misses dynamic values | literal schema and loud file/location errors |
| authored DSL becomes too limited | add an imperative escape hatch only from demonstrated cases |
| agent/server can control a real desktop | loopback, origin rejection, target registry, bounded APIs |
| Storybook upgrades change channel behavior | isolate behind adapter and contract tests |
| sanctioned WebdriverIO surface drifts from raw W3C behavior | run the same contract cases through raw HTTP and WebdriverIO |

## Open questions

1. **Imperative test escape hatch:** What concrete scenarios must the initial
   serializable DSL support before an executable sidecar is justified?
2. **MCP:** Is typed API plus JSON CLI enough for the initial agent experience,
   or is a real MCP endpoint required for the first release?
3. **CI promotion:** What duration and pass-rate threshold should move new
    desktop-driver jobs from advisory to required?

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
- [XCUIApplication](https://developer.apple.com/documentation/xcuiautomation/xcuiapplication)
- [Microsoft UI Automation](https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32)
- [UI Automation control patterns](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-controlpatternsoverview)
- [SendInput](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput)
- [Windows screen capture](https://learn.microsoft.com/en-us/windows/apps/develop/media-authoring-processing/screen-capture)
