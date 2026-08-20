# Primitive component authoring

These instructions apply to `packages/agentic-components/src/primitives` and its descendants. Use `primitives/icon` as
the canonical implementation.

## Non-negotiable invariants

- Primitives are unstyled building blocks. Do not read themes, apply design tokens, or choose product appearance
  defaults.
- Define the smallest acceptance contract needed for `SlotProp` consumption.
- Prefer a hook-free `directComponent` when the primitive only selects an inner component or transforms props.
- Forward accessibility and test props without replacing consumer values.
- Keep alternative source or renderer props mutually exclusive.
- Add compile-time `SlotProp` coverage and runtime coverage for every renderer branch.
- Demonstrate the primitive in Storybook without adding component-level styling.
- `FocusVisual` mounts configured ring Views eagerly, owns accessibility and hit testing, and changes only opacity when
  focus visibility changes. Keep token selection and component-specific ring geometry in the consuming component.

## Focused references

- [Types and slots](../../../../.github/skills/agentic-component-authoring/references/types-and-slots.md)
- [Rendering and assembly](../../../../.github/skills/agentic-component-authoring/references/rendering.md)
- [Tests and stories](../../../../.github/skills/agentic-component-authoring/references/tests-and-stories.md)
