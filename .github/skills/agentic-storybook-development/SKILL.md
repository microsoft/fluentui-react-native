---
name: agentic-storybook-development
description: Develop, bundle, build, or troubleshoot the agentic-components Storybook app in apps/storybook on macOS, Windows, or Win32, including app catalog configuration, Metro, CocoaPods, native projects, and renderer builds. Not for configuring or running desktop tests or changing desktop package source.
license: MIT
---

# Agentic Storybook app development

This workflow covers the `apps/storybook` consumer and its native toolchain.
For the shared Storybook integration API and CLI use
[`storybook-desktop` references](../../../packages/agentic/storybook-desktop/references/README.md);
for app identity, discovery, and diagnostics use the app's
[`agent-map.yaml`](../../../apps/storybook/agent-map.yaml) and
[`AGENTS.md`](../../../apps/storybook/AGENTS.md).

1. Inspect `desktop.config.mts` and the app's declared scripts; do not invent
   aliases or direct native runner commands.
2. Use the package's platform recipes for prep, bundle, build, smoke, and
   diagnostics. Treat Pods, workspaces, generated solutions, build directories,
   and DerivedData as disposable. Fix the owning hand-authored source.
3. Reinstall/regenerate affected native dependency sources and use a clean
   build after dependency or workaround changes.
4. Validate the JavaScript bundle and affected native build. Run the app's
   format/lint and root validation when shared manifests or references change.
5. Finish code/configuration changes with `yarn clean-lage-cache` then
   `yarn lage buildci` (R-VALID-003).

For test configuration, helper provisioning, test runs, smoke reports, or CI
lanes, use `desktop-testing`. For package source changes, use
`maintain-desktop-testing`. Component API and assertion work stays with
`agentic-component-authoring`.
