# Higher-order component authoring

These instructions apply to `packages/agentic-components/src/components` and its descendants.

Higher-order components own design-token styling, interaction state, layout, and component-level accessibility. Use
`components/button` as the canonical implementation.

For package-wide dependency or extraction reviews, also read
[`packages/agentic-components/src/AGENTS.md`](../AGENTS.md) and the
[agentic-component-optimization](../../../../.github/skills/agentic-component-optimization/SKILL.md) skill. A focused
component edit should stay within this file and the relevant `SPEC.md`; do not turn every small change into a whole-package
audit.

## Required structure

- `<component>.types.ts`: public slots, props, named variants, private state slots, and resolved state.
- `<component>.styles.ts`: structural styles and module-scoped state or theme style factories.
- `use<Component>.ts`: defaults, derived state, accessibility, interaction hooks, theme state, and slot construction.
- `use<Component>Styles.ts`: cached style selection, ordered style arrays, and `attachSlotProps`.
- `render<Component>.tsx`: pure slot ordering and conditional structure.
- `<component>.ts`: state -> styles -> render assembly and `displayName`.

## Non-negotiable invariants

- Keep render-only slots private to state.
- Exclude native `children` or other props the component owns.
- Preserve the distinction between omitted and false controlled values.
- Classify every stateful axis before wiring it. A self-driving control, where the interaction _is_ the state change,
  supports both directions through the `<state>` / `default<State>` / `on<State>Change` triple and `useToggleState`
  from `framework-base`. Externally driven selection exposes only `selected`, never changes it, and reports the
  interaction through `onPress`.
- Use Flex tokens first and document genuine token gaps.
- Create style factories only at module scope and cache theme-only styles.
- Declare state precedence explicitly; disabled wins over pressed, which wins over hovered.
- Apply user styles after component styles.
- Render focus feedback through `FocusVisual`; do not add `outline*` props or enable RNW native
  focus visuals because RNW 0.81 can fail-fast when either path creates border visuals after mount.
- Keep render functions free of hooks, token reads, style creation, and slot mutation.
- Export the resolved state type and the state, style-application, and render stages from the package root under
  component-qualified unstable names so another component can reuse the pipeline.
- Test public accessibility, every finite variant axis, interactions, optional slots, user forwarding, and constrained
  layout.
- Test both paths of a self-driving axis, and test that an externally driven `selected` does not change on press.
- Keep a self-driving controlled prop out of story `args`, and keep an identity-changing axis out of story controls.

## Focused references

- [Types and slots](../../../../.github/skills/agentic-component-authoring/references/types-and-slots.md)
- [State and accessibility](../../../../.github/skills/agentic-component-authoring/references/state-and-accessibility.md)
- [Styles and tokens](../../../../.github/skills/agentic-component-authoring/references/styles-and-tokens.md)
- [Rendering and assembly](../../../../.github/skills/agentic-component-authoring/references/rendering.md)
- [Tests and stories](../../../../.github/skills/agentic-component-authoring/references/tests-and-stories.md)
