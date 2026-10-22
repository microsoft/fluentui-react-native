# General-purpose desktop testing: plan of record

**Plan of record: Option 1, the neutral harness + Storybook integration.**
**Architecture accepted by the owner on October 21, 2026.**
Keep `desktop-driver` independent, add `desktop-test` for configuration and lifecycle,
and retain `storybook-desktop` and `storybook-desktop-runtime` as optional Storybook
packages. Run standalone specs through the normal WebdriverIO testrunner; preserve
the existing isolated story-callback runner.

This makes FluentTester and REX ordinary consumers of the same infrastructure as
Storybook, without making ordinary applications pretend to be Storybook.
The harness also owns end-to-end reporting: delegated services and test engines
produce diagnostics/results, and one supervisor collects, persists, and presents
them. GitHub Actions grouping is a renderer of that reporting flow, not something
each child process manages independently.

## Scope and evidence

This is the accepted architecture and delivery plan. The implementation update
below supersedes the original planning-time statements about missing APIs;
the remaining sections retain their research-time evidence and proposed
contracts. Current API usage belongs in the
[desktop-test guide](packages/agentic/desktop-test/README.md).
Outstanding qualification gates do not reopen the selected architecture.

### Implementation update (October 22, 2026, UTC)

**Implemented:** the neutral harness, structural same-schema target references,
native adapters, owned services/workers, authenticated reporting collector,
normal WDIO/Jasmine integration, native visibility/focus waits, and optional
Storybook integration. FluentTester, REX, Storybook, and E2E now have canonical
configs. Existing desktop grouped spec selections, Storybook exclusions, and
mobile lanes are preserved. The Windows baseline still fails closed on its two
unmatched patterns rather than claiming reduced coverage.

**Observed:** all 15 harness contracts, all 175 Storybook package tests, and
the Windows native build/handshake/self-test contracts pass. The real Win32
Pressable navigation pilot passes both existing tests. The behavioral cohort
now passes all 37 unchanged Button, Checkbox, Switch, directional FocusZone,
and Callout tests, including keyboard callbacks, checked/required state,
scrolling-dependent navigation, and popup opening. Its canonical report is
`apps/E2E/artifacts/desktop/6d08d3d3-84b8-4621-af17-5ddaf04a4875/run.json`.
The Win32 Storybook lifecycle also passes through the neutral CLI, including
its owned PowerShell path and inherited reporting: 152 story navigations and
both native Button callbacks pass. Its canonical report is
`apps/storybook/artifacts/desktop/35036f1a-94c4-49f7-ac62-52a0cbb195c3/run.json`.
Both runs have zero skipped tests, retries, infrastructure, reporting, or
cleanup failures. The verified Windows helper artifact is
`aa1852e48380e8bc9a6327debeba2e94305eae780c9b365d5b6261702ddd8185`.

An earlier Storybook run explicitly skipped its pointer/screenshot/focus
callback when those capabilities were unavailable. The later interactive
pass does not attribute the availability change to the adapter fixes; no
input policy was relaxed. These are implementation and limited app evidence,
not complete behavioral parity.

**Repository validation:** package checks, publishing, changesets, and all
changed Markdown links pass. After `yarn clean-lage-cache`, the final aggregate
passes with `yarn lage buildci --concurrency 4`. Initial runs exposed missing
app project references, the owner-approved Windows Knip workspace-path fix,
and a 30-second CLI-contract timeout at default aggregate concurrency. The
bounded rerun preserves all assertions and deadlines. Validation used a short
task-local temporary directory; the earlier default-TEMP inline-worker exit
remains undiagnosed. The separate opt-in Windows driver run passes 68 tests
with two macOS-only tests skipped. The aggregate Markdown-link task remains
blocked by Windows zx shell quoting; direct checks of all changed files pass.

**Still open:** per-test assertion mapping and equivalent-build old/new comparisons; actual
FluentTester Windows and macOS renderer/runtime qualification; macOS native
compilation; all Storybook platform/renderer regressions; and real Actions
grouping/summary/upload verification. The 100-run/14-day reliability gate and
desktop Appium retirement cannot be completed by this implementation session.
No lane is retired and no capability skip is counted as a native pass.

The review covers the checkout at `e2092f9df3fd4fafc141c696ca0e49e690d69cd1`.
The legacy package is actually `apps/E2E`, with uppercase `E2E`.

Two independent investigations were followed by reciprocal reviews:

- Claude Opus 5.5, `claude-opus-5.5`, maximum reasoning, `long_context`.
- GPT-6 Astra, `gpt-6-astra`, maximum reasoning, `long_context`.

`long_context` was the maximum context tier exposed by the agent tool. Both models
read the other's complete initial report before reviewing it. Their initial
recommendations differed on package boundaries; both ultimately recommended the
four-package architecture. Section 11 records the substantive corrections. The
complete reports and cross-reviews are retained as local session artifacts, not
dependencies of this document. Follow-up reporting research inspected the current
command runner, combined server, native diagnostic transport, Windows smoke
scripts, test workers, CI, and upstream reporting documentation; see section 6.

**Evidence labels:** **Observed** means source-inspected behavior; **Inferred**
means a conclusion from that evidence; **Proposed** means a future design;
**Unqualified** means native behavior not demonstrated by this planning exercise.

### Success criteria

1. The selected macOS, Windows, and Win32 suites in `apps/E2E` can run against the
   existing tester applications without Appium/WinAppDriver on those endpoints.
2. Storybook and non-Storybook applications share one configuration schema and
   lifecycle implementation. A generic app needs no Storybook installation.
3. Standalone WDIO specs, page objects, Jasmine hooks, and grouped suites remain
   supported. Migration does not require converting them into CSF stories.
4. Existing Storybook traversal, callback isolation, readiness authentication,
   failure evidence, and platform-specific behavior remain intact.
5. Launch/attach identity, cancellation, application ownership, and native input
   safety remain explicit. Skips are not counted as demonstrated parity.
6. iOS/Android E2E tooling remains operational and outside this migration.
7. Delegated-service diagnostics are visible while services run, without requiring
   `--verbose` or waiting for shutdown. Test output is correlated, grouped, and
   retained; required-service failures cannot leave the parent apparently healthy.
8. Terminal output, GitHub Actions groups/annotations/summary, JSON results, and
   JUnit describe the same run, including skips, retries, incomplete work, and
   infrastructure failures.

## 1. What actually needs to change

### The automation engine is already mostly generic

**Observed:** a driver session can launch or attach to an application and enumerate
its windows without a story catalog or application-runtime hello.
`DesktopTarget` makes its story orchestrator optional, and story endpoints reject
targets without one.

Sources:
`packages/agentic/desktop-driver/src/host/types.ts:134-184`;
`packages/agentic/desktop-driver/src/server/SessionManager.ts:78-141`;
`packages/agentic/desktop-driver/src/server/createDesktopDriverServer.ts:309-319`.

However, **this is a generic API, not a finished generic production command**.
The existing production composition of `NativeDesktopHost` and the WebDriver
listener lives inside the Storybook server. `desktop-driver serve` currently uses
the fake target.

Sources:
`packages/agentic/storybook-desktop/config/server.cjs:67-94`;
`packages/agentic/desktop-driver/README.md:100-104`.

The missing piece is therefore a reusable native supervisor and test integration,
not a replacement native driver.

