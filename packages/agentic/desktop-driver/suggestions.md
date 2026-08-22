# Desktop driver refactoring suggestions

> Implementation status: Phases 0-5 were substantially implemented on the
> `user/jasonvmo/test-driver` branch. The common config, RN-safe protocol, direct run coordinator,
> consolidated `src/server` layout, relocatable manifests, narrowed exports, and Storybook
> migration are now present. Remaining follow-ups include result taxonomy and app-side CI coverage
> in addition to native platform proof and retirement of the Windows compatibility harness.

This document combines two independent architecture reviews of
`packages/agentic/desktop-driver` and its integration in `apps/storybook`, followed by a
cross-review of both proposals.

The package already has the important product boundaries: portable WebdriverIO tests, explicit
launch-versus-attach ownership, loopback-only communication, isolated native drivers, static
Storybook test discovery, and a deterministic fake backend. The main opportunity is to make those
capabilities easier to understand and configure by reducing duplicated declarations and narrowing
the public surface.

## Executive recommendation

Refactor toward four clear user-facing concepts:

1. **Project config** - one versioned `desktop.config.ts` describes the app, Storybook sources,
   desktop tests, runner, channel, readiness, artifacts, and platform targets.
2. **Protocol** - one React-Native-safe package subpath owns channel event names, payload types,
   runtime decoders, and protocol versions.
3. **Desktop host** - one public server API owns the Storybook channel, run coordination, runner
   processes, and native WebDriver child hosts.
4. **WebdriverIO integration** - one high-level factory derives its inputs from the resolved project
   config and manifest rather than repeating discovery and target configuration.

The structural refactor should follow the reporting and native-platform work already ordered ahead
of consolidation in [NEXT-STEPS.md](./NEXT-STEPS.md). Moving files before results, lifecycle, and
cleanup are truthful would make regressions harder to detect.

## Current-state findings

### Configuration is repeated across too many surfaces

The same conceptual project definition is currently spread across:

- Storybook story globs in `apps/storybook/src/main.ts`;
- desktop manifest roots and host arguments in `apps/storybook/package.json`;
- spec roots, app targets, readiness, artifacts, grep, and channel settings in
  `apps/storybook/wdio.conf.ts`;
- the channel endpoint in `apps/storybook/src/StorybookApp.tsx`;
- protocol constants and payload checks in `apps/storybook/src/useDesktopTestHost.ts`;
- app identity and display name in both `apps/storybook/app.json` and test configuration;
- port and target values in `apps/storybook/scripts/start-windows-agent-session.ps1`;
- a second Storybook REST client in `apps/storybook/scripts/storybook-client.cjs`; and
- story and test IDs in the fake scene and legacy Windows smoke catalog.

Adding a story root, changing the host port, renaming the app, or changing the readiness selector
therefore requires coordinated edits with no single validation point.

### Server and communication responsibilities are fragmented

A Storybook-triggered run currently involves three listener roles:

1. the Storybook channel/MCP server;
2. an ephemeral tokenized HTTP run coordinator in the same process; and
3. one native WebDriver server per WDIO run.

The channel bridge calls the same-process HTTP coordinator and polls it for status. The HTTP URL
and token are intentionally not user-facing, so this extra transport does not currently represent
a supported integration boundary.

Related implementation is split between `src/storybook`, `src/driver-host`, `src/wdio`, and
general utility files. Loopback allowlists, JSON response helpers, request body readers, delays,
deadlines, and shutdown behavior are duplicated.

The old announcement path (`startDesktopTestServer`, `startServiceAnnouncer`,
`createAnnouncement`, and `desktopTestServiceAnnounce`) remains exported, but the Storybook app
uses only the channel-native host-ready, run, status, and cancellation events.

### Documented layering does not match the import graph

