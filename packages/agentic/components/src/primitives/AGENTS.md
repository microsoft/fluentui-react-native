# Primitive component authoring

These instructions apply to `packages/agentic/components/src/primitives` and its descendants. Use `primitives/icon` as
the canonical implementation.

## Non-negotiable invariants

- Primitives are public only from `@fluentui-react-native/components/primitives`; do not re-export them from the package root.
- Give primitive components stable public names. Suffix public composition helpers whose contracts may evolve with
  `_unstable`, matching higher-order component pipeline helpers.
- Maintain a colocated `CONTRACT.md` for every public primitive. Derive its test obligations from that contract, its public
  types, and each renderer branch rather than creating an upstream-backed `SPEC.md`.
- Primitives are unstyled building blocks. Do not read themes, apply design tokens, or choose product appearance
  defaults.
- Define the smallest acceptance contract needed for `SlotProp` consumption.
- Prefer a hook-free `directComponent` when the primitive only selects an inner component or transforms props.
- For a primitive with one stable native root type, include `PropsWithRefOf<typeof Root>` in its public props and pass
  the React 19.1.4 `ref` prop to that root without `forwardRef`. A primitive whose renderer does not have one stable
  imperative instance type must omit `ref` and document that exception in its `CONTRACT.md`.
- Forward accessibility and test props without replacing consumer values.
- Keep alternative source or renderer props mutually exclusive.
- Add compile-time `SlotProp` coverage and runtime coverage for every renderer branch.
- Demonstrate the primitive in Storybook without adding component-level styling.
- `FocusVisual` mounts configured ring Views eagerly, owns accessibility and hit testing, and changes only opacity when
  focus visibility changes. Keep token selection and component-specific ring geometry in the consuming component.
- Extract a new primitive only when multiple components share a stable behavioral or structural contract and the public
  abstraction is smaller than the duplication. Keep one-off helpers and component-specific behavior local.

## Focused references

- [Types and slots](../../../../../.github/skills/agentic-component-authoring/references/types-and-slots.md)
- [Rendering and assembly](../../../../../.github/skills/agentic-component-authoring/references/rendering.md)
- [Tests and stories](../../../../../.github/skills/agentic-component-authoring/references/tests-and-stories.md)