### Storybook currently owns too much composition

**Observed:** the config loader searches `storybook.config.*` and requires a
`DesktopStorybookConfig` class instance. The schema mixes story packages, addons,
and test IDs with app identity, native commands, platform settings, and WDIO
settings. `driver()` allocates Storybook, Metro, and WebDriver resources together.
The server requires the Storybook channel before embedding the native driver.

Sources:
`packages/agentic/storybook-desktop/src/cli/loadConfig.ts:7-22`;
`packages/agentic/storybook-desktop/src/config/makeDesktopStorybookConfig.ts:74-128`;
`packages/agentic/storybook-desktop/src/cli/DesktopStorybookCli.ts:143-185`;
`packages/agentic/storybook-desktop/config/server.cjs:12-24,47-94`.

The manifest also mixes generic application/helper leases with story digests,
runtime nonce, test-ID prefix, and channel/Metro ports.

Source:
`packages/agentic/storybook-desktop/src/driver/driverManifest.ts:12-34,58-83`.

**Proposed extraction seam:** generic target resolution, supervisor, resource
ownership, and runner connection below; Storybook discovery, channel, manifests,
navigation, and callback execution above.

### The runtime is genuinely a Storybook runtime

**Observed:** its bridge imports Storybook preview APIs, the app factory wraps
`getStorybookUI`, and Metro integration installs Storybook and runtime identity.

Sources:
`packages/agentic/storybook-desktop-runtime/src/DesktopDriverBridge.tsx:1-54`;
`packages/agentic/storybook-desktop-runtime/src/createDesktopStorybookApp.tsx:1-49`;
`packages/agentic/storybook-desktop-runtime/config/metro.cjs:1-95`.

Do not rename that package into a mandatory general-purpose runtime. An installed
native application can use native identity/window readiness, optionally followed
by a stable accessibility marker. The native helper's own authenticated handshake
still applies; it is not an application-side Storybook handshake.

### There are two different test contracts

| Existing consumer   | Execution contract                                                                                                                           | Preserve during migration                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/E2E`          | WDIO local runner, Jasmine, globals/hooks/retries, grouped spec arrays, page navigation                                                      | Normal WDIO spec execution and grouping                   |
| Storybook callbacks | Extracted inline callbacks, source-digest validation, supervisor-created session, correlated navigation/remount, isolated `node:test` worker | Existing per-case isolation and explicit callback context |

Sources:
`apps/E2E/wdio.conf.win32.js:15-69`;
`apps/E2E/tsconfig.json:5`;
`packages/agentic/storybook-desktop/src/testing/runWdioTests.ts:71-80,98-198`;
`packages/agentic/storybook-desktop/src/testing/worker.ts:20-69`;
`packages/agentic/storybook-desktop/config/transform-story-tests.cjs:59-81,175-213`.

Do not make replacing the automation transport depend on replacing Jasmine,
emulating its globals inside `node:test`, or rewriting all tests as stories.

## 2. Architecture decision

| Approach considered                            | Package structure                                                                            | Primary advantage                                                         | Primary cost                                                       | Decision                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------- |
| **1. Neutral harness + Storybook integration** | Driver + new generic harness + existing Storybook tooling + optional Storybook runtime       | Real dependency/release boundaries; supports interactive and test clients | One additional package and a small integration contract            | **Accepted; implement this** |
| **2. Generalized all-in-one harness**          | Driver + renamed/generalized tooling package with lazy Storybook subpaths + optional runtime | Fewest release units and easiest initial extraction                       | Storybook-only tooling dependencies and releases remain shared     | Not selected                 |
| **3. WDIO-launcher-centric**                   | Driver + WDIO desktop service/harness + Storybook adapter + optional runtime                 | Standard runner ecosystem becomes the organizing model                    | Story callback semantics and interactive lifecycle need adaptation | Not selected                 |

The accepted design uses the single config format, native-only application
support, and explicit platform/ownership contracts below. The other approaches
are retained only as decision history, not parallel implementation tracks.

### Selected design: app-neutral harness plus separate Storybook integration

**Package dependency direction:**

```text
apps/E2E ---------------------> desktop-test ------> desktop-driver
                                  ^
                                  |
apps/storybook ---> storybook-desktop
       |
       +---------> storybook-desktop-runtime