`src/storybook/index.ts` says Storybook dependencies do not reach the neutral core or WDIO
integration, but WDIO imports `StoryController` and manifest validation from `src/storybook`.
Conversely, driver-neutral browser and element interfaces live under `src/wdio`, causing core,
platform, and fake-session code to import from the WDIO layer.

The boundary should be expressed through folders and enforced imports rather than described only
in comments.

### The public API exposes implementation seams

The export map currently publishes root, WDIO, Storybook, CLI, driver-host, macOS, and Windows
subpaths. Those entry points expose low-level lifecycle stores, artifact machinery, transport
interfaces, W3C routing, backend constructors, manifest internals, and CLI entry modules.

`./driver-host` is described as internal while being a published subpath. The executable does not
require `./cli` to be public through the package export map.

The demonstrated consumer surface is much smaller:

- portable selectors and story authoring;
- project configuration and generation;
- shared protocol contracts;
- WDIO configuration and standalone startup;
- a high-level desktop host; and
- explicit macOS and Windows extension APIs.

### Some existing behavior should be corrected before moving it

These are not reasons to expand the refactor; they are regression fences needed before it:

- `assertSharedSpecs` applies its platform-name pattern to expanded absolute paths. A checkout path
  containing `windows`, `macos`, `darwin`, or `win32` can reject otherwise portable specs.
- the `contract-test` package script invokes a CLI command that does not exist, and
  `contract.test.ts` refers to a missing `contract.wdio.spec.ts`;
- `desktop-driver start` starts a service, prints metadata, and immediately stops it;
- `stories list` validates an application target that it does not need and can fail before
  contacting Storybook;
- `driver install` verifies the embedded driver but never installs anything;
- Run all starts one WDIO process per story rather than one warm invocation;
- Run current relies on an undeclared `DESKTOP_TEST_GREP` handoff;
- attach runs can emit application-style shutdown events even though the application is externally
  owned;
- the complete `run.json` passes through bounded event redaction, truncating large results;
- `run.json.artifacts` omits files written outside `ArtifactStore`;
- `queued` is a public run state with no producer, while timeout classification is incomplete; and
- the generated manifest contains absolute machine paths even though its digest intentionally
  excludes them.

## Proposed target architecture

```text
src/
  index.ts                         # Small portable authoring surface

  core/                            # Shared runtime behavior, not server-owned
    types.ts
    errors.ts
    selectors.ts
    session.ts                     # DesktopBrowserLike and DesktopElementLike
    lifecycle.ts
    ownership.ts
    artifacts.ts
    reporting.ts
    junit.ts
    process-supervisor.ts

  config/
    index.ts                       # defineDesktopConfig and data-only types
    schema.ts
    load.ts                        # Node-only TypeScript config loader
    resolve.ts
    paths.ts
    diagnostics.ts

  protocol/                        # React-Native-safe public subpath
    index.ts
    versions.ts
    channel-events.ts
    codecs.ts
    results.ts

  discovery/                       # Build-time story and test discovery
    story-files.ts
    csf-parser.ts
    story-id.ts
    plan-schema.ts
    manifest-schema.ts
    generate.ts

  server/                          # Every listener, transport, IPC path, and server child
    index.ts                       # startDesktopHost only
    host.ts                        # Composition and lifecycle owner
    coordinator.ts                 # Transport-free single-run state machine
    errors.ts

    channel/
      storybook-adapter.ts         # Isolates createChannelServer compatibility
      bridge.ts
      client.ts                    # Story selection client

    runner/
      wdio-runner.ts
      reporter-protocol.ts

    webdriver/
      child-client.ts
      child-entry.ts
      backend-registry.ts          # Sole Appium driver-author import boundary
      appium-host.ts
      w3c-server.ts
      fake-backend.ts

    transport/
      loopback.ts
      json-http.ts
      process-ipc.ts

  testing/
    in-process-session.ts

  wdio/
    index.ts
    config.ts
    service.ts                     # Temporary compatibility facade
    launcher.ts
    worker.ts
    readiness.ts
    standalone.ts
    commands.ts
    plan-runner.ts
    capabilities.ts
    window-discovery.ts

  platforms/
    macos.ts
    windows.ts

  cli/
    main.ts
    parser.ts
    commands/
```

