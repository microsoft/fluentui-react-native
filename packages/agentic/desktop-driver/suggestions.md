# Refactor implementation record

This file is the concise outcome of the architecture review that produced the current
`@fluentui-react-native/desktop-driver` design. It is retained as a decision record, not as a
second backlog or usage guide.

For current information, use:

- [README.md](./README.md) for package orientation and quick start;
- [USAGE.md](./USAGE.md) for integration and operating recipes;
- [DESIGN.md](./DESIGN.md) for implemented architecture and invariants; and
- [NEXT-STEPS.md](./NEXT-STEPS.md) for all unfinished work and open decisions.

## Review process

Two independent long-context investigations reviewed the package and its `apps/storybook`
integration. Each report covered public APIs, configuration, discovery, WebdriverIO integration,
server topology, ownership, lifecycle, protocol, artifacts, and native constraints. The agents
then cross-reviewed one another before their recommendations were combined.

The reviews agreed that the native backend mechanics were already sound. The primary problems were
duplicated configuration, a broad public surface, transport indirection, unclear dependency
boundaries, and reporting gaps that could obscure infrastructure failures.

## Implemented outcome

Refactor Phases 0-5 are complete.

### Phase 0: truthful behavior

- shared-spec validation ignores platform words in checkout paths;
- startup, session, readiness, timeout, cancellation, and cleanup failures produce structured
  artifacts;
- result taxonomy distinguishes passed, failed, skipped, cancelled, timed out, and infrastructure
  error;
- complete reports are not truncated;
- per-spec worker reports merge without overwriting one another or losing launcher failures;
- Run all uses one warm WDIO invocation and streams framework results;
- artifact capture returns only the files captured by that call; and
- Windows runner resolution honors `PATH` and `PATHEXT`.

### Phase 1: shared config and protocol

- one schema-versioned `desktop.config.ts` drives discovery, generation, WDIO, host startup,
  readiness, artifacts, and platform targets;
- config loading validates every platform, canonicalizes inputs, confines outputs, reports
  non-sensitive provenance, and fingerprints discovery inputs;
- manifest, generated spec, and React Native runtime projection commit transactionally; and
- React Native and Node share one dependency-free protocol package with runtime decoders.

### Phase 2: Storybook migration

- `apps/storybook` derives stories, WDIO options, runtime channel data, and Windows orchestration
  from the common config;
- package CLI commands own story list, select, args, and smoke control;
- duplicate app-owned REST clients are removed;
- app protocol tests and fake E2E run through the normal workspace test task; and
- process supervisors consume atomic host-ready JSON rather than copied ports and identities.

### Phase 3: direct coordination

- the Storybook channel calls a transport-free `RunCoordinator` directly;
- the tokenized HTTP run service and announcement path are removed; and
- one active-run invariant owns validation, progress, cancellation, and shutdown.

### Phase 4: module boundaries

- server/channel, runner, native WebDriver hosting, WDIO readiness, run context, standalone
  lifecycle, reporting, and loopback concerns have explicit modules;
- compatibility shims are removed;
- import-boundary tests prevent dependency direction from regressing; and
- window attribute reads use bounded concurrency without caching native handles.

### Phase 5: public and package surface

- public exports are limited to authoring, config, protocol, WDIO, server, Storybook generation,
  and explicit platform extensions;
- ambiguous service and handle names are replaced;
- Node 22.12 is the runtime floor; and
- the publish allowlist excludes source, tests, planning files, and stale compatibility output.

## Decisions preserved by the refactor

- WebdriverIO is the portable authoring API; Appium driver classes remain implementation details.
- Metro is a separate explicit bundle server.
- All listeners remain loopback-only.
- Attach never grants termination ownership.
- Story discovery is static and never executes story modules.
- Inline plans and linked specs remain separate supported authoring modes.
- One desktop is one serial shared resource unless a future design isolates every app, port, host,
  and artifact root.
- The fake backend proves package plumbing, not native compatibility.
- The W3C route host remains product infrastructure for the fake backend and future Appium-host
  changes.

## Remaining work

There is no unfinished refactor work in this file. Native proof, release gates, harness retirement,
and open design decisions are tracked only in [NEXT-STEPS.md](./NEXT-STEPS.md).
