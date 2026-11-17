---
name: furn-desktop-testing
description: Configure, run, or troubleshoot FURN desktop tests and agent-controlled workloads using desktop-test, desktop-driver, desktop-mcp, and optional storybook-desktop. Covers app targets, suites, verified discovery, runner handoff, helpers, permissions, WDIO, story callbacks, reports, and CI. Not for package implementation or application build-toolchain development.
license: MIT
---

# FURN desktop testing

Read [consumer context](../../references/shared/portable/context.md) first.
Resolve references from the target application's installed dependencies, not
from an assumed FURN checkout. Storybook is optional; do not require it for a
neutral desktop-test or desktop-driver task.

`desktop-test` owns supervision and lifecycle. `desktop-mcp` connects to an
already running, verified supervisor; it never starts or owns the host.
Its explicit `--driver-only` mode and the deprecated `desktop-driver-mcp`
shim lack workload-management authority. Failed supervisor verification must
not silently downgrade to either driver-only path.

| Task                                      | Read                                                                                                                                                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add an app target or suite                | `@fluentui-react-native/desktop-test/references/configuration.md`                                                                                                                                                 |
| Run stages or inspect results             | `@fluentui-react-native/desktop-test/references/commands.md` and `@fluentui-react-native/desktop-test/references/reporting.md`                                                                                    |
| Prepare a platform/helper                 | `@fluentui-react-native/desktop-test/references/platforms.md` and `@fluentui-react-native/desktop-driver/references/native-helpers.md`                                                                            |
| Storybook integration/callbacks           | `@fluentui-react-native/storybook-desktop/references/integration.md`, `@fluentui-react-native/storybook-desktop/references/commands.md`, and `@fluentui-react-native/storybook-desktop/references/story-tests.md` |
| E2E adapters or lifecycle failures        | `@fluentui-react-native/desktop-test/references/wdio-suites.md` and `@fluentui-react-native/desktop-test/references/lifecycle.md`                                                                                 |
| Connect an agent or run catalog workloads | `@fluentui-react-native/desktop-mcp/references/connection.md`, `@fluentui-react-native/desktop-mcp/references/tools.md`, and `@fluentui-react-native/desktop-test/references/management.md`                       |

1. Identify the consumer workspace; read its instructions, configuration, and
   declared scripts. Do not change installed package source to configure a test.
2. Reproduce with the narrowest declared stage, suite, story, or filter.
   Provision the verified helper explicitly; never guess flags or invoke
   private runner internals.
3. Obtain authorization before changing privacy settings. Do not overlap
   interactive workloads or stop resources not owned by this run.
4. Use the documented reporter modes for bounded machine-readable output;
   use NDJSON progress only when a live event stream is useful.
5. Report failures, skips, unsupported capabilities, empty work, and incomplete
   work distinctly. Skips are not passes. Native accessibility claims require
   [native accessibility evidence](../../references/shared/portable/accessibility.md),
   not a JavaScript event or a successful bundle.
6. Follow the consumer repository's validation and release rules. In FURN,
   root and app/package instructions own contributor checks and routing to
   maintenance or Storybook build workflows.

## Agent and runner handoff

- Use verified private descriptors, not model-supplied service URLs or grants.
  Provision or launch a supervisor only through authorized consumer scripts.
  Connection readiness does not by itself prove application or story readiness.
- For managed runs, select an exposed workload ID and allowed input lane from
  the trusted catalog; use an exact story ID only when that catalog permits it.
  Never supply arbitrary commands, configuration paths, environments, or
  preemption policy through a workload tool.
- Before handing an open agent target to an attach-only runner, relinquish
  the agent session and confirm drain. A workload catalog is not preemption
  authority. After the runner settles, open a fresh session and observe again;
  old references and cursors do not survive the handoff.
- Reconcile an ambiguous workload admission by status with its original
  request ID; do not resubmit it or replay a mutation. Do not retry
  `bridge-unavailable` blindly. The supervisor owns retained-host readiness,
  and protected story args remain unsupported.
- Keep cancellation requests, test outcomes, and cleanup settlement distinct.
  A successful assertion or retained app never proves cleanup settled.

Component assertions belong to
[component authoring](../furn-component-authoring/SKILL.md), not to a new
application lifecycle implementation.
