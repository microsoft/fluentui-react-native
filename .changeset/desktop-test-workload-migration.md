---
"@fluentui-react-native/desktop-test": minor
---

Move hosted driver readiness, retained application ownership, and attached or managed workloads into the desktop supervisor.

**Migrating from 0.3.x:**

- `claimDesktopWorkload` is no longer a root export. Use the supervisor-managed lifecycle instead of taking a separate workload claim.
- Replace `DesktopIntegration.run`, `resources`, and `supportsAgent` with `contribute(request)`. Return a plan with the applicable `resources`, `driver`, `workload`, `managedWorkload`, and `attachedWorkload` entries. Old integration fields are rejected, and an integration used for `serve` must contribute a hosted driver.
- When constructing a supervisor directly, supply contributions through `DesktopSupervisorOptions.integrationPlan.resources`, not `integration.resources`.
- Await `registerDesktopProcessDisposal` before acquiring the resource. It now returns `Promise<() => void>`.
- `DesktopSupervisor.runner` is typed as `DesktopCommandRunner`. Check for `close` and `terminate` before calling them on a custom runner.
