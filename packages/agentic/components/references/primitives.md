---
id: components.primitives
kind: instruction-reference
owner_paths:
  - packages/agentic/components/src/primitives
---

# Primitive component authoring

Use this reference for every public primitive under `src/primitives`. Use `src/primitives/icon` as the canonical
implementation.

## Catalog

Import these unstyled building blocks from `@fluentui-react-native/components/primitives`. They are not exported from the
package root.

| Primitive            | Contract                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| `CheckboxIndicator`  | [Checkbox indicator](../src/primitives/checkbox-indicator/CONTRACT.md)     |
| `CompoundItemLayout` | [Compound item layout](../src/primitives/compound-item-layout/CONTRACT.md) |
| `FocusVisual`        | [Focus visual](../src/primitives/focus-visual/CONTRACT.md)                 |
| `Icon`               | [Icon](../src/primitives/icon/CONTRACT.md)                                 |
| `LayoutStableText`   | [Layout-stable text](../src/primitives/layout-stable-text/CONTRACT.md)     |

Each primitive is extracted for a reusable behavioral or structural contract. Package-specific private helpers belong in
`src/common` instead.

## Non-negotiable invariants

- Primitives are public only from `@fluentui-react-native/components/primitives`; do not re-export them from the package root.
- Give primitive components stable public names. Suffix public composition helpers whose contracts may evolve with
  `_unstable`, matching higher-order component pipeline helpers.
- **R-PRIMITIVE-001:** Maintain a colocated `CONTRACT.md` for every public primitive and keep primitives unstyled. Derive
  test obligations from that contract, its public types, and each renderer branch rather than creating an
  upstream-backed `SPEC.md`.
- Primitives are unstyled building blocks. Do not read themes, apply design tokens, or choose product appearance
  defaults.
- Define the smallest acceptance contract needed for `SlotProp` consumption.
- Prefer a hook-free `directComponent` when the primitive only selects an inner component or transforms props.
- **R-PRIMITIVE-002:** For a primitive with one stable native root type, include `PropsWithRefOf<typeof Root>` in its
  public props and pass the React 19.1.4 `ref` prop to that root without `forwardRef`. A primitive whose renderer does
  not have one stable imperative instance type must omit `ref` and document that exception in its `CONTRACT.md`.
- Forward accessibility and test props without replacing consumer values.
- Keep alternative source or renderer props mutually exclusive.
- Add compile-time `SlotProp` coverage and runtime coverage for every renderer branch.
- Demonstrate the primitive in Storybook without adding component-level styling.
- `FocusVisual` mounts configured ring Views eagerly, owns accessibility and hit testing, and changes only opacity when
  focus visibility changes. Keep token selection and component-specific ring geometry in the consuming component.
- Extract a new primitive only when multiple components share a stable behavioral or structural contract and the public
  abstraction is smaller than the duplication. Keep one-off helpers and component-specific behavior local.

## Focused references

- [Types and slots](types-and-slots.md)
- [Rendering and assembly](rendering.md)
- [Tests and stories](tests-and-stories.md)