storybook-desktop may also consume desktop-driver's public extension contracts.
desktop-test never imports Storybook, React, or React Native.
desktop-driver never imports desktop-test or any application framework.
```

`desktop-test` is the composition/lifecycle layer. `storybook-desktop` supplies an
explicitly imported integration to it; it does not run a competing supervisor.
There is no auto-discovered plugin registry and no package-name-based loading.

The normal WDIO launcher runs standalone suites. The Storybook integration keeps
the CSF executor, but obtains resources and session lifetime management through
the same harness.

**Decision rationale:** both an application-neutral lifecycle and an application-neutral
installation boundary become enforceable. Generic consumers do not install the
Storybook-only Babel/regexpu transforms. Storybook changes do not automatically
become generic harness releases. The existing package already declares these
transform dependencies, so a lazy subpath alone does not isolate installation.

Source:
`packages/agentic/storybook-desktop/package.json:59-68`.

**Risks:** maintaining integration contracts; accidentally creating duplicate
lifecycle engines; extraction changes to listener/channel startup and shutdown.
Mitigate with one resource owner and consumer-level contracts. Keep a supervised
channel child initially rather than moving everything in-process at once.

**Migration shape:** extract the generic supervisor; prove a runtime-free app;
add standalone WDIO/Jasmine integration; reconnect Storybook through the optional
integration; migrate legacy suites by endpoint.

### Alternative considered: generalized all-in-one harness

Not selected: renaming `storybook-desktop` to `desktop-test` and placing Storybook
behind lazy subpaths would reduce package contracts, but retain its installation
dependencies and release coupling. Forming module boundaries inside the current
package is an acceptable extraction step, not the final architecture.

### Alternative considered: WDIO-launcher-centric orchestration

Not selected: making the WDIO launcher the owner of all infrastructure would fit
standalone E2E, but require extra adaptation for interactive server use and CSF
isolation. The selected harness may generate WDIO configuration and use its
reporter hooks; it does not make every operation a WDIO job or require another
authored config format.

## 3. Package responsibilities

| Package                     | Owns                                                                                                                                                                                                                                                                                                               | Must not own                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `desktop-driver`            | W3C remote end; target registration contracts; native helpers; `DesktopHost`; capabilities; clients; native assertions/artifacts; low-level WDIO command compatibility                                                                                                                                             | App build commands, Metro, Storybook dependencies, Jasmine configuration |
| **New `desktop-test`**      | Canonical config/loading; target and instance resolution; app/host adapters; helpers/listener lifecycle; launch/attach leases; readiness coordination; cancellation; WDIO launcher/worker service; cleanup; reporting protocol/collector, journals, result normalization, and console/Actions/JSON/JUnit renderers | Story discovery, CSF extraction, preview navigation, Storybook UI        |
| `storybook-desktop`         | Story config extension; discovery and digests; callback extraction/stripping; channel adapter/orchestrator; traversal; story executor; Storybook-specific diagnostic/result adapters into the harness                                                                                                              | Another helper/server/app supervisor or independent top-level reporter   |
| `storybook-desktop-runtime` | Storybook shell/theme/chrome; preview bridge; Storybook-specific Metro/Babel integration                                                                                                                                                                                                                           | Mandatory runtime for generic apps or ownership of host processes        |

Keep low-level WDIO native-command adaptation in `desktop-driver/wdio`; put WDIO
launcher/framework/lifecycle integration in `desktop-test`. This avoids pulling
the full WDIO runner or Jasmine into the driver.

Keep CLI/config entry points free of peer-dependent installation assumptions.
Resolve suite frameworks from their owning workspace, and preserve the existing
requirement that CLI binaries have a stable physical installation location
(`packages/agentic/storybook-desktop/README.md:13-19`).

Initially retain dependency-free story protocol hooks in the driver if moving
them would churn qualified native boundaries. Only register/use story-specific
client commands for targets advertising the integration. Renaming every
`preview`/`story` internal field is not a prerequisite for generic targets.

The integration contract should be deliberately small: validated configuration,
optional service/resource descriptors, readiness/navigation behavior, and test
execution using core-provided session/resource scopes. The integration must not
independently spawn helpers, select unregistered apps, or own teardown.

The imported integration is trusted local code. Resolved target descriptions,
capabilities, manifests, run results, and agent output remain serializable data.
Do not serialize executable adapter objects or introduce unrestricted callbacks
into remote capabilities.

Reporting belongs inside `desktop-test`, not a fifth package or a new general
telemetry service. Driver/native layers retain narrow diagnostic callbacks and
typed results; they do not acquire GitHub Actions, WDIO-runner, or Storybook
dependencies. Section 6 defines the producer/collector/renderer boundary.

## 4. One configuration format, with optional Storybook

### Format and ownership

**Proposed name:** `desktop.config.mts`, with the same schema for every consumer
and equivalent supported TypeScript/JavaScript extensions.

- One format does **not** mean one repository-global file.
- App-root files own app lifecycle and identity exceptions.
- The `apps/E2E` file owns test selection, frameworks, hooks, retries, and readiness
  expectations. It references app targets; app configs never import E2E runners.
- Target references use this same schema, not a second app-config format.
- Permit suite-local inline targets for unrelated installed applications that
  have no app-owned config. `app.json` is not universally required.
- Generated native identity, instance manifests, and WDIO configs are outputs,
  not additional user-authored formats.

Use structural/schema validation rather than `instanceof`. Reject unknown core
fields and delegate extension-field validation to the explicitly imported
integration. Resolve paths relative to their defining config/module, not cwd.
Reject reference cycles and ambiguous target overrides.

Keep these axes separate:

| Axis                    | Examples                                                          | Rule                                                                        |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Endpoint                | `macos`, `windows`, `win32`                                       | Test-facing identity; Win32 is not an alias for the Windows Fabric endpoint |
| Host OS                 | macOS, Windows                                                    | Both Windows endpoints use the Windows helper                               |
| Host adapter            | Native installed/executable, RN Test App, REX, external attach    | Determines supported lifecycle stages, not test framework                   |
| Renderer                | Fabric/Paper, when applicable                                     | Optional for non-RN apps; actual generated/running mode must match          |
| Application integration | None, Storybook                                                   | Optional; not inferred from test runner                                     |
| Test source             | WDIO specs, CSF callbacks, existing static story plans            | Determines execution/navigation contract                                    |
| Readiness               | Verified native window/marker, optional authenticated integration | `/status` alone does not prove the app is ready                             |

### Illustrative configs

These sketches describe the proposed API, not code that works today.

```ts
// apps/storybook/desktop.config.mts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';
import { storybook } from '@fluentui-react-native/storybook-desktop/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { host: { kind: 'react-native-test-app' } },
    windows: { host: { kind: 'react-native-test-app', renderer: 'fabric' } },
    win32: { host: { kind: 'rex' } },
  },
  integration: storybook({
    storyPackages: ['@fluentui-react-native/components', '@fluentui-react-native/native-core'],
    // Carry over current per-endpoint patterns, exclusions, and smoke checks.
  }),
  suites: {
    stories: { kind: 'csf-wdio' },
  },
});
```

The imported Storybook factory supplies the integration explicitly; the core does
not look up a package by name. Existing platform exclusions remain exactly as
declared in `apps/storybook/storybook.config.mts`.

The macOS renderer remains selectable per run, with Fabric as the existing
Storybook default and a Paper lane. A renderer switch requires preparation;
renderer must participate in instance/lease validation. Do not fix Fabric in
config in a way that makes the Paper lane impossible.

```ts
// apps/fluent-tester/desktop.config.mts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { host: { kind: 'react-native-test-app' } },
    windows: { host: { kind: 'react-native-test-app' } },
  },
});