### Boundary rules

- `protocol` contains no `node:*`, WebdriverIO, Appium, or Storybook Node imports.
- `core` may depend on `protocol`, but not on `server`, `wdio`, Storybook, or Appium.
- `config` owns project schema, loading, resolution, path normalization, and diagnostics.
- `discovery` may use filesystem and parser APIs, but not servers or WDIO.
- `server` owns every socket, listener, IPC message, child server process, deadline, and shutdown
  path.
- Appium driver classes never leave `server/webdriver`.
- `wdio` consumes resolved config, core contracts, and narrow server clients, not discovery or
  Storybook implementation internals.
- no sibling folder imports another sibling's private modules; supported cross-layer access goes
  through explicit named exports.
- no wildcard barrel exports are introduced.

These rules should be enforced with restricted-import rules and a small import-graph test.

### What belongs outside `server`

Not every runtime helper should move into the server folder. Lifecycle, ownership, artifacts,
reporting, and process supervision are also used by WDIO workers and standalone sessions. Keeping
them in `core` avoids replacing the current layering problem with a `wdio -> server` dependency
for non-server behavior.

The shared channel contract also stays outside `server` because the React Native app must consume
it without pulling Node or server code into the bundle.

## Server and communication consolidation

### Public API

Keep the initial public host API deliberately small:

```ts
export type DesktopHostState = 'starting' | 'ready' | 'draining' | 'stopped' | 'failed';

export interface DesktopHostExit {
  state: 'stopped' | 'failed';
  error?: DesktopHostError;
}

export interface DesktopHostHandle {
  readonly id: string;
  readonly url: URL;
  readonly state: DesktopHostState;
  readonly manifestDigest: string;
  readonly closed: Promise<DesktopHostExit>;

  stop(options?: { reason?: 'signal' | 'sentinel' | 'programmatic'; timeoutMs?: number }): Promise<void>;
}

export interface StartDesktopHostOptions {
  project: ResolvedDesktopProject;
  platform: DesktopPlatform;
  signal?: AbortSignal;
  onEvent?: (event: DesktopHostEvent) => void;
}

export function startDesktopHost(options: StartDesktopHostOptions): Promise<DesktopHostHandle>;
```

Do not initially expose coordinator methods such as `run`, `cancel`, `announceNow`, raw manifests,
HTTP adapters, or channel socket objects. Device and agent control should use the versioned
channel or CLI. Add a programmatic run API only when a concrete embedding consumer demonstrates
the need.

### Internal server model

`server/host.ts` is the composition root. It owns:

- Storybook's channel/MCP listener through one isolated compatibility adapter;
- one transport-free `RunCoordinator`;
- WDIO runner child processes;
- native WebDriver child hosts started by those runs;
- cancellation and bounded shutdown; and
- host-level status and cleanup reporting.

`RunCoordinator` should own the single-active-run invariant. It must reserve the active slot before
the first asynchronous operation so two near-simultaneous device requests cannot both start.

The channel bridge should call the coordinator directly. Keep the existing hidden HTTP adapter only
as a temporary internal equivalence seam while tests move, then remove it. Do not make optional
public HTTP hosting part of the first API.

The W3C route host remains product infrastructure for the fake backend and for isolating Appium
hosting. It should move under `server/webdriver`, not be deleted or publicly exported.

### Lifecycle and ownership

Use distinct state and event names for distinct resources:

- desktop host;
- test run;
- WDIO runner;
- WebDriver session;
- native driver host;
- application; and
- attached window.

Attach mode must describe session closure, not application shutdown. Reserve application exit
events for an observed application exit.

Recommended host shutdown order:

