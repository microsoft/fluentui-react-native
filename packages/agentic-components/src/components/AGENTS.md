# Higher-order component authoring

These instructions apply to `packages/agentic-components/src/components` and its descendants.

Higher-order components own design-token styling, interaction state, layout, and component-level accessibility behavior.
Use `components/button` as the canonical implementation.

## Component structure

1. Define public slots and props in `<component>.types.ts` with `Slot`, `OptionalSlot`, `ComponentProps`, and
   `ComponentState`.
2. Add state-only slots in a separate internal slot type when rendering needs measuring, overlay, or structural elements
   that should not become public props.
3. Resolve defaults, accessibility, interaction state, and slots in `use<Component>.ts`.
4. Apply state-driven slot props in `useApplyStyles.ts` with `attachSlotProps`.
5. Keep `render<Component>.tsx` pure. Add `/** @jsxImportSource @fluentui-react-native/framework-base */` when rendering
   slot components.
6. Keep `<component>.ts` small: compose the state hook, style hook, and render function.

## Token and style rules

- Consult `packages/agentic-design/src/tokens/mappings/flex-token-map.yaml` for the canonical mapping from generic CSS and
  Fluent authoring sources to grouped React Native Flex token paths.
- Read semantic colors from `useThemeState().tokens.color` so Flex interaction overrides and future themes flow through
  the component. Use `buildInteractiveStyles` for semantic interactive color sets.
- Access other Flex categories through their grouped objects, such as `tokens.shadow`, `tokens.fontWeight`,
  `tokens.fontFamily`, `tokens.fontSize`, `tokens.lineHeight`, `tokens.borderRadius`, `tokens.spacing`, and
  `tokens.strokeWidth`.
- Prefer Flex tokens for every mapped semantic value. Import named values from
  `@fluentui-react-native/design/tokens/global` only when the Flex contract has no equivalent, such as component icon
  dimensions, and record the genuine token gap in the component spec.
- Cache theme-dependent `StyleSheet.create` results with a module-scoped getter created by
  `themedStyleSheetFactory(symbolName, factory)`. Treat the resulting style sheet as immutable and reuse it across
  component instances.
- A cached sheet may depend only on its `ThemeState` (`tokens` and `highContrast`). Keep props, interaction state, and user
  styles outside the cache so one instance cannot leak styles into another.
- Never replace available spacing, radius, stroke, typography, or size tokens with numeric literals.
- Resolve interactive colors in this priority order: disabled, pressed, hovered, rest. Apply selected and appearance axes
  within that state.
- Apply user styles after token-derived component styles.

## Canonical file responsibilities

- `<component>.types.ts`: public slots, props, named variants, and resolved state.
- `use<Component>.ts`: defaults, accessibility, interaction hooks, and slot construction.
- `useApplyStyles.ts`: retrieve cached theme styles through module-scoped `themedStyleSheetFactory` getters, select
  state-specific styles, and call `attachSlotProps`.
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
