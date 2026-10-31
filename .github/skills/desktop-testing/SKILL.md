---
name: desktop-testing
description: Configure, run, or troubleshoot native desktop tests using desktop-test, desktop-driver, and storybook-desktop, including app targets and suites, helpers, permissions, WDIO suites, Storybook story tests and smoke runs, reports, and CI. Not for package source changes or the Storybook app build toolchain.
license: MIT
---

# Desktop testing

Package references own commands, schemas, and troubleshooting. Read only the
matching topic; do not copy its content here.

| Task                                     | Read                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add an app target or suite               | [`desktop-test` configuration](../../../packages/agentic/desktop-test/references/configuration.md)                                                                                                                                                                           |
| Run stages, suites, or inspect results   | [`desktop-test` commands](../../../packages/agentic/desktop-test/references/commands.md) and [reporting](../../../packages/agentic/desktop-test/references/reporting.md)                                                                                                     |
| Prepare a platform or provision a helper | [`desktop-test` platforms](../../../packages/agentic/desktop-test/references/platforms.md) and [`desktop-driver` helpers](../../../packages/agentic/desktop-driver/references/native-helpers.md)                                                                             |
| Integrate Storybook or run callbacks     | [`storybook-desktop` integration](../../../packages/agentic/storybook-desktop/references/integration.md), [commands](../../../packages/agentic/storybook-desktop/references/commands.md), and [tests](../../../packages/agentic/storybook-desktop/references/story-tests.md) |
| Fix E2E adapters or diagnose failures    | [`desktop-test` WDIO suites](../../../packages/agentic/desktop-test/references/wdio-suites.md) and [lifecycle](../../../packages/agentic/desktop-test/references/lifecycle.md)                                                                                               |

## Workflow

1. Identify the consumer workspace; read its config and declared scripts. For
   `apps/storybook`, also read `AGENTS.md` and `agent-map.yaml`.
2. Reproduce with the narrowest declared stage, suite, story, or filter.
   Provision the verified helper explicitly; never guess flags or call runner
   internals.
3. Do not change privacy settings without authorization or overlap interactive
   desktop workloads.
4. Report failures, skips, unsupported capabilities, and incomplete work
   distinctly. Skips are not passes.
5. If a published package changed, add its changeset. Finish code/config
   changes with `yarn clean-lage-cache` then `yarn lage buildci`.

For package source changes or reviews, use `maintain-desktop-testing`. For the
`apps/storybook` build/toolchain, use `agentic-storybook-development`.
Component story assertions stay with `agentic-component-authoring`; v0/v1
FluentTester assertions stay with `maintain-v0-v1-component`.
