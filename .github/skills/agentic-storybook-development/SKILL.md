---
name: agentic-storybook-development
description: Develop, run, bundle, or troubleshoot the agentic-components Storybook app on macOS or Windows, including CocoaPods, Xcode, Metro, Fabric, and offline builds.
license: MIT
---

# Agentic Storybook development

Work on the native Storybook application in `apps/storybook`.

## Workflow

1. Read the repository `AGENTS.md`, then the
   [Storybook instructions](../../../apps/storybook/AGENTS.md) and
   [README](../../../apps/storybook/README.md).
2. Inspect the Storybook `package.json` and run its declared workspace scripts; do not invent direct runner commands.
3. Reproduce the first failure from the Storybook workspace so pnpm-linked React Native tooling resolves from the app.
4. Treat native workspaces, Pods, lockfiles, generated solutions, build directories, and DerivedData as disposable
   outputs. Fix the owning manifest, Podfile, configuration, or script instead.
5. After dependency or workaround changes, regenerate the affected native dependency source and use a clean build so
   stale output cannot produce a false success.
6. Validate the JavaScript bundle and the affected native build. Run Storybook format/lint and the root build when
   manifests or shared package references changed.

Keep component API, slot, token, and rendering work in the `agentic-component-authoring` skill; use this skill for the
Storybook application and its native toolchains.