1. stop accepting new runs;
2. announce host closing;
3. abort the active runner;
4. wait for cooperative runner and session cleanup to a fixed deadline;
5. stop only self-owned driver and application processes;
6. close internal transports;
7. close channel clients and the listener;
8. persist the final report, including cleanup failures; and
9. resolve `closed`.

`stop()` must be idempotent under concurrent signal, sentinel, and programmatic calls. Cleanup
failures must append to, never replace, the primary failure.

### Protocol

Publish an RN-safe `@fluentui-react-native/desktop-driver/protocol` subpath containing:

- protocol and manifest version constants;
- event name constants;
- request, ready, status, cancellation, and error types; and
- dependency-free runtime decoders used by both host and app.

Recommended ready payload:

```ts
interface DesktopHostReady {
  protocolVersion: 1;
  serviceId: string;
  manifest: {
    schemaVersion: number;
    digest: string;
    tests: readonly {
      storyId: string;
      planId: string;
      kind: 'inline' | 'spec';
    }[];
  };
  capabilities: {
    runModes: readonly ['selected', 'all'];
    cancellation: true;
    maxConcurrentRuns: 1;
  };
}
```

Recommended request:

```ts
interface DesktopRunRequest {
  protocolVersion: 1;
  serviceId: string;
  requestId: string;
  manifestDigest: string;
  mode: 'selected' | 'all';
  storyIds?: readonly string[];
}
```

Recommended status behavior:

- include a monotonically increasing sequence number;
- distinguish accepted, running, passed, failed, cancelled, and error;
- return structured errors for matching but malformed requests;
- ignore unrelated Storybook traffic and messages for another service ID;
- reject a stale manifest digest before spawning a runner;
- reject concurrent runs deterministically;
- make repeated cancellation idempotent; and
- never send tokens, commands, paths, environments, stacks, or unrestricted backend data to the
  app.

The ready payload's tested story list should determine whether Run current is enabled. The app
should not offer a run action for a story absent from the manifest.

### Documentation

Document the new boundary in two places:

- add a server topology, ownership table, dependency rules, and shutdown sequence to
  [DESIGN.md](./DESIGN.md); and
- add one config-driven foreground-host recipe and one programmatic `startDesktopHost` recipe to
  [USAGE.md](./USAGE.md).

A short `src/server/README.md` may document maintainer-only module ownership and import rules, but
consumer usage belongs in package-level documentation.

## Common project configuration

### Goals

One config should drive:

- Storybook story source entries;
- static desktop test discovery;
- manifest and inline-spec generation;
- the exact linked specs included by WDIO;
- Storybook channel endpoint and on-device test controls;
- application identity and readiness;
- runner command and timeout;
- fake-scene validation;
- artifacts;
- platform target defaults and allowed environment overrides;
- CLI structured output; and
- PowerShell or other orchestration scripts.

It should not replace `sb-rn-get-stories`. Storybook remains responsible for generating its runtime
registry; both tools simply consume the same story source definition.

### Proposed config

