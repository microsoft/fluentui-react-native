---
id: desktop-test.lifecycle
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Lifecycle and ownership

The generic supervisor owns required services, WDIO workers, the WebDriver
listener, and static typed resource contributions. A contribution has a stable
ID, dependencies, ownership mode, and a side-effect-free plan whose acquisition
and disposal are tracked as one resource generation. Dependencies are validated
and topologically ordered before acquisition. Owned resources are disposed in
reverse order; borrowed resources are recorded but never disposed.

A launched application's lifetime is currently session-owned; attached
applications have an external owner. Storybook still takes over the CLI lifecycle,
with channel and embedded driver listeners in a child process. This exception is
transitional, not a fully migrated resource graph. An integration's `run` borrows
the supervisor's service scope: it observes the scope signal and must never close
the scope, which the CLI closes after the run settles. Once a stop is requested,
the CLI waits at most 60 seconds for the run before it closes the scope anyway. The intended boundary is one
neutral `desktop-test` workload host with optional Storybook contributions, not
a driver or MCP orchestrator.

Services report readiness and failures through the shared run lifecycle.
Required-service failure aborts dependent work. Listener/descriptor-ready does
not prove app-ready, runtime-connected, or story-context-ready.
Process-backed services may use `readyProcess(id, expected)` with an explicit
`service-ready` service and optional descriptor expectation. The runner must
provide correlated readiness; a missing waiter or mismatched receipt fails
closed. The recorded receipt retains its service-ready tier, incarnation, and
producer PID. HTTP readiness remains available for services without process
readiness publication.

Process-backed contributions return the authenticated
`DesktopServiceReadyRecord` from `/process-control`, not a readiness expectation
or a ready-file observation. Resource records retain its service, descriptor,
command incarnation, and producer PID alongside the resource generation.
Only `service-ready` is accepted; target acquisition, application readiness,
and context readiness require separate verification.

Cleanup drains worker reporting and stdio, closes sessions, releases owned
input, and stops exact owned process trees. Services and resources are disposed
together in reverse acquisition order. An externally owned app is preserved.

Cancellation reaches running commands. Stage commands and WDIO suites receive
the scope signal; when it aborts, the command's process tree is stopped and the
command reports failed with "Stopped before it finished.", never passed. Services
are stopped by close, in the same reverse order. On macOS and Linux each command
leads its own process group, and stopping it signals the whole group, including
descendants whose parent already exited: SIGTERM, then SIGKILL if the group
outlives the shutdown timeout. A process that leaves the group, such as an app
started through LaunchServices, needs its own owned resource. On Windows,
`taskkill /T /F` stops the tree only while the command's exit is unrecorded,
and runs synchronously: Windows reuses a process ID only after every handle to
the process closes, and Node closes its handle while processing the exit on the
same event loop, so the ID cannot name another process. A failed `taskkill` is
judged by the recorded exit, never by probing the ID. This is not containment:
`/T` follows parent process IDs, so a descendant whose parent already exited
escapes until Job Object containment exists. A command never starts after its
signal has aborted, and a spawn that throws synchronously leaves no tracked
process behind.

Interrupts stay handled until cleanup completes. The first SIGINT, SIGTERM, or
SIGHUP requests a graceful stop; the second force-kills owned process trees
while cleanup continues; the third exits immediately with status 128 plus the
signal number and leaves the claim for inspection. An interrupted one-shot run
reports terminal `incomplete` and exits 1. A clean long-lived `serve` stop is
terminal `passed` and exits 0 after descriptor withdrawal, grant/session drain,
listener and reporting transport close, and exact claim release. A required
child's failure delivered before the interrupt remains a failed run, not a
successful cancellation. Failed disposal retains the fenced claim even though
the terminal report is written and the CLI exits 1.

On Windows a physical console Ctrl+C reaches every process attached to that
console, so child exit and parent interruption can race. In-process
`process.emit('SIGINT', 'SIGINT')` exercises the installed handler but is only
semantic regression coverage; `child.kill('SIGINT')` on Windows terminates the
child and is not graceful-console or physical-input qualification.

The `agent-interrupt-borrowed-cli` contract deliberately recreates the retired
composition: an integration awaits its borrowed scope's `close()` after stop,
while the historical CLI guards that integration in the same scope. The
command resource settles first; an old CLI then hangs with an active claim
and nonterminal report. Current integrations must still leave borrowed scopes
to their owner, as checked by the borrowed-scope regression in
`packages\agentic\storybook-desktop\src\cli\DesktopStorybookCli.test.ts:836–861`.
The CLI subprocess regression checks the separate owner-side repair without
claiming a physical Windows console broadcast.

The generated-descriptor service bridge allows 60 seconds per command shutdown
phase so a nested scope can use its 45-second disposal budget and flush reporting
and stdio before the bridge exits. A missed deadline or failed terminal handshake
still fails cleanup; a passing test result never overrides it.

