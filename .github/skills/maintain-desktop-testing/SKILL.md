---
name: maintain-desktop-testing
description: Change, review, or plan source changes to desktop-driver, desktop-test, storybook-desktop, or storybook-desktop-runtime, including native helpers. Applies package invariants, documentation, native and consumer validation, and changesets.
license: MIT
---

# Maintain desktop testing packages

| Owner                                         | Entry                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| WebDriver service, clients, helpers           | [`desktop-driver`](../../../packages/agentic/desktop-driver/AGENTS.md)       |
| App/suite config, lifecycle, WDIO, reporting  | [`desktop-test`](../../../packages/agentic/desktop-test/AGENTS.md)           |
| Storybook integration, CLI, extraction, tests | [`storybook-desktop`](../../../packages/agentic/storybook-desktop/AGENTS.md) |
| On-device bridge, Metro, theme, chrome        | [`runtime`](../../../packages/agentic/storybook-desktop-runtime/AGENTS.md)   |

Read the matching contributing reference from the package index.

## Mode first

- **Review/plan:** read-only. Do not implement, run write-mode formatting,
  build, create changesets, launch apps, or run native contracts. Report
  validation not run.
- **Implementation:** continue below.

## Implementation

1. Change the lowest package that owns the behavior; update dependent
   references when needed. Preserve exact identity, fail-closed behavior,
   cancellation, ownership-safe cleanup, and explicit unsupported/skip status.
2. For standalone Swift/C++ helpers, read the provider README and
   `native/PROTOCOL.md`; keep protocol schema and docs in sync. Apply
   `implement-native-component` as a native overlay. React-module and Office
   bridging-header steps do not apply to these standalone helpers.
3. Update owning references and affected README/AGENTS files in the same
   change. Keep `PLAN.md` to unfinished or deferred work.
4. Iterate with `yarn test <name>` for the files you change (R-VALID-004), then run package format, lint, build, and
   test. Native changes also need the matching-OS helper contract and affected
   consumer lane; JS tests do not qualify native behavior.
5. Add a patch changeset for each changed published package. Finish with
   `yarn clean-lage-cache` then `yarn lage buildci`.

When delegating, pass the package AGENTS.md and selected reference paths;
subagents do not inherit them automatically.
