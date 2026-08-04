---
name: agentic-component-authoring
description: Generate or update Fluent UI React Native components in packages/agentic-components. Use for component APIs, slots, state hooks, token styling, render functions, tests, stories, and spec-driven component work.
license: MIT
---

# Agentic component authoring

Build components in `packages/agentic-components` as React Native adaptations of the Fluent UI v9 component pattern.

## Workflow

1. Read the repository `AGENTS.md`, the component's colocated `SPEC.md`, and every companion file it references.
2. Inspect `components/button` as the canonical implementation before choosing file structure or slot patterns.
3. Preserve the component's spec axes, accessibility contract, interaction states, and platform guidance. Call out a genuine token gap rather than inventing an unrelated literal.
4. Define public slots and props in `<component>.types.ts` with `Slot`, `OptionalSlot`, `ComponentProps`, and `ComponentState`.
   Add state-only slots in a separate internal slot type when rendering needs measuring, overlay, or structural elements that
   should not become public props.
5. Resolve defaults, accessibility, interaction state, and slots in `use<Component>.ts`.
6. Apply state-driven slot props in `useApplyStyles.ts` with `attachSlotProps`.
7. Keep `render<Component>.tsx` pure. Add `/** @jsxImportSource @fluentui-react-native/framework-base */` when rendering slot components.
8. Keep the entry component small: state hook, style hook, render function.
9. Export the component and its public types explicitly from `src/index.ts`; never use wildcard exports.
10. Update tests and Storybook stories to exercise the public slot-based API.

## Token rules

- Import non-color values directly from `@fluentui-react-native/design/tokens/global`.
- Read semantic colors from `useThemeState().tokens` so flex interaction overrides and future themes flow through the component.
- Prefer flex color tokens. Use `globalTokens` only when no flex semantic color exists.
- Never replace available spacing, radius, stroke, typography, or size tokens with numeric literals.
- Resolve interactive colors in this priority order: disabled, pressed, hovered, rest. Apply selected and appearance axes within that state.
- User styles should be applied after token-derived component styles.

## Canonical component responsibilities

- `<component>.types.ts`: public slots, props, named variants, and resolved state.
- `use<Component>.ts`: defaults, accessibility, interaction hooks, and slot construction.
- `useApplyStyles.ts`: token selection and `attachSlotProps`; memoize derived style objects when useful.
- `render<Component>.tsx`: slot ordering and conditional layout only; no hooks or token lookup.
- `<component>.ts`: compose the state, style, and render stages.

For selected text whose weight changes, reserve layout with an inaccessible Semibold ghost slot and overlay the visible
Regular/Semibold label. Keep measurement and overlay slots state-only so selection never changes the component width.

## Coverage

Test at minimum:

- default props and accessibility
- each appearance and size axis
- hover, pressed, disabled, focused, and selected behavior
- optional slots, slot ordering, and `as` replacement where relevant
- user event forwarding and style overrides
- icon-only accessibility and minimum target size where applicable

Run the package build, test, lint, and format commands, then run the root `yarn build` when public types or project references change.
