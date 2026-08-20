# Agentic Components source guidance

These instructions apply to `packages/agentic-components/src` and its descendants. Use them with the package root
[`AGENTS.md`](../AGENTS.md), the relevant component or primitive instructions, and the package-wide optimization skill when
the change crosses component boundaries.

## Routing

- Higher-order components live in `src/components`; read `src/components/AGENTS.md`.
- Primitive components live in `src/primitives`; read `src/primitives/AGENTS.md`.
- Shared package-private helpers live in `src/common`.
- Package-wide dependency and extraction reviews use
  [agentic-component-optimization](../../../.github/skills/agentic-component-optimization/SKILL.md).

## Source boundaries

- Production source may depend only on React / React Native native components, `@fluentui-react-native/design`, and
  `@fluentui-react-native/framework-base`.
- Generalizable non-styling hooks belong in `framework-base/src/hooks`.
- Styling helpers belong in `agentic-design/src/styling`.
- Component-library-specific non-public types, constants, and helpers belong in `src/common`.
- Primitives must remain unstyled and should only be extracted for repeated behavioral or structural contracts.

## Optimization principles

- Audit dependency direction before introducing shared code.
- Look for repeated types, constants, routines, and subtrees across components.
- Validate extraction payoff before creating another layer of indirection.
- Preserve public component-qualified APIs and explicit exports.
- Keep local component fixes local; do not widen a tiny edit into a whole-package audit unless repetition or extraction
  is part of the work.
- Do not extract one-off logic, styling choices, or thin wrappers that are clearer in place.
