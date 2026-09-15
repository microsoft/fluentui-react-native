# Agentic Components authoring

These instructions apply to `packages/agentic/components` and its descendants. Keep this file limited to durable package
invariants; detailed authoring recipes live in the
[agentic component authoring skill](../../../.github/skills/agentic-component-authoring/SKILL.md).

## Routing

- Higher-order components live in `src/components`; read `src/components/AGENTS.md`.
- Primitive components live in `src/primitives`; read `src/primitives/AGENTS.md`.
- Story files are library source and follow the tests and stories reference.
- Focus work starts with the [common focus instructions](../../../.github/skills/agentic-component-authoring/references/focus.md),
  then the [Windows/Win32](../../../.github/skills/agentic-component-authoring/references/focus-windows.md) or
  [macOS](../../../.github/skills/agentic-component-authoring/references/focus-macos.md) detail. V1 Win32 is the
  behavioral baseline for both Windows endpoints; renderer-specific plumbing remains separate.
- Author executable tests under top-level `wdio`, as one callback or a map
  of named callbacks. All catalog tests use this pattern; legacy
  `parameters.desktopDriver` plans remain only in runner compatibility fixtures.
  Use stable `testID` selectors and the injected target `platform` for real
  platform differences, with explicit skips for unsupported capabilities.
- Executable tests are typed
  with `WdioStory` from `storybook-desktop/testing` using `import type`.
  Keep callbacks self-contained; dynamically import Node helpers inside
  them so the shared Babel transform can exclude them from native bundles.
  Each named case gets a fresh story, session, and worker; do not share native
  element handles or depend on previous cases.
- Storybook application, native project, Metro, bundle, or CocoaPods work follows the
  [Storybook instructions](../../../apps/storybook/AGENTS.md) and the `agentic-storybook-development` skill.
- Native React Native Windows Fabric component work follows the
  [Windows Fabric native component reference](../../../.github/skills/agentic-component-authoring/references/windows-fabric-native-components.md).

## Package invariants

- Create or revise source-backed contracts through the
  [agentic component contract authoring skill](../../../.github/skills/agentic-component-contract-authoring/SKILL.md).
  It routes Flex/X3, Fluent v9, HTML/CSS, visual, local-foundation, and
  composite evidence before implementation.
- Use the repository's `flex-authoring` profile and `flex-components:<name>`
  only for a pinned Flex/X3 source. It is not a prerequisite for other source
  adapters.
- A theme-aware foundational component that has no Flex catalog entry must use
  a sole validator-backed `local-foundation` entry in `sources[]`. Cite its
  public platform contract and repository evidence; never invent a
  `flex-components:<name>` skill or bypass the component contract gate.
- Follow [SPEC-SOURCE.md](./SPEC-SOURCE.md) for provenance fields, contract
  lifecycle, review state, and drift commands.
- Read the component `SPEC.md`, `spec/source.json`, and all referenced React
  Native companions before changing its contract.
- Use `src/components/button` as the canonical higher-order implementation and `src/primitives/icon` as the canonical
  primitive.
- Keep public props and slots small, typed, and spec-driven.
- This package targets React 19.1.4 or newer. Expose a stable native root ref through the `ref` prop, receive it as part
  of the component props, and forward it to the declared root slot. Do not use `forwardRef`.
- Export higher-order components and public types explicitly from `src/index.ts`; export primitives and their public types
  explicitly from `src/primitives/index.ts`. Never use wildcard exports.
- Colocate runtime tests, type tests, and Storybook stories with the implementation.
- Include every test-bearing story in `tsconfig.stories.json`. The representative
  runner contract rejects legacy catalog plans and missing story type coverage.
- Node-only shared test helpers use `*.wdio.ts`, are excluded from production
  emit, and are imported dynamically inside the stripped callbacks.
- Use package scripts for format, lint, build, tests, and snapshots.
- Do not copy web-only APIs, CSS behavior, or DOM assumptions into React Native.
- Do not copy or mechanically transform private source bodies into this public
  package. Record source identifiers and digests, then author the local React
  Native contract.
