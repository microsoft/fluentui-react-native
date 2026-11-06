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
transitional, not a fully migrated resource graph. The intended boundary is one
neutral `desktop-test` workload host with optional Storybook contributions, not
a driver or MCP orchestrator.

Services report readiness and failures through the shared run lifecycle.
Required-service failure aborts dependent work. Listener/descriptor-ready does
not prove app-ready, runtime-connected, or story-context-ready.

Cleanup drains worker reporting and stdio, closes sessions, releases owned
input, and stops exact owned process trees in reverse service order. An
externally owned app is preserved.

Commands keep their arguments as separate values. Windows executable lookup and
command-shim escaping use `cross-spawn`, without Node's deprecated
`spawn` argument array plus `shell: true` combination.

Interactive runs acquire a per-user `interactive.lock`; concurrent workloads
fail closed. If a crash leaves a lock, inspect its recorded owner and verify
that process and its resources have stopped before removing that exact lock.
There is no automatic stale-lock recovery.

The supervisor registers each owned resource before acquisition starts. If
cancellation wins while acquisition is in flight, shutdown waits for that work;
a resource that arrives late is disposed before a successful shutdown settles.
Guarded work is also drained before close completes. A failed or timed-out
disposal remains unsettled and retains the claim.

The versioned workload record stores a random owner ID, process ID and recorded
start timestamp, run ID, registered target ID, physical target instance ID, and each
resource's identity, generation, ownership, readiness, and disposal state.
Unresolved effects fence the claim. Claim inspection distinguishes a live owner,
an exited owner, an unknown probe, and a reused PID; inspection never reclaims a
claim, and uncertain or unsettled resources prevent release. Reporting-session
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

Configured target aliases receive distinct registered IDs while retaining the
same physical `instanceId` when they resolve to the same application identity.
Do not use an alias as proof that two targets are physically distinct.

See [current status](current-status.md) for remaining gates and recorded evidence.

- **R-DTEST-001:** Unmatched patterns, empty groups, all-skipped required
  cohorts, and unfinished selected work are not passes. Do not narrow selection
  or change required coverage to make a run pass without an owner decision.
