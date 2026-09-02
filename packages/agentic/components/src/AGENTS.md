# Agentic Components source guidance

These instructions apply to `packages/agentic/components/src` and its descendants. Use them with the package root
[`AGENTS.md`](../AGENTS.md), the relevant component or primitive instructions, and the package-wide optimization skill when
the change crosses component boundaries.

## Routing

- Higher-order components live in `src/components`; read `src/components/AGENTS.md`.
- Primitive components live in `src/primitives`; read `src/primitives/AGENTS.md`.
- Shared package-private helpers live in `src/common`.
- Package-wide dependency and extraction reviews use
  [agentic-component-optimization](../../../../.github/skills/agentic-component-optimization/SKILL.md).

## Source boundaries

- Production source may depend only on React / React Native native components, `@fluentui-react-native/design`,
  `@fluentui-react-native/framework-base`, and `@fluentui-react-native/callout`. Callout is allowed because a floating
  surface has to be a native popup window on Windows and macOS, and no equivalent exists in React Native or in the
  framework packages. Adding another native component package requires the same kind of justification and an update
  here.
- Generalizable non-styling hooks belong in `framework-base/src/hooks`.
- Styling helpers belong in `agentic/design/src/styling`.
- Component-library-specific non-public types, constants, and helpers belong in `src/common`.
- Primitives are public from `@fluentui-react-native/components/primitives`, must remain unstyled, and require a colocated
  `CONTRACT.md`. Extract one only for a repeated behavioral or structural contract that is useful to consumers; keep
  package-private helpers in `src/common`.

## Optimization principles

- Audit dependency direction before introducing shared code.
- Look for repeated types, constants, routines, and subtrees across components.
- Validate extraction payoff before creating another layer of indirection.
- Preserve public component-qualified APIs and explicit exports. Higher-order components belong to the root entry point;
  primitives belong to the `./primitives` entry point.
- Keep local component fixes local; do not widen a tiny edit into a whole-package audit unless repetition or extraction
  is part of the work.
- Do not extract one-off logic, styling choices, or thin wrappers that are clearer in place.
