# Desktop driver design

This document defines the implemented architecture and invariants of
`@fluentui-react-native/desktop-driver`.

- [README.md](./README.md) introduces the package.
- [USAGE.md](./USAGE.md) contains operating recipes.
- [NEXT-STEPS.md](./NEXT-STEPS.md) is the only unfinished-work list.
- [`src/README.md`](./src/README.md) describes maintainer module boundaries.

## Goals

The package provides one deterministic test-authoring model for React Native Windows and React
Native macOS:

- one shared `*.spec.ts` source runs unchanged on both platforms;
- tests use normal WebdriverIO APIs;
- platform selection, native host startup, and capabilities stay outside shared tests;
- launch and attach have explicit ownership;
- stories declare serializable inline tests or link ordinary specs;
- WDIO and Storybook runs share reporting and lifecycle contracts, while standalone sessions use
  the same ownership-safe host and leave runner-specific reporting to the caller; and
- non-interactive agents can discover, start, observe, cancel, and clean up runs safely.

The package does not automate mobile, browsers, or React Native Web; replace Storybook unit tests;
provide visual-diff infrastructure; schedule devices; expose arbitrary shell execution; or create
a second element/session API.

## System topology

### Direct WDIO or standalone session

```text
WDIO runner or standalone client
              │ W3C WebDriver on loopback
              ▼
isolated single-driver child
       ├─ Mac2Driver ── WebDriverAgentMac
       ├─ NovaWindowsDriver ── Windows PowerShell
       └─ FakeDriver ── package-owned W3C routes
              │
              ▼
React Native application
```

The child hosts exactly one backend. Driver classes and Appium base-driver types do not cross the
process boundary. The package does not run the Appium CLI, extension manager, or multi-driver
router.

### Storybook on-device run

```text
React Native Storybook app
              │ versioned channel events
              ▼
desktop-driver host
  ├─ Storybook channel and MCP server
  ├─ RunCoordinator (one active run)
  └─ one owned WDIO runner
         └─ isolated single-driver child
```

Metro remains a separate explicit bundle server. There is no secondary tokenized run server.

## Module architecture

| Module                                        | Responsibility                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| [`src/core/`](./src/core/README.md)           | Runtime-neutral session, reporting, and loopback contracts             |
| [`src/config/`](./src/config/README.md)       | Project schema, loading, validation, fingerprints, and projections     |
| [`src/protocol/`](./src/protocol/README.md)   | React-Native-safe host/app wire contract                               |
| [`src/storybook/`](./src/storybook/README.md) | Static story discovery and generated tests                             |
| [`src/server/`](./src/server/README.md)       | Host composition, coordination, runner, and native WebDriver child     |
| [`src/wdio/`](./src/wdio/README.md)           | WDIO config, lifecycle facade, commands, readiness, and standalone API |
| [`src/cli/`](./src/cli/README.md)             | JSON command-line interface                                            |
| [`src/platforms/`](./src/platforms/README.md) | Explicit non-portable extensions                                       |
| [`src/testing/`](./src/testing/README.md)     | In-process fake session for package tests                              |

Dependency direction is enforced by `import-boundaries.test.ts`. Protocol has no Node dependency;
core and platform modules do not import WDIO/server implementation; server does not import the WDIO
service layer; and Appium imports remain isolated in `server/webdriver/backends.ts`.

## Public surface

| Export               | Responsibility                                                    |
| -------------------- | ----------------------------------------------------------------- |
| package root         | `byTestId`, `story`, plan/error/result types                      |
| `/config`            | Data-only config schema and Storybook story projection            |
| `/config/node`       | Config loading, resolution, fingerprint, WDIO/server projection   |
| `/protocol`          | Channel constants, payloads, and runtime decoders                 |
| `/wdio`              | WDIO config, service, commands, inline plans, standalone sessions |
| `/server`            | Config-driven Storybook desktop host                              |
| `/storybook`         | Static manifest and generated-spec tooling                        |
| `/macos`, `/windows` | Explicit platform-only execute extensions                         |

The CLI is exposed through `bin`, not a package subpath. Native host internals and test helpers are
not exported.