```ts
// apps/storybook/desktop.config.ts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-driver/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  rootDir: '.',

  application: {
    manifest: './app.json',
    readyTestId: 'agentic-storybook-theme-none',
  },

  storybook: {
    configDir: './src',
    stories: [
      {
        directory: '../../packages/agentic/components/src',
        files: '**/*.stories.?(ts|tsx)',
      },
      {
        directory: '../../packages/native/Callout/src',
        files: '**/*.stories.?(ts|tsx)',
      },
    ],
    channel: {
      host: '127.0.0.1',
      port: 7007,
      mcp: true,
    },
  },

  tests: {
    storyParameter: 'desktopTest',
    generatedDirectory: './desktop-tests/generated',
    fakeScene: './desktop-tests/fake-scene.json',
    artifactsDirectory: './artifacts/desktop-tests',
    framework: 'mocha',
    sessionStrategy: 'suite',
    timeoutMs: 120_000,
    runner: {
      command: 'yarn',
      args: ['wdio', 'run', 'wdio.conf.ts'],
      cwd: '.',
      timeoutMs: 900_000,
    },
  },

  base: {
    driverHost: {
      host: '127.0.0.1',
      port: 0,
      startupTimeoutMs: 120_000,
      logLevel: 'error',
    },
    readiness: {
      requireWindow: true,
      requireStorybookChannel: true,
      requireTestId: 'agentic-storybook-theme-none',
      timeoutMs: 60_000,
    },
  },

  environment: {
    platform: 'DESKTOP_TEST_PLATFORM',
    launchApp: 'DESKTOP_TEST_APP',
    identity: 'DESKTOP_TEST_IDENTITY',
    processId: 'DESKTOP_TEST_PID',
    windowHandle: 'DESKTOP_TEST_WINDOW',
    windowTitle: 'DESKTOP_TEST_WINDOW_TITLE',
    logLevel: 'DESKTOP_TEST_LOG_LEVEL',
  },

  platforms: {
    fake: {
      backend: 'fake',
      target: {
        defaultMode: 'attach',
        attach: { identity: 'fake' },
      },
      readiness: {
        requireStorybookChannel: false,
        requireTestId: null,
      },
    },

    macos: {
      backend: 'mac2',
      target: {
        defaultMode: 'attach',
        attach: {
          identityFromApplicationManifest: 'macos.bundleIdentifier',
        },
      },
    },

    windows: {
      backend: 'novawindows',
      target: {
        defaultMode: 'attach',
        attach: {
          titleFromApplicationManifest: 'displayName',
        },
      },
    },
  },
});
```

This shape keeps environment handling declarative. Avoid functions such as `env.string()` inside
the config because they make loading, fingerprinting, and serialization less predictable.

Setting `DESKTOP_TEST_APP` selects launch mode. Without it, the platform's attach defaults and
optional environment selectors apply. The loader should report the resolved target and the source
of each overridden value without printing sensitive values.

### Loading and resolution

Provide separate data-only and Node entry points:

```ts
// @fluentui-react-native/desktop-driver/config
export function defineDesktopConfig(config: DesktopProjectConfigV1): DesktopProjectConfigV1;

// @fluentui-react-native/desktop-driver/config/node
export async function loadDesktopConfig(
  file: string | URL,
  options?: {
    platform?: DesktopPlatform;
    env?: Readonly<Record<string, string | undefined>>;
  },
): Promise<ResolvedDesktopProject>;
```

The CLI should accept `--config`; otherwise it may use `./desktop.config.ts` in the current
workspace. It should not search unbounded parent directories.

Because the package supports Node 20 and the CLI runs outside WDIO, TypeScript config loading must
use one owned programmatic loader dependency. Do not rely on WDIO's `tsx` registration or inject a
loader through `NODE_OPTIONS`; the driver-host child intentionally strips those registrations.
Support `.mjs` and `.json` as loader-free alternatives.

Resolution rules:

- resolve paths from the config file, never ambient `process.cwd()`;
- canonicalize files with `realpath` and persist config-relative POSIX paths;
- reject unknown keys and unsupported schema versions;
- validate everything before binding a port or spawning a process;
- precedence is explicit CLI option, selected platform override, base config, then package default;
- environment variables provide values for declared semantic overrides but do not alter structural
  precedence;
- arrays replace inherited arrays rather than concatenating;
- `null` explicitly clears an inherited optional value and `undefined` inherits;
- platform overrides cannot change story or test discovery, preserving one shared manifest;
- deduplicate overlapping story entries by canonical file path;
- reject non-loopback hosts, output path traversal, missing roots, conflicting launch/attach
  selectors, invalid numbers, duplicate IDs, and empty discovery; and
- write generated outputs atomically.

Use a config schema version independent from the channel protocol, story plan, manifest, and
portable command matrix versions. Additive optional fields may retain the version; changes to
defaults, merge rules, or path semantics require a new config schema version.

