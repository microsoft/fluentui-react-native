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
- Storybook application, native project, Metro, bundle, or CocoaPods work follows `storybook/AGENTS.md` and the
  `agentic-storybook-development` skill.
- Native React Native Windows Fabric component work follows the
  [Windows Fabric native component reference](../../../.github/skills/agentic-component-authoring/references/windows-fabric-native-components.md).

## Package invariants

- Read the component `SPEC.md` and all referenced companions before changing its contract.
- Use `src/components/button` as the canonical higher-order implementation and `src/primitives/icon` as the canonical
  primitive.
- Keep public props and slots small, typed, and spec-driven.
- Export components and public types explicitly from `src/index.ts`; never use wildcard exports.
- Colocate runtime tests, type tests, and Storybook stories with the implementation.
- Keep desktop story plans inline and statically extractable; do not hide them
  behind variables, spreads, functions, or computed values.
- Use package scripts for format, lint, build, tests, and snapshots.
- Do not copy web-only APIs, CSS behavior, or DOM assumptions into React Native.
