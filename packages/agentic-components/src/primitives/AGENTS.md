# Primitive component authoring

These instructions apply to `packages/agentic-components/src/primitives` and its descendants.

- Primitives are unstyled building blocks for higher-order components. Do not read themes, apply design tokens, or choose
  product-level appearance defaults in a primitive.
- Design primitive props as a small acceptance contract for slots. Higher-order components must be able to provide sizing,
  color, accessibility, and source props through `SlotProp`.
- Prefer a hook-free `directComponent` when the primitive only selects an inner component or transforms props. This keeps
  the primitive as a pure wrapper with no extra React boundary when consumed as a slot.
- Forward accessibility and test props to the inner element. Do not silently replace values supplied by a consuming
  component.
- Keep source variants mutually exclusive when a primitive can wrap several inner component types.
- Add compile-time `SlotProp` coverage, runtime coverage for each inner component type, and Storybook stories that
  demonstrate the primitive without adding component-level styling.