// apps/win32/desktop.config.mts uses the same schema:
// targets: { win32: { host: { kind: 'rex' } } }
// Preserve the canonical development/attach window identity, not a new title.
```

```ts
// apps/E2E/desktop.config.mts
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';
import { BASE_TESTPAGE } from './src/common/consts.ts';
import { legacyDesktopSpecs } from './desktop-specs.mts';

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: {
      use: { config: '../fluent-tester/desktop.config.mts', target: 'macos' },
    },
    windows: {
      use: { config: '../fluent-tester/desktop.config.mts', target: 'windows' },
    },
    win32: {
      use: { config: '../win32/desktop.config.mts', target: 'win32' },
    },
  },
  suites: {
    legacy: {
      kind: 'wdio',
      framework: 'jasmine',
      specs: legacyDesktopSpecs,
      readiness: { kind: 'native', testId: BASE_TESTPAGE },
      hooks: './src/common/desktopHooks.ts',
      maxInstances: 1,
      specFileRetries: 1,
      bail: 1,
    },
  },
});
```

`desktop-specs.mts` is ordinary shared selection data, not another config format.
It preserves the current macOS selection, the Windows explicit allowlist, and
the Win32 `.win.ts` selection, including grouped arrays. Do not broaden Windows
to all matching files. Diagnose unmatched legacy globs rather than silently
reducing coverage.

Sources:
`apps/E2E/wdio.conf.macos.js:9`;
`apps/E2E/wdio.conf.windows.js:11-25`;
`apps/E2E/wdio.conf.win32.js:17`.

An unrelated, uninstrumented app can instead define an inline target:

```ts
targets: {
  macos: {
    host: {
      kind: 'installed',
      application: { bundleIdentifier: 'com.example.DesktopApp' },
      ownership: 'external',
    },
    readiness: { kind: 'native', testId: 'main-window-ready' },
  },
}
```

That target has no `integration`, Storybook runtime, React Native manifest,
Metro service, renderer, or story-navigation requirement. Omitted lifecycle
stages do not run; explicitly requesting an unsupported stage fails clearly.

### Identity and defaults

Resolve identity once, then derive commands, registration, leases, runtime
identity, and runner capabilities from the same immutable target description.

- RN Test App: use app metadata and generated build identity; do not duplicate
  bundle IDs, Appx identity, component names, or display names across configs.
- REX: resolve executable, component, arguments, bundle root, cwd, and window
  title once. Development launch and test attach consume the same identity.
- Native/external: accept trusted explicit identities; do not invent an
  `app.json` requirement for non-RN apps.
- Use canonical app root + endpoint + renderer/profile for instance identity;
  a suite config referencing another app must not change that app's identity.
- Separate stable installation identity, isolated instance identity, and unique
  run nonce. Do not rewrite the identity of externally installed apps.
- Keep `app.json` as the owner of the existing Storybook test-ID prefix.
- Paths, executable selection, cwd, helper selection, and allowed launch modes
  are server-owned configuration, never unrestricted WDIO capabilities.

Preserve source-loadable config entry points before a repository build, because
Storybook's generation step loads config before compiled outputs exist.

### Reporting configuration

Reporting is another section of the same schema, not a separate reporter config
or per-service environment convention:

```ts
reporting: {
  console: 'auto', // GitHub Actions when GITHUB_ACTIONS=true; plain otherwise.
  artifactsRoot: './artifacts/desktop',
  junit: true,
  summary: 'auto', // Bounded Actions summary when GITHUB_STEP_SUMMARY is present.
}
```

The versioned event journal and canonical run result are always retained.
`console` also accepts explicit `plain` and `github-actions` modes. Structured
CLI output mode takes precedence: stdout contains only the requested JSON result
or event stream, while human diagnostics go to stderr without Actions framing.
`--verbose` increases raw informational log detail; it must not determine whether
errors, service failures, or test outcomes are visible.

The invoking config owns run-level reporting. Referenced app configs contribute
targets, not additional collectors/renderers or competing reporting overrides;
delegated commands inherit the invocation's reporting context.

## 5. Lifecycle, sessions, and readiness

### Exactly one owner per resource

| Resource                                                            | Owner                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Helper resolution, verified artifact, W3C listener, target registry | Generic supervisor                                                 |
| Optional Metro/channel/build processes                              | Generic supervisor, from selected adapter/integration descriptors  |
| Normal WDIO browser session                                         | WDIO worker; supervisor tracks association and removes orphans     |
| Story callback session                                              | Supervisor session scope; callback worker attaches to that session |
| Supervisor-launched app                                             | Supervisor lease; driver sessions attach                           |
| Session-launched app                                                | Driver session; session deletion closes it                         |
| External attached app                                               | External owner; ordinary cleanup preserves it                      |

**Initial application-lifetime policy:** retain the
existing supervisor-owned app and attached-session model for Storybook. Use
session-owned launch for standalone suites when the adapter supports it, or
supervisor launch plus verified attach when host tooling must launch the app.
Do not add driver-managed service-lifetime retention as part of this extraction.
That can be a later feature with its own crash/relaunch/cleanup contract.

A worker must not call `remote()` again when WDIO already supplied `browser`.
CSF attachment likewise must not create a second competing session. Preserve
grouped spec lifecycle rather than assuming a session always corresponds to one
physical spec file.

**Observed:** one active session per target is enforced within a service, and
physical input is serialized. That does not prevent two independent supervisors
or whole tests from stealing focus from one another.

Sources:
`packages/agentic/desktop-driver/src/server/SessionManager.ts:84-88,201-208`.

Default to one active interactive workload per desktop. Reject conflicting
claims on the same physical application across target aliases/supervisors.
Use separate desktops/machines for parallel physical-input qualification.

### Native readiness is not Storybook readiness

For ordinary applications, verify native identity and a window, then any
configured accessibility marker. Make launch/readiness timeouts configurable;
the current 120-second session startup deadline is shorter than the legacy
180-second Win32 allowance.

Sources:
`packages/agentic/desktop-driver/src/server/SessionManager.ts:93-121`;
`apps/E2E/wdio.conf.win32.js:10-12`.

For Storybook, preserve nonce-authenticated hello, initial preview readiness,
correlated navigation/generation, digest validation, and native story-root
verification. Do not downgrade an instrumented target to a window-only check
when its authenticated readiness fails.

Sources:
`packages/agentic/storybook-desktop/src/driver/StorybookChannelOrchestrator.ts:174-240`;
`packages/agentic/desktop-driver/src/server/createDesktopDriverServer.ts:326-390`.

Expose an optional readiness interface, but defer a reusable non-Storybook
runtime package until a real second instrumented app needs one.

### Cancellation and evidence

On interruption: stop scheduling; abort and settle in-flight work; stop workers
within a deadline; release input; delete recorded sessions; stop only owned apps
and services; dispose helpers. Preserve the original failure and report cleanup
or evidence failures separately.

Keep artifacts under a confined root with unique
run/endpoint/renderer/worker/spec/case/attempt namespaces. Retain merged command
logs, native tree/window/source evidence, screenshots where supported, helper
identity, capabilities, skip reasons, test results, and cleanup outcome.
Lease nonces and authentication material must not become report content.

Do not collapse the current child process into the CLI without a disposal
contract: the existing channel bootstrap owns keepalive/signal behavior and
calls `process.exit()`.

Source:
`packages/agentic/storybook-desktop/config/server.cjs:24,96-102`.

## 6. Reporting and delegated output

### Research findings: why output can disappear from the combined view

The owner's reported symptom is consistent with the following source-inspected
gaps. This research did not reproduce a specific lost-output incident or prove
that every hidden diagnostic originates from the same path.

| Observed path                      | Current behavior                                                                                                                                                 | Consequence                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `NodeDesktopCommandRunner`         | Sends child stdout/stderr to one retained file; replays on failure or in verbose mode when reporting/stopping the command                                        | A live service can write useful output that never reaches the terminal until shutdown. Verbose is replay, not live forwarding.                  |
| Combined Storybook server          | Forwards native stderr to its own stderr; channel and WebDriver startup messages use its stdout                                                                  | Forwarding one process hop is insufficient when the outer runner captures that stream.                                                          |
| `driver()` lifecycle               | Starts Metro separately, then awaits the server command; Metro completion is not raced against the server for ongoing supervision                                | A delegated service's failure report and the parent's actual lifetime are not one coherent health/result contract.                              |
| Windows/Win32 smoke wrappers       | `Start-Process` redirects delegated commands to separate `.out.log`/`.err.log` files                                                                             | The generic command runner cannot automatically surface those grandchildren's diagnostic files; file retention alone is not console forwarding. |
| Existing grouping                  | Per-runner `reportQueue` serializes textual `BEGIN`/`END` replay                                                                                                 | Good local ordering, but neither Actions `group` commands nor a hierarchy shared across nested processes/runners.                               |
| Test workers and aggregate reports | Worker result files carry pass/skip/failure; console reporter output is a separate captured subprocess stream; aggregate status is based on presence of failures | Rendering, structured outcomes, and lifecycle are separate flows. All-skipped work can still yield a top-level `passed` label.                  |

Source anchors:

- `packages/agentic/storybook-desktop/src/cli/commandRunner.ts:76-145,175-198`
  and its `commandRunner.test.ts:29-116` explicitly exercise success suppression,
  replay-on-stop, and non-interleaved replay within one runner.
- `packages/agentic/storybook-desktop/config/server.cjs:18-31,67-99`;
  `packages/agentic/storybook-desktop/src/cli/DesktopStorybookCli.ts:143-185,379-409`.
- `packages/agentic/storybook-desktop/config/smoke-windows.ps1:32-45`;
  `packages/agentic/storybook-desktop/config/smoke-win32.ps1:41-54`.
- `packages/agentic/storybook-desktop/src/testing/worker.ts:20-67`;
  `packages/agentic/storybook-desktop/src/testing/runWdioTests.ts:151-174,221-229,268-307`;
  `packages/agentic/storybook-desktop/src/cli/smokeTests.ts:130-150,222-226`.

Preserve what already works: durable command logs, bounded-memory file replay,
failure causes, explicit worker results, evidence error reporting, and one-runner
replay serialization. Replace the fragmented ownership, not just the log prefix.

### A single reporting flow

```text
supervisor lifecycle ---------+
Node child services -- IPC ---+
WDIO reporter adapter -------+--> desktop-test collector --> events.jsonl
CSF worker/result adapter ----+            |                 run.json
Storybook integration --------+            |                 junit.xml
native diagnostic callbacks -+            +--> one presentation queue
third-party stdout/stderr ----+                      |
  (durable per-source logs)                    plain / Actions / JSON
