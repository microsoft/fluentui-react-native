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
  the component. Use `getThemedColorStyleFactory` for semantic state branches and automatic hover/pressed token
  resolution. Declare state precedence as an ordered tuple of hierarchy levels; each level contains mutually exclusive
  states in priority order.
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

## Style creation and consumption rules

- Create one module-scoped `StyleSheet` for structural styles that do not depend on tokens, theme values, props, or state.
- For styles that depend on state but not the theme, create module-scoped selectors with `getStateStyleFactory`.
- Define color hierarchy levels in this order: appearance, selected (when supported), then interaction. Order interaction
  states as disabled, pressed, and hovered so the first active state has the required priority.
- Create background and foreground getters with `getThemedColorStyleFactory`. Use the resolved foreground style for slot
  props such as an icon's `color`.
- Combine size, shape, and content-layout axes into one hierarchy selected by a getter from
  `getThemedStateStyleFactory`. Use separate themed state factories for independent concerns such as typography or focus.
- Destructure the relevant `FlexTokens` groups in factory parameters, for example
  `({ borderRadius, spacing }: FlexTokens)`, rather than repeatedly dereferencing a `tokens` parameter.
- Compose slot styles as arrays ordered from constant structural styles, to resolved state styles, to semantic colors,
  to conditional overrides, and finally user styles.
- Create all factories at module scope. A render or style hook should only select cached styles, never create a factory.

## Canonical file responsibilities

- `<component>.types.ts`: public slots, props, named variants, and resolved state.
- `<component>.styles.ts`: style definitions, module-scoped factories, lookups, and selector helpers.
- `use<Component>.ts`: defaults, accessibility, interaction hooks, and slot construction.
- `useApplyStyles.ts`: select cached styles through module-scoped style getters, compose style arrays, and call
  `attachSlotProps`.
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
