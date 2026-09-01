# Desktop driver development

These instructions apply to `packages/agentic/desktop-driver`.

## Module ownership

- `protocol/` owns W3C parsing, errors, capabilities, actions, and deadlines.
- `server/` owns target/session/window/element state and HTTP routing.
- `host/` defines the platform-neutral native contract.
- `hosts/fake/` is the deterministic Stage 1 provider.
- `hosts/native/` owns the framed helper process and `DesktopHost` adapter.
- `native/` owns build, cache, resolution, verification, and native wire types.
- package-root `native/` contains checked-in operating-system source only.
- `authoring/` owns serializable plan and result contracts.
- `runner/` executes plans and classifies outcomes.
- `wdio/` is the sanctioned high-level automation integration.
- `agent/` exposes bounded JSON-safe operations.
- `artifacts/` confines and atomically persists evidence.
- `cli/` parses commands and adapts structured APIs to JSON and exit codes.
- `testing/` owns reusable fake harnesses, not production fallbacks.

## Invariants

- Do not import Storybook, React, or React Native from this package.
- Keep protocol, client, authoring, runner, evidence, and fake-host code
  platform-neutral.
- Put future operating-system integrations behind `DesktopHost`; do not branch
  on `process.platform` outside host-provider selection.
- Never write native output beneath the package, `node_modules`, or a pnpm
  store. Use immutable verified artifacts in the configured native store.
- Never download a helper automatically. Explicit helper and install-root
  selections fail closed when verification fails.
- Verify the actual long-lived helper process before target registration; a
  short-lived probe is not a substitute.
- Keep the W3C server client-neutral. WebdriverIO belongs only in `wdio/`,
  agent/CLI composition, and contract tests.
- Register targets on the server. Never accept arbitrary commands, environment
  variables, or output paths from WebDriver capabilities.
- Permit one active session per target and reserve the target before any async
  launch/attach work.
- Serialize commands per session and serialize all physical input across
  sessions. Never dispatch reset, release, deletion, or another action around
  an in-flight command.
- Preserve attached applications and clean up only resources recorded as owned.
- Apply deadlines to probe, launch, host command, cleanup, and dispose paths.
- Honor every `DesktopHost` `AbortSignal`: stop side effects and settle promptly
  before the command queue advances. A provider may never complete input after
  timeout cleanup.
- Release depressed input on failure, cancellation, and session deletion.
- Keep physical-input ownership serialized across independent helper processes,
  not only inside one Node server.
- Reject browser-origin requests and non-loopback serving by default.

## Authored plans

- Plans are versioned static JSON under `parameters.desktopDriver`.
- Keep selectors, steps, capability requirements, results, manifests, CLI
  output, and agent output serializable.
- Reject unknown fields and dynamic values rather than silently dropping them.
- Never translate an unsupported native property into `false`.
- Use stable `testID` selectors for deterministic actions; role/name selectors
  validate accessibility semantics.
- Keep platform differences declarative through `platforms`, `requires`, and
  explicit skip results.

## Evidence and agents

- Confine every artifact beneath the configured run root.
- Preserve the original test failure when evidence capture also fails.
- Bound agent tree depth and node count.
- Do not expose native handles or unrestricted command execution.
- The Storybook MCP remains separate; do not add a schema-only MCP claim.

## Validation

Run the package's declared format, lint, build, and test scripts. Contract tests
must cover raw W3C, the typed client, WebdriverIO custom commands, JSON CLI,
agent operations, artifacts, target concurrency, shutdown races, and
representative Storybook plans before repository-level validation.