```

The supervisor is the sole console/Actions owner. Services and integrations emit
events or provide raw streams; they never each start their own Actions groups,
append competing summaries, or print a second top-level result.

Use a small versioned envelope containing `schemaVersion`, `runId`, `eventId`,
`sourceId`, `sourceSequence`, `scopeId`/`parentScopeId`, timestamp, kind, and payload. The
collector adds an arrival sequence and correlation with endpoint, renderer,
service, spec/story/test, worker, and attempt as applicable. Do not correlate
events by parsing titles, choosing the most recently active test, or assuming
timestamps establish a total order across processes.

Give propagated failures a stable `failureId` so wrapper/context events can
reference the same cause without duplicating annotations or counting failures
twice. Redact known secrets and lease/authentication material before persistence
or presentation; do not dump complete environments or capabilities into logs.

Start with lifecycle/scope start/end, service ready/failed, diagnostic, output,
test result, artifact, and run-finished events. Validate envelopes and reject
malformed or incompatible structured producers explicitly. Preserve exception
name/message/stack/cause and aggregate children, with redaction, rather than
reducing delegated failures to an exit-code-only message.

For owned Node children, use dedicated IPC and a terminal result/flush handshake;
do not multiplex reporting JSON into ordinary stdout. Third-party tools keep
stdout/stderr capture adapters. Native helper stdout remains its framed protocol;
route its diagnostic callback instead of treating protocol bytes as text.
The existing native transport already separates these channels:
`packages/agentic/desktop-driver/src/hosts/native/NativeHostProcess.ts:75-85`.

During migration, a delegated CLI inherits reporting context and acts as an event
producer rather than constructing another default console renderer. PowerShell
wrappers must either return service descriptors for core-owned launch or bridge
their redirected files and terminal results into the collector. Merely printing
the path to a grandchild log does not satisfy the contract.

### Visibility, health, and completion guarantees

1. Emit service startup/readiness, warnings, typed errors, test start/end, and
   artifact locations promptly, without waiting for service termination.
   Render unstructured service stderr promptly with source/stream labels, but do
   not infer that all stderr is fatal. Bulk informational output may stay in
   retained logs or appear under verbose replay.
2. Observe required services for their entire owned lifetime. Unexpected exit,
   an explicit fatal event, or loss of readiness/control required by active work
   fails the owning phase, aborts dependent tests, and starts owned cleanup.
   Do not wait indefinitely for the outer combined server to exit.
3. Finalization distinguishes process exit, stream closure, event delivery, and
   sink flush. Await pipe/IPC drain and queued writes with a bounded deadline
   before final output and normal exit. Prefer `process.exitCode` to abrupt
   `process.exit()`. Distinguish expected stop from a crash.
4. Retain logs while they are produced, not just after a successful finish.
   Stream/spool rather than buffering the full run in memory. Bound disk/queue
   use and make truncation or transport loss explicit; never silently discard
   fatal events or terminal test results.
5. De-duplicate forwarded events using producer identity/sequence and diagnose
   missing terminal events. On worker crash or hard parent termination, retain
   the available journal and mark affected work incomplete. Do not promise
   exactly-once delivery through an uncatchable process kill.
6. Required journal/result/JUnit write failures are infrastructure failures.
   Optional presentation failures, such as an Actions summary upload, are
   reported explicitly with a fallback location. Neither may replace the
   original test failure or masquerade as a passing run.

The existing command runner resolves `completed` on `exit`
(`commandRunner.ts:193-198`). Node documents that child stdio may still be open
then; `close` occurs after process termination and stdio closure. This matters
when introducing piped/IPC aggregation. It is not, by itself, proof that today's
shared-file-descriptor implementation truncated a particular log.

### Test results are data, not parsed reporter output

Keep each test engine, but adapt both to the same normalized run result:

- WDIO uses its supported reporter lifecycle hooks for suites, hooks, tests,
  skips, runner failure, and retries. A reporter module is referenced in the
  generated runner configuration; do not pass non-serializable reporter
  constructors through the WDIO `Launcher` options. Hooks enqueue synchronously;
  pending transport writes participate in `isSynchronised` and the supervisor's
  bounded final drain.
- CSF uses its existing worker result contract plus supervisor outcomes for
  navigation, timeout, crash, evidence, and cleanup. Preserve authenticated story
  readiness and digest checks. Node `spec`/`tap`/`dot` text remains diagnostic
  output, not the source of test status.
- Static story plans adapt their existing structured step/test results. Attach
  console output to a test only when the engine provides that association;
  otherwise retain spec/service scope rather than guessing.

Keep stable test identity separate from attempt identity. Record pass, failure,
skip/unsupported reason, cancellation, not-run work, retry history, duration,
infrastructure errors, evidence errors, and artifact references. A retry that
passes must still expose the earlier failed attempt and flaky classification.

Generate `run.json`, console totals, JUnit, and Actions summary from this one
result model. Empty selection is an error. An all-skipped or unsupported cohort
is not `passed`; required-cohort policy must fail or mark it incomplete, while
an explicitly optional cohort may be reported as skipped. Missing worker results,
setup/hook failures, service crashes, and cleanup failures must be representable
even when no test body ran. JUnit must include those infrastructure errors rather
than inventing a successful testcase.

### GitHub Actions presentation

Auto-select the Actions renderer only for `GITHUB_ACTIONS=true`, with explicit
override available. Generic `CI=true` is not enough to print GitHub commands.

- Use actual `::group::`/`::endgroup::` commands, not textual `BEGIN`/`END`.
  Default to one completed spec/group for WDIO and one story/callback worker
  group for CSF, labeled with endpoint, renderer, source, and attempt.
- Emit short live progress/diagnostics outside groups; replay each completed
  group's captured output through one serialized writer. A long-lived Metro or
  channel service must not hold a group open for the entire run. Do not nest
  groups across concurrent producers or let unrelated service output appear
  under another test's group.
- Close groups in `finally` and during bounded failure/cancellation flush.
  Emit one attributed annotation per failure identity, with verified
  repository-relative file/line when known; preserve the original assertion or
  startup failure plus distinct cleanup/evidence failures without duplicating
  it at every wrapper layer.
- Escape annotation properties and data. Protect raw child output from being
  interpreted as runner workflow commands; when replaying raw batches, use the
  documented random-token `stop-commands`/resume mechanism under the same writer
  lock, then issue trusted annotations/groups outside that protected interval.
  Do not rely on a cosmetic prefix as command isolation.
- Write a bounded `GITHUB_STEP_SUMMARY` section with revision/target/renderer,
  selected/executed/result counts, unsupported reasons, retries/flakes,
  infrastructure outcome, and artifact references. Do not paste full logs.
  GitHub caps each step summary at 1 MiB and displays at most 20 per job.
- Keep `if: always()` artifact upload for journals, canonical results, JUnit,
  raw service/command logs, and evidence. Use unique run/endpoint/renderer/shard
  artifact names. A filesystem path is not a clickable Actions artifact URL;
  the upload step can add the real artifact URL to a later summary.

Current Storybook jobs already upload platform and command logs with `always()`;
extend that behavior rather than replacing it:
`.github/workflows/pr.yml:237-245,463-474,555-564`.
Rendering annotations or JUnit does not itself publish a GitHub check or alter
job status; the harness still returns the correct exit status, and any additional
check publisher is an explicit workflow choice, not a new token requirement.

### Reuse and implementation boundary

The repository already uses `@rnx-kit/reporter` in
`scripts/src/utils/getReporter.ts:1-13` and declares it in
`scripts/package.json:68`; `yarn.lock:9609-9611` resolves version 0.2.0.
Its installed README documents task hierarchies, timing/error events through
Node diagnostics channels, custom writers, and merged outputs.

Reuse those in-process logging/task/writer facilities where they satisfy the
contract, behind `desktop-test`'s reporting adapter; declare a direct dependency
when implementing rather than importing the scripts workspace. Do not assume
process-local diagnostics channels propagate across child processes or provide
the run/result/IPC protocol. Keep the latter owned and tested by the harness.
No new telemetry broker, reporter plugin registry, or standalone reporting
package is required.

### Reporting acceptance gates

Use deterministic fake services/workers before native qualification:

| Fixture                                                                              | Required result                                                                                                            |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Long-running service writes a diagnostic after readiness                             | Source-attributed diagnostic becomes visible before stop, without verbose                                                  |
| Metro/helper/channel fails while outer server remains alive                          | Parent fails the correct phase, aborts dependent work, and reports the original cause                                      |
| Direct child and grandchild interleave stdout/stderr, partial UTF-8, and late output | Durable captures are complete; source/stream metadata is preserved; only collector arrival order is claimed across streams |
| Two producers finish together                                                        | Each Actions group is contiguous/balanced; unrelated service output is not attributed to a test                            |
| Child prints workflow-command-shaped text                                            | No unauthorized annotation/group/runner command is executed                                                                |
| Worker fails, times out, crashes, or omits a result; setup hook fails                | Same non-passing outcome/cause appears in console, JSON, JUnit, and summary                                                |
| All tests skip, capability is unsupported, or selection is empty                     | No success-shaped `passed` aggregate; required/optional policy is explicit                                                 |
| Retry passes after failure                                                           | Both attempts and flaky status survive; totals do not double-count final tests                                             |
| Slow sink, write failure, cancellation, or abrupt service exit                       | Bounded completion, explicit reporting failure/incomplete state, retained evidence, no leaked owned resources              |
| Structured CLI mode under Actions                                                    | Machine stdout remains parseable and free of progress, ANSI, or group commands                                             |

Then exercise the same adapters on macOS, Windows, and Win32, including the
transitional PowerShell path. Test the emitted Actions command stream locally
and confirm actual grouping/summary/artifact behavior in an Actions lane.
This is a phase-1/2 prerequisite, not reporting polish deferred until retirement.

### External reporting references

Research checked October 21, 2026:

- [GitHub Actions workflow commands](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands):
  groups, annotations, command isolation, summaries, and step-summary limits.
- [Node child process `close`](https://nodejs.org/api/child_process.html#event-close)
  and [`exit`](https://nodejs.org/api/child_process.html#event-exit):
  process termination versus stdio closure.
- [WebdriverIO custom reporters](https://webdriver.io/docs/customreporter/):
  lifecycle events, synchronous event callbacks, `isSynchronised` for pending
  reporter work, and `Launcher` reporter serialization constraints. Implement
  against the repository's pinned WDIO version, not unverified newer hooks.

## 7. Platform/application boundaries

| Endpoint                | Existing legacy app               | Required treatment                                                                                                           |
| ----------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| macOS                   | `apps/fluent-tester`, RN Test App | Verify actual renderer/build identity; do not infer runtime mode from a Pod entry                                            |
| Windows                 | `apps/fluent-tester`, RN Test App | Verify generated Fabric setting and packaged identity; do not presume UWP from old docs                                      |
| Win32                   | `apps/win32`, prebuilt REX/Paper  | Windows helper with `win32` endpoint; preserve cwd/args/title and bundle-driven launch; native app build remains unsupported |
| Storybook macOS         | `apps/storybook`                  | Preserve Fabric and Paper lanes and prep-on-renderer-switch                                                                  |
| Storybook Windows/Win32 | `apps/storybook`                  | Preserve distinct identities, platform exclusions, host-specific chrome and launch behavior                                  |

**Important reciprocal-review correction:** omitting `--use-fabric` does not
establish that FluentTester Windows is UWP/Paper. The pinned RN Test App 5.3.3
generator defaults to Fabric for RNW 0.80+, and the resolved RNW is 0.81.35.
Fresh generation is therefore **inferred** to be Fabric. Inspect generated
`UseFabric` and the actual running app before qualification; no separate renderer
migration is justified by the omitted flag alone.

Sources:
`yarn.lock:21897-21899,21947`;
installed `react-native-test-app/windows/project.mjs:481-493` and
`windows/app.mjs:358-385`;
`.github/workflows/pr.yml:376-392`.
Installed dependency paths are version-specific evidence, not permanent repo
paths.

Generic Windows attach also needs stronger identity than a title alone. Current
unleased attach matches a unique exact title across processes; old E2E attaches
by HWND. Prefer a verified owner lease or executable/AUMID-qualified identity;
neither title-only selection nor "first ReactApp process" is a safe generic
replacement. Validate PID reuse, duplicate titles, and packaged ownership.

Sources:
`packages/agentic/desktop-driver/native/windows/src/application.cpp:965-985`;
`apps/E2E/wdio.conf.windows.js:36`;
`apps/E2E/launchE2EWindows.ps1:14-27,69-70`.

## 8. Compatibility work: package extraction alone will not migrate E2E

The WebDriver wire protocol is not an Appium semantic compatibility guarantee.
Inventory actual selected tests and their command paths before changing them.

| Area                      | Observed mismatch                                                                                                                                                                                                               | Recommended handling                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WDIO visibility/focus** | With WDIO 9.24 and current desktop capabilities, `isDisplayed` takes the browser JavaScript path; `isFocused` also executes JavaScript. The server rejects `execute`. `waitForDisplayed` is used during initial page readiness. | Central native-command compatibility installation for `remote`, `attach`, and WDIO-managed workers. Route visibility/focus to supported native queries. Test waits and assertion consumers. Do not spoof Appium identity or enable arbitrary execution. |
| Selectors                 | macOS hooks use XCUI XPath; driver supports accessibility ID, role/tag, accessible name/link, and text, not XPath                                                                                                               | Replace accidental platform-specific hooks with supported selectors/window behavior. Implement a new selector only when required by real test intent.                                                                                                   |
| Attributes/state          | Legacy names such as `Name`, `ControlType`, `HasKeyboardFocus`, and `Toggle.ToggleState` differ from normalized properties and types; unknown attributes return `null`                                                          | Migrate a shared page-object adapter with explicit mappings. Add missing justified native state contracts; preserve provider-specific accessibility assertions rather than normalizing them away.                                                       |
| Checked vs selected       | Legacy mode switch uses `isSelected`; UIA toggle checkedness is distinct from SelectionItem state                                                                                                                               | Change toggle assertions to `checked`. Do not globally redefine `selected` as checkedness.                                                                                                                                                              |
| Keyboard                  | `keys.join()` introduces commas; typed units press/release modifiers rather than preserving a chord; disabled-element send-keys may fail focus validation                                                                       | Replace chords with explicit W3C key actions and releases; test cancellation/repetition/Unicode. Decide and document element-send-keys modifier semantics separately.                                                                                   |
| Window sizing             | Legacy setup calls `maximizeWindow`; driver routes currently support handles/switch/close/rect, not maximize                                                                                                                    | Implement and qualify maximize only if needed, or explicitly change setup intent. Setting a rectangle is not automatically maximize.                                                                                                                    |
| Popups/focus              | Search is current-window scoped; legacy page objects often assume root-wide lookup or treat extra windows as assertion failures                                                                                                 | Preserve explicit window scope; update tests to identify popup ownership and restore focus. Measure before adding optional app-wide lookup.                                                                                                             |
| Desktop scrolling         | Windows navigation can reach a helper whose default branch emits Android UiScrollable selectors                                                                                                                                 | Separate desktop navigation/scrolling from mobile helpers. Keep mobile paths and dependencies.                                                                                                                                                          |
| Runner grouping           | Legacy hooks, globals, retries, Jasmine matchers, and suite state differ from story callbacks                                                                                                                                   | Preserve WDIO/Jasmine and grouped arrays; change transport and semantics incrementally.                                                                                                                                                                 |
| REX startup               | Legacy config supplies working directory; native application descriptor lacks it                                                                                                                                                | Add trusted adapter/server-owned cwd or supervisor launch with an exact attach lease; qualify actual argument/cwd requirements.                                                                                                                         |

Key source anchors:

- Visibility: `packages/agentic/desktop-driver/src/wdio/DesktopWebdriver.ts:113-148`;
  `packages/agentic/desktop-driver/src/protocol/capabilities.ts:96-106`;
  `packages/agentic/desktop-driver/src/server/createDesktopDriverServer.ts:740-741`;
  `apps/E2E/src/common/BasePage.ts:172-186,298-300`.
  Both reviewers also inspected installed WDIO 9.24's `isDisplayed`/`isFocused`
  implementations and native/mobile session detection.
- Selectors/window routes:
  `apps/E2E/wdio.conf.macos.js:115-132`;
  `packages/agentic/desktop-driver/src/server/createDesktopDriverServer.ts:449-496,649-705`.
- State:
  `apps/E2E/src/common/consts.ts:32-43,77-84`;
  `apps/E2E/src/common/BasePage.ts:100-126`;
  `packages/agentic/desktop-driver/native/windows/src/automation.cpp:586-625`.
- Input:
  `apps/E2E/src/common/BasePage.ts:200-202`;
  `packages/agentic/desktop-driver/native/windows/src/input.cpp:447-466`;
  `packages/agentic/desktop-driver/native/macos/Sources/DesktopDriverHost/Input.swift:189-203`.
- Windows/mobile and popup assumptions:
  `apps/E2E/src/common/BasePage.ts:79-89,211-294,386-411`;
  `apps/E2E/wdio.conf.win32.js:166-178`.
- Runner/REX:
  `apps/E2E/src/ButtonV1/specs/ButtonV1.spec.win.ts:5-24,56-103`;
  `apps/E2E/wdio.conf.win32.js:4-7,25-28`;
  `packages/agentic/desktop-driver/src/native/types.ts:58-66`.

Not every mismatch requires a new driver feature. Prioritize the selected pilot's
real requirements; retain explicit unsupported results rather than invented
values or broad compatibility shims.

## 9. Phased delivery and gates

| Phase                                       | Owning surface                           | Deliverable                                                                                                                                                                              | Exit gate                                                                                                                                                                 |
| ------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0. Baseline and probes**                  | E2E + native driver + current supervisor | Inventory exact selected cases, commands, state assertions, grouping, existing failures, renderer, host identity, input policy, and every delegated output path                          | Recorded baseline and blocker list per endpoint; confirm Windows generated renderer and capture a reporting-gap fixture                                                   |
| **1. Generic boundary and reporting spine** | `desktop-test` + driver                  | Canonical schema/resolver, controlled native target composition, adapters, ownership/readiness, real `serve`, event collector/journal, live diagnostics, one renderer and flush contract | Plain app works without Storybook; fake-service tests prove child/grandchild forwarding, required-service failure, bounded shutdown, and isolated Actions commands/groups |
| **2. WDIO compatibility/pilot**             | Driver `/wdio` + harness + E2E           | WDIO/Jasmine launcher and reporter adapter, visibility fixes, shared page-object adaptation, representative specs, canonical JSON/JUnit/summary                                          | Pilot passes with required capabilities; grouped output/result parity and retry/skip/hook/crash contracts pass; no blocked sessions/input/app leaks                       |
| **3. Storybook as consumer**                | Storybook tooling/runtime/app            | Same schema; optional integration; one supervisor and collector; existing traversal/CSF lifecycle and normalized results                                                                 | macOS Fabric/Paper, Windows, Win32 behavior and live diagnostics preserved, including nested PowerShell paths; no weakened readiness or exclusions                        |
| **4. Comparative migration**                | E2E apps + CI                            | Old/new lanes on equivalent app builds, explicit test mapping, semantic comparisons, Actions summaries and always-uploaded artifacts                                                     | Each endpoint meets parity/reliability gates; real Actions grouping, annotations, summary, and artifact references verified                                               |
| **5. Retirement**                           | E2E + CI + docs                          | Remove obsolete desktop transport configs/scripts/dependencies                                                                                                                           | No remaining desktop consumer depends on old transport; mobile still works                                                                                                |

Recommended pilot: Win32 Button plus Checkbox/Switch state, a keyboard/focus case,
a scrolling case, and a popup/window case. Then establish macOS and Windows parity
with their actual selected cohorts. Do not infer macOS coverage from a richer
Win32 suite or count a navigation-only case as a behavioral assertion.

For each baseline unit `(endpoint, spec/group, test title)`, record migrated,
rewritten-with-mapping, or explicitly waived status. Compare assertion intent,
not just counts. A waiver requires a reviewed reason; reduced functionality or
missing capabilities must not silently become success.

Use the existing driver qualification target: **at least 100 representative
executions per endpoint over 14 days, at least 99% infrastructure success, and
zero process/input leaks**, alongside semantic parity. A smaller pilot is not a
replacement for that gate.

Source: `packages/agentic/desktop-driver/PLAN.md:112-115`.

### Validation and CI ownership

| Layer                         | Required evidence                                                                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Driver                        | W3C/fake-host contracts; native WDIO visibility/focus/waits; unsupported state; stale elements; target reservation and cancellation                                                                                           |
| Native helpers                | Matching-OS builds/handshakes; verified artifacts; launch/attach identity; input/state/capture; crash and orphan recovery                                                                                                     |
| Generic harness               | No-Storybook consumer installation/import test; same-schema references; config-relative paths; optional stages; session/worker cleanup; external-app preservation                                                             |
| WDIO integration              | Real Jasmine/global/hook/group/retry behavior; no duplicate sessions; worker crash/timeout/interrupt; reporters and artifact failure paths                                                                                    |
| Storybook integration/runtime | Existing extraction/digests/static plans; authenticated readiness and stale-message rejection; navigation/remount; worker failure/timeout contracts; renderer switching                                                       |
| Reporting                     | Section 6 fixtures; cross-process attribution; live service diagnostics; required-service health; complete drain/flush; result parity across sinks; balanced Actions groups; safe raw replay; incomplete/all-skipped handling |
| App lanes                     | Existing FluentTester macOS/Windows and REX Win32 builds plus selected legacy assertions; separate Storybook platform/renderer regressions                                                                                    |
| Interactive qualification     | Physical input, focus, popup windows, wheel/DPI, capture/occlusion, cross-supervisor contention, repeated reliability and zero leaks                                                                                          |

Reuse `.github/actions/setup-desktop-driver`; its workspace input is already
general enough for non-Storybook consumers. Keep explicit helper build/doctor and
prebuilt-only resolution during test execution. Do not compile native helpers
during package installation or download them opportunistically.

Source:
`.github/actions/setup-desktop-driver/action.yml:36-53,102-120,134-160`.

**Hosted-input gate:** current Storybook hosted lanes disable physical click on
macOS and keyboard/click/wheel on Windows. These lanes cannot qualify equivalent
legacy physical-input behavior under that policy. Recommend retaining hosted
build/traversal/non-input checks and qualifying input on managed interactive
desktops. Any decision to enable hosted physical input needs an explicit policy
and evidence; accessibility activation is not proof of physical clicking.

Source: `.github/workflows/pr.yml:214-220,432-438,544-549`.

During implementation, run each changed workspace's declared checks, matching-OS
native qualification where applicable, then repository-required
`yarn clean-lage-cache` followed by `yarn lage buildci`. JavaScript contracts and
bundles do not substitute for native app evidence.

### Retirement details

Remove desktop `wdio.conf.{macos,windows,win32}.js`, redundant desktop launch
scripts, WinAppDriver setup, and desktop-specific Appium driver dependencies only
after the corresponding endpoint gates pass.

Keep the Appium service and mobile driver/config dependencies needed by iOS and
Android. Preserve `@fluentui-react-native/e2e-testing` constant exports consumed
by `tester-core`; removing desktop automation must not break test IDs imported
by application pages.

Sources:
`apps/E2E/wdio.conf.android.js:40-46`;
`apps/E2E/wdio.conf.ios.js:38-44`;
`apps/tester-core/package.json:45`.

Also update package exports/dependencies, root TS project references, changesets,
CI paths and names, app scripts, Metro/Babel adapters, ignores, documentation,
agent maps, and scoped guidance in the same implementation sequence. There is no
need to combine a wholesale directory relocation with the architectural split.

## 10. Remaining implementation decisions and risks

| Decision/risk                      | Plan/default                                                                                       | Evidence needed to change it                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Package architecture               | **Settled: Option 1**, neutral harness plus separate Storybook integration                         | A new explicit owner decision; not an implicit implementation simplification                                       |
| App lifetime across story sessions | Existing supervisor lease + attach                                                                 | A separately designed driver keepalive contract with crash/relaunch/teardown coverage                              |
| Element-send-keys modifiers        | Migrate chords to actions now; specify sticky-modifier support or explicit rejection separately    | W3C/native conformance cases; no silent press/release mismatch                                                     |
| Popup lookup                       | Explicit identified-window switching                                                               | Measured need for opt-in app-wide scope without ambiguous lookup or stale references                               |
| Unknown attributes/provider state  | Keep protocol behavior explicit; migrate supported semantic mappings and report unsupported state  | A justified namespaced provider-state or new normalized-property contract                                          |
| FluentTester Windows renderer      | Verify freshly generated `UseFabric`; do not assume UWP                                            | Generated project plus actual launched runtime/build evidence                                                      |
| Windows attach identity            | Exact verified lease or strong executable/AUMID identity                                           | Duplicate-title, PID-reuse, package-collision, and external-app preservation tests                                 |
| Generic runtime                    | None initially                                                                                     | A real second instrumented consumer needing authenticated JS/render milestones                                     |
| Physical input on hosted CI        | Do not count disabled-input lanes as qualification                                                 | Owner-approved policy plus repeatable native input evidence                                                        |
| Reporting                          | One collector/renderer in the harness, typed producer adapters, durable results and Actions groups | Implementation fixtures close transport/flush details; logging-library choice must preserve the reporting contract |

The architecture decision is closed. The remaining rows are implementation
contracts or qualification gates, not competing package plans.

## 11. Research provenance and reciprocal-review reconciliation

| Topic                    | Initial disagreement or omission                                           | Reconciled plan                                                                                        |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Packaging                | Opus preferred three packages; Astra preferred four                        | Both now prefer four because lazy subpaths do not isolate installed dependencies/releases              |
| WDIO native behavior     | Astra initially missed visibility/focus JavaScript execution               | Both verified it; command compatibility is an early migration blocker                                  |
| Windows renderer         | Opus inferred UWP from omitted flag; Astra initially treated it as unknown | Both checked the pinned generator and retracted the UWP inference; verify fresh generated/running mode |
| Config ownership         | Astra's initial app configs imported E2E suite definitions                 | Test-to-app dependency direction; same-format app targets referenced by the suite config               |
| Runtime extraction       | Astra floated a generic runtime entry point                                | Defer it; ordinary native apps need no runtime                                                         |
| Selected vs checked      | Opus proposed a driver fallback                                            | Withdrawn; adapt toggle tests to checked semantics                                                     |
| Windows scrolling        | Opus initially considered mobile branches unreachable on desktop           | Corrected: Windows can enter Android-specific scrolling; separate the paths                            |
| WDIO-centric alternative | Opus's initial alternative assumed two authored config formats             | Strengthened Option 3 preserves the single canonical format with generated WDIO config                 |
| App keepalive            | Driver-retained service lifetime vs supervisor ownership                   | Preserve current leases initially; no incidental driver lifetime redesign                              |
| Qualification            | One initial proposal suggested a smaller run window                        | Existing 100-run/14-day gate remains authoritative                                                     |

**Provenance:** local artifacts `opus-driver-initial.md`,
`astra-driver-initial.md`, `opus-driver-cross-review.md`, and
`astra-driver-cross-review.md`. This plan incorporates both complete reciprocal
reviews, not just their displayed summaries.

**Decision update:** the owner accepted Option 1 on October 21, 2026, and requested
formal reporting research. Section 6 is follow-up source/documentation research,
not a claim that both original models re-reviewed the new reporting design.

**Planning-time validation status:** repository source, relevant installed dependency
implementations, tests, CI definitions, and upstream reporting documentation
were inspected. Application launches, builds, native tests, reporting fixtures,
and parity/reliability runs were **not run**; no implementation,
incident-reproduction, or native-qualification claim is made.