### Generated outputs

Generation should emit:

- a relocatable manifest with config-relative normalized paths;
- the generated inline WDIO spec;
- exact linked-spec references from manifest entries;
- an input fingerprint covering config version, normalized story sources, plans, linked direct
  dependencies, and generator version; and
- a narrow RN-safe runtime projection.

Example runtime projection:

```ts
// desktop-tests/generated/desktop-runtime.generated.ts
export const desktopRuntime = {
  protocolVersion: 1,
  channel: { host: '127.0.0.1', port: 7007 },
  manifestDigest: '...',
  testedStoryIds: ['components-button--default', 'components-button--interaction'],
} as const;
```

The React Native app imports this generated projection and `./protocol`, not the full Node project
config. This prevents runner commands, filesystem paths, and server settings from entering the
bundle.

At generation time, validate that inline-plan `testId` values exist in the configured fake scene.
Also cross-check configured application identity and title against `app.json` rather than allowing
copied values to drift.

### Consumer projections

| Consumer                     | Derived input                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/storybook/src/main.ts` | `toStorybookStories(config)` converts shared entries to config-directory-relative Storybook entries.              |
| `desktop:generate`           | Loads one config and emits manifest, inline spec, and RN runtime projection.                                      |
| `wdio.conf.ts`               | Resolves the platform and executes only the generated inline spec plus unique linked specs named by the manifest. |
| `desktop-driver host`        | Reads channel, manifest, runner, platform target, timeout, and artifacts from resolved config.                    |
| React Native app             | Imports the generated runtime projection and RN-safe protocol only.                                               |
| Story control CLI            | Reads the channel endpoint from resolved config.                                                                  |
| Windows agent script         | Consumes structured `config resolve` or host-ready JSON instead of hard-coded values.                             |
| Fake suite                   | Reads the configured fake scene and the same manifest.                                                            |

The runtime `DesktopStorybookOptions.specRoots` field should be removed. Spec roots belong to
discovery configuration, not runtime driver options.

## Recommended public exports

Target exports after a deprecation window:

| Export                                              | Purpose                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `@fluentui-react-native/desktop-driver`             | `byTestId`, `story`, authoring/result types, base structured error |
| `@fluentui-react-native/desktop-driver/config`      | data-only config types and `defineDesktopConfig`                   |
| `@fluentui-react-native/desktop-driver/config/node` | config loading, resolution, projections, generation                |
| `@fluentui-react-native/desktop-driver/protocol`    | RN-safe channel constants, types, and decoders                     |
| `@fluentui-react-native/desktop-driver/wdio`        | high-level WDIO config and standalone lifecycle                    |
| `@fluentui-react-native/desktop-driver/server`      | `startDesktopHost` and host lifecycle types                        |
| `@fluentui-react-native/desktop-driver/macos`       | explicit macOS-only extensions                                     |
| `@fluentui-react-native/desktop-driver/windows`     | explicit Windows-only extensions                                   |

Remove `./driver-host` and `./cli` from the export map. Keep the CLI binary. Deprecate low-level
`./storybook` runtime exports and retain temporary named re-exports only where an external consumer
is known.

Keep these internal:

- raw WDIO service classes;
- `RunCoordinator` and transport adapters;
- Storybook channel socket interfaces;
- W3C route types and backend constructors;
- driver child IPC and host config;
- capability mapping and window enumeration;
- manifest parser and emitter internals;
- runner invocation construction;
- token comparison;
- artifact and ownership implementation classes; and
- CLI parser and entry module.

## Phased implementation plan

### Phase 0: establish truthful regression fences

Do not move files in this phase.

1. Fix shared-spec validation to use paths relative to `rootDir`; add a checkout-path regression
   test for all platform-name segments.
2. Correct attach lifecycle terminology and implement explicit timeout classification.
3. Write complete, non-truncated run reports for startup, readiness, session, cancellation, and
   cleanup failures.
4. Include ownership, driver logs, run report, JUnit, events, and diagnostics in the artifact
   inventory.
5. Merge launcher and worker outcomes before final success is reported.
6. Run all selected stories through one WDIO invocation and warm session, with framework-level
   progress.
7. Replace the implicit grep environment handshake with an explicit invocation contract.
8. Fix or remove the broken contract script and stale file reference.
9. Correct CLI names and behavior: make `start` foreground or rename it, make `stories list`
   validate only Storybook connection settings, and rename `driver install` to `driver verify`.
10. Add app-side protocol/control tests and make the fake end-to-end path a declared test task.

### Phase 1: add protocol and config surfaces

1. Add the RN-safe `./protocol` subpath and use its codecs on both sides.
2. Add config schema, loader, resolver, path normalization, and `config resolve|print` CLI commands.
3. Add `apps/storybook/desktop.config.ts` while retaining current flags as deprecated overrides.
4. Generate the RN runtime projection.
5. Gate migration on equivalent resolved config and an unchanged manifest digest.

### Phase 2: migrate every Storybook consumer

1. Derive `src/main.ts` stories from the project config.
2. Remove story-root and host argument duplication from package scripts.
3. Reduce `wdio.conf.ts` to platform selection plus `createDesktopWdioConfig(resolvedProject)`.
4. Use exact manifest-linked specs instead of broad `*.desktop.spec.ts` globs.
5. Replace local protocol constants and guards.
6. Replace the duplicated REST client/control scripts with package CLI commands.
7. Move PowerShell orchestration to structured config and host-ready JSON.

### Phase 3: introduce a transport-free coordinator

1. Extract the single-run state machine from the HTTP service.
2. Call it directly from the channel bridge.
3. Add sequence numbers, manifest echo validation, tested-story readiness, structured errors,
   deadlines, and idempotent cancellation.
4. Preserve the HTTP adapter only until direct-coordinator equivalence is tested, then delete it.
5. Remove the unused announcement path.

### Phase 4: consolidate implementation

1. Move channel, coordinator, runner, transport, IPC, W3C, and backend-host code under
   `src/server`.
2. Split WDIO launcher, worker, readiness, and standalone responsibilities behind the existing
   compatibility facade.
3. Move browser/element interfaces to core.
4. Consolidate loopback, JSON, body-limit, deadline, delay, shutdown, XML escaping, and
   error-to-result helpers without merging distinct W3C and host response schemas.
5. Enforce dependency direction through lint and import-graph tests.
6. Update README, USAGE, DESIGN, NEXT-STEPS, and Storybook guidance in the same change.

### Phase 5: narrow the public surface

1. Add `./server`, `./protocol`, and config entry points.
2. Deprecate low-level `./storybook` runtime exports.
3. Remove `./driver-host` and `./cli` at an announced version boundary.
4. Rename ambiguous service types so the WDIO integration, standalone driver handle, test
   coordinator, and desktop host cannot all be called "service".
5. Inspect package contents and exclude compiled tests from publishing if the pack task confirms
   they are shipped.

### Phase 6: retire compatibility tooling after native parity

Retire the WinAppDriver/Jest smoke harness only after NovaWindows covers its focus, crash-survival,
attach, ownership, and evidence cases in CI. The old harness is redundant architecturally but still
provides unique regression coverage.

## Acceptance criteria

### Configuration and discovery

- loading the same config from any working directory produces identical resolved paths;
- Storybook and desktop generation resolve the same canonical story-file set;
- overlapping roots are deduplicated;
- invalid config fails before any listener or process starts;
- WDIO runs only the generated inline spec and manifest-referenced linked specs;
- unreferenced desktop specs do not run;
- manifests contain config-relative POSIX paths;
- migration steps preserve the current digest until an intentional schema change;
- after a schema change, the new digest remains deterministic and equal across platforms; and
- a config fingerprint or linked-spec change produces a clear regeneration error.

### Protocol and host

- the same decoder accepts every package-emitted payload and app-emitted request;
- protocol mismatch, manifest mismatch, malformed requests, unknown stories, and a busy host
  produce structured terminal errors;
- Run current is disabled for stories absent from the manifest;
- a host restart invalidates stale service and request IDs;
- out-of-order status sequence numbers are ignored;
- repeated cancel and stop operations are idempotent;
- Run all starts exactly one WDIO runner and one native driver host; and
- no channel payload exposes tokens, commands, paths, environment values, or stacks.

### Ownership and lifecycle

- attach mode leaves the original macOS and Windows applications running;
- attach reports session closure, not application shutdown;
- launch mode terminates only its own application and process tree;
- ambiguous Windows discovery fails before opening the real application session;
- driver or application death after readiness cannot produce a passing result;
- parent death still reaps the native driver child;
- cancellation exits runner, driver host, and owned descendants within the deadline while leaving
  the attached Storybook app alive; and
- cleanup failures are appended without hiding the primary failure.

### Results and artifacts

- every terminal path writes one complete, non-truncated `run.json`, JUnit file, and lifecycle
  stream;
- assertion failures map to `failed`, infrastructure failures to `infrastructureError`, framework
  skips to `skipped`, timeouts to `timed_out`, and cancellation to `cancelled`;
- the artifact inventory includes `run.json`, JUnit, events, ownership, driver log, and per-test
  diagnostics; and
- workers cannot overwrite one another's reports when per-spec sessions are explicitly requested.

### Fake and native parity

- existing W3C contract, plan, lifecycle, and Button integration tests remain green without new
  skips;
- `desktop:test:fake` becomes a normal CI gate;
- macOS verifies attach survival, application-state readiness, focus, scrolling, cancellation, and
  bounded cleanup;
- Windows verifies NovaWindows attach and launch ownership, exact window selection, focus
  regression behavior, cancellation, and descendant cleanup on an unlocked desktop; and
- macOS and Windows compare manifest digest, story IDs, test IDs, and portable command matrix
  version for the same commit.

### Packaging and boundaries

- `./protocol` bundles in React Native with no Node dependency;
- the data-only config entry has no server, WDIO, Appium, or Storybook runtime dependency;
- internal server and driver-host paths are absent from the eventual public export map;
- import-graph tests enforce the target layering; and
- package inspection proves whether tests and unnecessary generated files are excluded from the
  published artifact.

## Changes that should not be part of this refactor

- Do not absorb Metro into the desktop host.
- Do not expose Appium clients, driver classes, native objects, arbitrary shell commands, or raw
  backend capabilities.
- Do not broaden listeners beyond loopback without a separate authenticated threat model.
- Do not infer ownership from process presence or discovery; attached resources remain external.
- Do not use the legacy WinAppDriver/Jest harness as the target architecture.
- Do not remove either inline plans or linked specs.
- Do not execute story modules during test discovery.
- Do not replace Storybook's supported runtime registry generation.
- Do not treat fake-backend success as native compatibility evidence.
- Do not parallelize desktop specs by default.
- Do not import the Node config or server entry into the React Native app.
- Do not delete the W3C fake route host or move Appium imports outside their isolated backend
  boundary.
- Do not remove the legacy Windows harness until NovaWindows has equivalent regression coverage.
- Do not perform the folder consolidation before the Priority 1 reporting work in
  [NEXT-STEPS.md](./NEXT-STEPS.md).

## Recommended first reviewable change

The first implementation should be intentionally small and behavior-focused:

1. fix absolute-path shared-spec validation;
2. repair report completeness and attach lifecycle naming;
3. fix the broken CLI/package-script contracts;
4. add the RN-safe protocol entry with shared decoders; and
5. add characterization tests for one-invocation Run all and host shutdown.

That creates trustworthy gates for the config migration and server consolidation without mixing
behavioral corrections with a large file move.
