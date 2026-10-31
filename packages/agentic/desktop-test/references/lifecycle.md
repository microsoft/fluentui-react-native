---
id: desktop-test.lifecycle
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Lifecycle and ownership

One supervisor owns the required services, WDIO workers, WebDriver listener,
and app sessions. Services report readiness and failures through the shared
run lifecycle. Required-service failure aborts dependent work.

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

- **R-DTEST-001:** Unmatched patterns, empty groups, all-skipped required
  cohorts, and unfinished selected work are not passes. Do not narrow selection
  or change required coverage to make a run pass without an owner decision.