## Project config

One schema-versioned `desktop.config.ts` is authoritative for:

- application manifest and readiness `testID`;
- Storybook source globs and channel endpoint;
- generated, fake-scene, artifact, framework, session, and runner settings;
- environment variable names; and
- fake, macOS, and Windows target defaults.

### Validation

The loader:

- rejects unknown keys;
- validates every platform block;
- checks enums, strings, booleans, ports, and timeouts;
- allows only loopback listeners;
- canonicalizes existing input paths;
- confines output to `rootDir`;
- resolves and validates application-manifest field references;
- reports non-sensitive source provenance; and
- verifies generated manifest fingerprints.

Platform overrides cannot change discovery inputs. The same config therefore produces one portable
manifest on Windows and macOS.

### Generated transaction

Generation statically scans configured story globs and creates:

1. `desktop-runtime.generated.ts`;
2. `story-plans.generated.spec.ts`; and
3. `story-tests.manifest.json` last as the commit marker.

The manifest digest covers normalized IDs, tags, plans, relative paths, linked spec bytes, and the
config fingerprint. Consumers recompute and validate it before execution.

## Portable test contract

A shared spec:

- has no platform branch;
- imports no platform extension;
- uses the documented portable matrix;
- runs from the same source path on both platforms; and
- uses normal framework discovery, hooks, assertions, retries, and page objects.

Shared-spec paths are expanded and rejected when the spec itself is platform-named. Checkout path
segments do not affect that decision.

### Selectors

React Native maps `testID` to UI Automation `AutomationId` on Windows and accessibility identifier
on macOS. `byTestId()` validates and emits the W3C accessibility-ID selector.

Priority:

1. `testID`;
2. role plus accessible name;
3. accessible name;
4. visible text as an explicit fallback; and
5. platform-only selectors in platform-only suites.

XPath, predicate strings, class chains, layout order, and coordinates are not portable.

### Commands

Standard WebdriverIO owns lookup, display/enabled/selected state, click, values, text, waits, source,
and screenshots. `browser.desktop` adds only operations that native drivers cannot express through
browser DOM scripts or that expose package lifecycle:

- session info;
- app-state waits;
- scoped artifact capture;
- Storybook select/wait;
- native focus; and
- native scroll.

The versioned matrix is reported at runtime. A missing required command is an infrastructure error.
Mac2 omits `isEnabled` for React Native macOS Fabric 0.81 because AXEnabled is not reliable; shared
tests assert disabled inertness instead.

## Ownership

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

Only launch grants permission to stop the application. Attach records the app/window as external.

Protected capabilities prevent consumers from weakening routing or cleanup. Ownership records
every resource the package can positively observe: self-owned driver-host processes and ports, plus
externally owned Windows windows/app PIDs found during attach discovery. Some native backends do
not expose application or native-driver PIDs; the package does not manufacture those records.
Cleanup never targets process names, attempts graceful shutdown first, uses deadlines, escalates
only for self-owned resources, and appends cleanup failures to the primary result.

### Windows attach discovery

NovaWindows attaches with `appium:appTopLevelWindow`.

1. A temporary root-desktop session enumerates top-level windows.
2. Window attributes are read with bounded concurrency.
3. PID, handle, identity, or title must select exactly one candidate.
4. Exact title wins over substring.
5. The temporary session is always deleted.
6. The normalized handle starts the real application session.

Handles are never cached across runs.

### macOS attach

Mac2 attach currently accepts only bundle identity. PID, title, and native-window selectors fail
validation until a verified discovery path exists.

## Lifecycle and readiness

```text
created → starting|attaching → connected → ready → stopping → stopped
                                ├─ exited
                                ├─ crashed
                                └─ timed_out
```

Readiness can require:

- observed application window/state;
- responsive WebDriver session;
- Storybook channel; and
- visible application-shell `testID`.

Windows observes a discovered handle. Mac2 queries XCTest application state because it has no
window-handles route.

