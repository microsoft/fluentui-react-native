# Agentic Components authoring

These instructions apply to `packages/agentic/components` and its descendants. Keep this file limited to durable package
invariants; detailed authoring recipes live in the
[agentic component authoring skill](../../../.github/skills/agentic-component-authoring/SKILL.md).

## Routing

- Higher-order components live in `src/components`; read `src/components/AGENTS.md`.
- Primitive components live in `src/primitives`; read `src/primitives/AGENTS.md`.
- Story files are library source and follow the tests and stories reference.
- Portable desktop story tests are static `parameters.desktopDriver` plans.
  Use the public authoring types, stable `testID` selectors, declarative
  capability requirements, and no platform branches or executable callbacks.
- Storybook application, native project, Metro, bundle, or CocoaPods work follows the
  [Storybook instructions](../../../apps/storybook/AGENTS.md) and the `agentic-storybook-development` skill.
- Native React Native Windows Fabric component work follows the
  [Windows Fabric native component reference](../../../.github/skills/agentic-component-authoring/references/windows-fabric-native-components.md).

## Package invariants

- For a higher-order component contract, start Agency with the
  `flex-authoring` profile, invoke `flex-components:<name>`, and follow the
  [Flex source adaptation reference](../../../.github/skills/agentic-component-authoring/references/spec-source-adaptation.md).
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
- Keep desktop story plans inline and statically extractable; do not hide them
  behind variables, spreads, functions, or computed values.
- Use package scripts for format, lint, build, tests, and snapshots.
- Do not copy web-only APIs, CSS behavior, or DOM assumptions into React Native.
- Do not copy or mechanically transform private Flex skill bodies into this
  public package. Record source identifiers and digests, then author the local
  React Native contract.
