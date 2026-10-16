# Agentic Components authoring

These instructions apply to `packages/agentic/components` and its descendants. Keep this file limited to durable package
invariants; detailed recipes live in the shared [agentic references](../../../references/agents/README.md), routed by
the [agentic component authoring skill](../../../.github/skills/agentic-component-authoring/SKILL.md).

## Routing

- Implementation and new components use the
  [agentic component authoring skill](../../../.github/skills/agentic-component-authoring/SKILL.md); reviews use
  [review-component](../../../.github/skills/review-component/SKILL.md).
- Higher-order components live in `src/components`; read [its instructions](src/components/AGENTS.md).
- Primitive components live in `src/primitives`; read [its instructions](src/primitives/AGENTS.md).
- Story files are library source and follow [tests and stories](../../../references/agents/components/agentic/tests-and-stories.md).
  Executable tests are top-level `wdio` callbacks or maps of named callbacks typed with `import type` of `WdioStory`
  from `storybook-desktop/testing`. Keep callbacks self-contained and dynamically import Node helpers inside them.
  Each named case gets a fresh story, session, and worker. Use stable `testID` selectors and the injected `platform`
  for real platform differences, with explicit skips for unsupported capabilities. Shared focus tests run on macOS,
  Windows, and Win32; gate only genuinely platform-specific assertions. Legacy `parameters.desktopDriver` plans remain
  only in runner compatibility fixtures.
- Focus work starts with the [common focus instructions](../../../references/agents/focus/common.md),
  then the [Windows/Win32](../../../references/agents/focus/windows-win32.md) or
  [macOS](../../../references/agents/focus/macos.md) detail. V1 Win32 is the
  behavioral baseline for both Windows endpoints; renderer-specific plumbing remains separate.
- Storybook application, native project, Metro, bundle, or CocoaPods work follows the
  [Storybook instructions](../../../apps/storybook/AGENTS.md) and the `agentic-storybook-development` skill.
- Native views, codegen, or registration follow the
  [native component skill](../../../.github/skills/implement-native-component/SKILL.md); React Native Windows Fabric
  views also follow the [Windows Fabric reference](../../../references/agents/native/windows-fabric.md).

## Package invariants

- **R-AGENTIC-001:** Before implementing a higher-order component whose contract is absent, stale, still a draft, or
  accompanied by new source evidence, create or revise its source-backed contract through the
  [agentic component contract authoring skill](../../../.github/skills/agentic-component-contract-authoring/SKILL.md)
  and complete its review gate. Never mechanically promote a web-authored specification. The skill routes Flex/X3,
  Fluent v9, HTML/CSS, visual, local-foundation, and composite evidence.
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
- **R-AGENTIC-002:** This package targets React 19.1.4 or newer. Expose a stable native root ref through the `ref` prop,
  receive it as part of the component props, and forward it to the declared root slot. Do not use `forwardRef`.
- Export higher-order components and public types explicitly from `src/index.ts`; export primitives and their public types
  explicitly from `src/primitives/index.ts`. Never use wildcard exports (R-REPO-001).
- Colocate runtime tests, type tests, and Storybook stories with the implementation.
- Include every test-bearing story in `tsconfig.stories.json`. The representative
  runner contract rejects legacy catalog plans and missing story type coverage.
- Node-only shared test helpers use `*.wdio.ts`, are excluded from production
  emit, and are imported dynamically inside the stripped callbacks.
- Use package scripts for format, lint, build, tests, and snapshots.
- Do not copy web-only APIs, CSS behavior, or DOM assumptions into React Native.
- Do not copy or mechanically transform private source bodies into this public
  package (R-REPO-004). Record source identifiers and digests, then author the local React
  Native contract.
