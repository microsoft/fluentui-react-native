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

A launched application's lifetime defaults to session-owned. Native targets may
opt into `ownership: 'supervisor'`: the supervisor launches once before service
publication, lends attached leases to sessions, and closes the original exact
incarnation only at supervisor disposal. Attached applications always have an
external owner. Storybook still takes over the CLI lifecycle,
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
reports `incomplete`.

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
There is no general automatic stale-lock recovery. The bounded Windows native
application reconciliation described below is the only startup exception.

The supervisor registers each owned resource before acquisition starts. If
cancellation wins while acquisition is in flight, shutdown waits for that work;
a resource that arrives late is disposed before a successful shutdown settles.
Guarded work is also drained before close completes, for at most the scope's
`drainTimeoutMs` (60 seconds by default); work that is still running then is
reported as a cleanup failure, and disposal proceeds. A resource observer that
throws does not stop disposal; its failure is reported after cleanup. A failed or
timed-out disposal remains unsettled and retains the claim.

Schema 3 workload records store a random owner ID, process ID and optional native
process identity, run ID, registered target ID, physical target instance ID, and each
resource's identity, generation, ownership, readiness, and disposal state.
Unresolved effects fence the claim. Claim inspection distinguishes a live owner,
an exited owner, an unknown probe, and a reused PID; inspection never reclaims a
claim, and uncertain or unsettled resources prevent release. Native owner identity
comes from desktop-driver's OS process-identity probe, not the Node.js clock.
Schema 2 records remain readable but inspect as `unknown` without probing their
incompatible wall-clock timestamp. A schema 3 record without a verified native
identity also remains `unknown`; it never becomes a guessed live or reused PID.
`claimDesktopWorkload` is asynchronous so it can resolve that identity before
publication. Low-level/custom callers may supply a trusted identity or leave it
unverified. A missing prebuilt helper permits an unverified claim; verification
or permission errors are not silently downgraded. Reporting-session inheritance
is separate from explicit workload-claim delegation.

## Application resources and exact attach

The neutral host records a pending application resource before dispatching a
launch. An acquired resource adds its lease ID, native PID/start timestamp,
lifetime, containment, and causal launch kind when the provider supplies them.
Windows/Win32 also retain the canonical executable, native session, and AUMID
when packaged, including on a failed cleanup.
These records appear in the workload claim alongside services and survive a
failed cleanup. Publication failure prevents dispatch or fences an already
dispatched launch. A failed/cancelled unleased launch settles when the provider
proves it never started or its exact process exited. A legacy provider's ordinary
no-data rejection does not imply a created application. Reported process identity,
an unknown settlement, lost transport after dispatch, or completion after
cancellation stays unresolved. Advisory exit events, duplicate lease IDs, a helper
exit, and service replacement never settle an acquired or uncertain application.

The `/application-ownership` leaf provides `captureDesktopApplicationIdentity`
and `desktopApplicationIdentityDescriptor`. On macOS they require the native
six-fractional-digit OS timestamp and select an exact external incarnation
without a Storybook lease or transferred ownership. Do not construct that
identity from `Date`, LaunchServices dates, a title, or a bundle ID. Existing
Storybook attach-lease code is deliberately unchanged pending its integration
migration.

On Windows/Win32 they require all seven native fractional creation-time digits,
canonical executable, session, and the captured AUMID when packaged. The
REX image/PID/start/session tuple denotes one host incarnation. A one-tick
start mismatch, conflicting descriptor, ambiguous process/window match, or
unknown evidence is rejected. Read-only identity inspection does not take
application/input control or change live window identifiers.

macOS launched leases report `launch-services` or `direct-child`; both are
`uncontained`. Exact primary-process cleanup does not prove arbitrary surviving
descendants exited. Independent native helpers exclude the same exact app using
a stable per-user application lock, separately from the workload/input locks.
macOS supervisor crash recovery, interrupted publication without a captured
identity, and arbitrary descendant reconciliation remain explicit delivery gates.

### Bounded Windows application reconciliation

Before creating its replacement claim or listener, the Windows native supervisor
may reconcile a schema 3 claim for the same registered target and physical
instance. The native owner probe must prove the old owner exited or its PID now
has a different exact creation time. A live or unknown owner never authorizes
cleanup. Each owned application must have a successfully acquired lease, ready
resource record, complete Windows identity, session/supervisor lifetime, and
consistent launch kind/containment. Borrowed applications are never terminated.

Read-only parsing, target validation and the native owner probe precede barrier
publication; a live or foreign claim creates no barrier. Recovery then holds an
exclusive sibling `.recovery-v2` directory and rechecks the exact claim file
identity/content under it and around asynchronous work. Its empty, uniquely named
owner directory atomically records the recoverer's verified native PID/start.
No recovery effect is allowed before that pin is the sole, identity-checked
owner. An empty versioned root therefore represents interrupted publication and
can be retired safely.

A subsequent native recovery may remove only the unchanged unique pin of a
recoverer proven exited or PID-reused, including after the claim was already
removed. A live or unknown recoverer, malformed pins, replacement directories,
and legacy unowned `.recovery` barriers remain fenced. Clearing a stale barrier
does not itself authorize application cleanup; the old claim must still pass
all recovery checks.

The native recoverer first queries application creation time with limited
rights. A reused application PID proves the recorded incarnation exited and is
settled without signalling, controlling, or requesting termination rights to its
current occupant. An unreadable start, including access denied, remains fenced.
For a matching start, the query handle prevents PID reuse while full identity
and per-incarnation control are acquired for exact cleanup. Each successful
application settlement is durably recorded before proceeding, so a failed later
cleanup does not replay settled resources. Only then may the old claim be removed.

The recognized in-owner WebDriver listener dies with that exact Node owner.
Unknown services, process-backed service receipts, pending/unleased launches,
mixed resource graphs, and effects other than matching recorded resource
disposal remain fenced **before** any application cleanup is dispatched.
Custom-host factories and delegated claims do not acquire this native recovery
authority implicitly. This does not clear durable native/Storybook mutation
quarantine or provide a model-facing recovery route.

Windows unpackaged launches report `direct-child` / `job-object`. Packaged
activation reports `packaged-activation` / `uncontained`, deliberately avoiding
an unreliable post-activation job assignment. Failed cleanup keeps its acquired
exact primary process in the claim; exact recovery does not prove arbitrary
uncontained descendants exited. The helper never puts an attached application
in an owned job.

### Service composition and durable quarantine

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
recovery route is exposed. General automatic stale-claim removal remains unsupported.
Inspect exact resources before explicit operator recovery; restarting alone
never clears uncertain native or Storybook mutations.

Keep reporting runs distinct from physical workload claims, resource ownership,
application ownership, grants, native sessions, input locks, and context epochs.
Integrations contribute through the public
`@fluentui-react-native/desktop-test/resources` and `/ownership` subpaths rather
than taking over CLI output and supervision. Management/run API schemas belong here.
Attached-app MCP/WDIO handoff can be developed independently of supervisor-owned
native launch, but both must wait for session drain and preserve external apps.

Configured target aliases receive distinct registered IDs while retaining the
same physical `instanceId` when they resolve to the same application identity.
Do not use an alias as proof that two targets are physically distinct.

See [current status](current-status.md) for remaining gates and recorded evidence.

- **R-DTEST-001:** Unmatched patterns, empty groups, all-skipped required
  cohorts, and unfinished selected work are not passes. Do not narrow selection
  or change required coverage to make a run pass without an owner decision.
