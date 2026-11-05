---
id: desktop-test.lifecycle
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Lifecycle and ownership

The generic supervisor owns required services, WDIO workers, and the WebDriver
listener. A launched application's lifetime is currently session-owned; attached
applications have an external owner. Storybook still takes over the CLI lifecycle,
with channel and embedded driver listeners in a child process. This exception is
transitional, not a unified resource graph. The intended boundary is one neutral
`desktop-test` workload host with optional Storybook contributions, not a driver
or MCP orchestrator.

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

Cleanup failure now retains the claim, including a failure to dispose a host
after startup failed. A timeout is not proof of settlement and must not release
ownership. This conservative fence is not a resource ledger: late work abandoned
by service guards, process-tree survivors, exact resource accounting, durable
quarantine wiring, and crash reconciliation remain work in progress.

The driver library can persist settlement uncertainty, but neither shipped
service path currently supplies recovery storage/probes. Restart is therefore
not a safe recovery procedure for uncertain native or Storybook mutations.
Inspect exact resources and follow trusted recovery evidence requirements.

Keep reporting runs distinct from physical workload claims, resource ownership,
application ownership, grants, native sessions, input locks, and context epochs.
Future integrations should contribute typed resources/workloads rather than
take over CLI output and supervision. Management/run API schemas belong here.
Attached-app MCP/WDIO handoff can be developed independently of supervisor-owned
native launch, but both must wait for session drain and preserve external apps.

See [current status](current-status.md) for remaining gates and recorded evidence.

- **R-DTEST-001:** Unmatched patterns, empty groups, all-skipped required
  cohorts, and unfinished selected work are not passes. Do not narrow selection
  or change required coverage to make a run pass without an owner decision.
