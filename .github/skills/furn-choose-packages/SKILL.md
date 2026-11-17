---
name: furn-choose-packages
description: Choose Fluent UI React Native packages for components, themes, component authoring, native integration, desktop testing, or agent automation. Use before installing dependencies or when deciding public entry points and platform constraints. Does not install packages or establish native support.
license: MIT
---

# Choose FURN packages

Read [consumer context](../../../references/agents/portable/context.md) first,
then the [package catalog](../../../scripts/agent-content/exports.json).
No runtime package installation is required to make an initial recommendation.

1. Identify the task, host/application, React Native renderer, platforms,
   existing dependencies, and whether the user is consuming or contributing.
2. Select the smallest public package/subpath for that task. Distinguish styled
   components, primitives, design/theming, authoring foundations, native
   capabilities, the neutral test harness, and optional Storybook/MCP adapters.
3. Check installed versions and public entry points against the catalog and
   installed documentation. The catalog is a reviewed source snapshot, not
   proof that a named export exists in a different release.
4. Treat platform entries as integration targets, not a native qualification
   claim. Confirm peer requirements, host capabilities, supported renderer,
   and any explicit unsupported endpoint in package documentation.
5. Recommend package names, public subpaths, why each is needed, and unresolved
   compatibility/qualification questions. Do not add all catalog packages.
6. Do not install dependencies, change framework generations, or migrate APIs
   without authorization. Use the appropriate focused workflow after the
   package and task boundary are established.

Use [component authoring](../furn-component-authoring/SKILL.md),
[contract authoring](../furn-component-contract-authoring/SKILL.md), or
[desktop testing](../furn-desktop-testing/SKILL.md) when that work is requested.