Post-readiness monitoring prevents driver-host death, and death of any app PID the backend exposed,
from producing a passing run. Backends that do not expose an app PID cannot provide process-level
app monitoring; native Phase 6 evidence must state that limitation. Attach closure emits
session-close events, not application-shutdown events.

## Run and report model

`sessionStrategy: 'suite'` groups exact manifest specs into one WDIO worker and warm session.
`sessionStrategy: 'spec'` writes isolated worker reports that the launcher merges.

Result status is:

- `passed`
- `failed`
- `skipped`
- `cancelled`
- `timed_out`
- `infrastructureError`

Configuration, ownership, capability, driver, transport, spawn, readiness, and monitor failures are
infrastructure errors. App-under-test crashes are test failures with distinct lifecycle reason.
Timeout and cancellation remain distinct.

Startup and readiness failures write lifecycle, `run.json`, and JUnit even before a session exists.
Framework results stream from workers through a private marker protocol that tolerates WDIO's
worker-prefix logging. Completed worker artifacts remain the final source of truth.

`captureArtifacts()` returns only files captured by that call. Root reports include worker, startup,
and cleanup results. Event payloads are bounded/redacted; complete `run.json` is not truncated.

## Storybook model

Story modules are parsed, never executed.

- **Inline plan:** a closed serializable action set compiled into a generated WDIO test.
- **Linked spec:** arbitrary host-side TypeScript with the exact generated story tag.

The app never receives code, commands, paths, or grep expressions.

The host uses Storybook's maintained `createChannelServer` and publishes:

| Event                    | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `desktopTestHostReady`   | Service identity, manifest, tested stories, capabilities |
| `desktopTestHostClosing` | Invalidate current host                                  |
| `desktopTestRunRequest`  | Request selected/all tests                               |
| `desktopTestRunStatus`   | Ordered progress and terminal status                     |
| `desktopTestRunCancel`   | Cancel active run                                        |

The coordinator reserves the single active slot synchronously, validates protocol/service/manifest
and story IDs, owns cancellation, and isolates broken channel clients from run state.

## Native host

The native child:

- binds only loopback;
- validates an allowlisted config;
- constructs one backend;
- strips inherited Node loader hooks;
- bounds startup output buffers;
- exits when its parent disappears;
- removes temporary work directories it owns; and
- returns W3C errors for malformed or oversized bodies without destroying later serviceability.

`backends.ts` is the only Appium driver-author import site. The package-owned W3C route host remains
the stable fake-backend and future-hosting boundary.

## Security invariants

- listeners are loopback-only;
- attach never grants termination ownership;
- cleanup never targets a process name;
- routing/ownership capabilities cannot be overridden;
- device values cannot become commands, paths, or code;
- inline plans use a closed schema and `testID`;
- arbitrary platform execution stays outside the portable API;
- artifacts stay inside the run directory and sensitive fields are redacted; and
- config, protocol, manifest, endpoint, and host versions are validated at boundaries.

## Validation

1. Unit tests cover config, protocol, lifecycle, ownership, reporting, process supervision, and
   boundaries.
2. Fake contract tests exercise W3C commands, Storybook control, generated plans, progress, and
   artifacts.
3. Shared native tests run one unchanged manifest on macOS and Windows.
4. Platform-specific proof covers native launch/attach, process ownership, input, screenshots,
   cancellation, and prerequisites.

Fake success is necessary but not sufficient for native compatibility.

## Alternatives

- **WinAppDriver:** retained only in the app's temporary legacy regression harness; not a supported
  desktop-driver backend.
- **Private Appium server:** excluded unless Appium 4 forces an explicit, reviewed hosting change.
- **`agent-device`:** useful for macOS exploration, not a cross-platform deterministic suite.
- **MCP:** an optional projection of stable operations, never the internal run transport.

## Maintainer constraints

- use explicit named exports;
- keep backend imports out of neutral modules;
- keep entry-only `import.meta` behavior out of Jest-loaded modules;
- keep generated files and artifacts uncommitted;
- preserve primary failures when cleanup also fails;
- run clean build and pack inspection after file moves or export changes; and
- update this document when process topology, ownership, protocol, portability, or security changes.