Commands keep their arguments as separate values. Windows executable lookup and
command-shim escaping use `cross-spawn`, without Node's deprecated
`spawn` argument array plus `shell: true` combination.

Interactive runs acquire a per-user `interactive.lock`; concurrent workloads
fail closed. The claim lives in `~/Library/Caches/com.microsoft.fluentui-react-native.desktop-test/workload`
on macOS, `%LOCALAPPDATA%\Microsoft\FluentUIReactNative\desktop-test\workload`
on Windows, and `~/.cache/fluentui-react-native/desktop-test/workload` elsewhere,
independent of `TMPDIR`, so every checkout contends for the same claim. Claim
records are replaced atomically. If a crash leaves a lock, inspect its recorded owner and verify
that process and its resources have stopped before removing that exact lock.
There is no automatic stale-lock recovery.

The supervisor registers each owned resource before acquisition starts. If
cancellation wins while acquisition is in flight, shutdown waits for that work;
a resource that arrives late is disposed before a successful shutdown settles.
Guarded work is also drained before close completes, for at most the scope's
`drainTimeoutMs` (60 seconds by default); work that is still running then is
reported as a cleanup failure, and disposal proceeds. A resource observer that
throws does not stop disposal; its failure is reported after cleanup. A failed or
timed-out disposal remains unsettled and retains the claim.

The versioned workload record stores a random owner ID, process ID and recorded
start timestamp, run ID, registered target ID, physical target instance ID, and each
resource's identity, generation, ownership, readiness, and disposal state.
Unresolved effects fence the claim. Claim inspection distinguishes a live owner,
an exited owner, an unknown probe, and a reused PID; inspection never reclaims a
claim, and uncertain or unsettled resources prevent release. The recorded start
timestamp comes from the Node.js clock, not from the operating system, and
inspection compares it exactly, so a probe that reports the operating-system start
time classifies a live owner as a reused PID. Treat `pid-reused` as unproven until
the claim records a helper-described start time. Reporting-session
inheritance is separate from explicit workload-claim delegation.

Both native service paths use the real `driverService.ts` composition root
(`@fluentui-react-native/desktop-test/driver-service`). It resolves prebuilt
helpers with `buildPolicy: 'never'`, creates native hosts, loads durable
settlement state before serving, probes the host, then publishes any protected
agent descriptor. Shutdown withdraws the descriptor and revokes its grant
before awaiting the driver listener, session settlement, and host disposal.
The Storybook channel/driver remains a supervised child.

Recovery uses the platform's validated owner-only private storage, with a
bounded hashed namespace derived from the endpoint and registered target ID.
Ports, run IDs, helper builds, service incarnations, descriptor roots and grants
do not change that namespace. Keep the registered target ID stable across
restarts. An explicit trusted `recovery.root` selects a separate private root;
it must be provisioned with the platform's ownership requirements, never deleted
as disposable run output. Tests and custom hosts can supply `recovery.storage`
and `recovery.probeApplication`; these are operator APIs, not client inputs.

An unreadable store aborts startup without publishing a descriptor. Corrupt
records quarantine the target without application identity, even when a sibling
record is valid. Only an exact recorded process ID/start-time probe can prove
application exit; native exit events and service death are not proof.
`service.recoverTarget` retains the driver's trusted exact-quarantine-ID
operator API; no new listing, offline recovery command, or model-facing
recovery route is exposed. Automatic stale-claim removal remains unsupported.
Inspect exact resources before explicit operator recovery; restarting alone
never clears uncertain native or Storybook mutations.

Keep reporting runs distinct from physical workload claims, resource ownership,
application ownership, grants, native sessions, input locks, and context epochs.
Integrations contribute through the public
`@fluentui-react-native/desktop-test/resources` and `/ownership` subpaths rather
than taking over CLI output and supervision. Management/run API schemas belong here.
Attached-app MCP/WDIO handoff can be developed independently of supervisor-owned
native launch, but both must wait for session drain and preserve external apps.

Generic attach-only services now support an explicit
[MCP/WDIO handoff](wdio-suites.md#reuse-an-attached-agent-service). The serving
supervisor retains its claim, listener, host, and required services. The
standalone runner borrows that service but owns its reserved grant subtree;
WDIO owns each worker session. Worker completion, crash, cancellation, and
parent cleanup all await terminal grant drain before releasing the reservation.
Old sessions and their references/cursors/proofs/artifact links are never
transferred. A cleanup failure is not permission to start a new controller.
This does not retain a session-launched application or migrate Storybook's
transitional lifecycle.

Configured target aliases receive distinct registered IDs while retaining the
same physical `instanceId` when they resolve to the same application identity.
Do not use an alias as proof that two targets are physically distinct.

See [current status](current-status.md) for remaining gates and recorded evidence.

- **R-DTEST-001:** Unmatched patterns, empty groups, all-skipped required
  cohorts, and unfinished selected work are not passes. Do not narrow selection
  or change required coverage to make a run pass without an owner decision.
