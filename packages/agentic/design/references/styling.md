---
id: design.styling
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/styling
  - packages/agentic/design/src/useThemeState.ts
---

# Styling

The design package owns the theme-scoped style caches and state style factories that components use. How a component
layers structural, themed, instance, and user styles is component authoring guidance; for agentic components it is the
repository reference `components.agentic.styles-and-tokens`.

## Theme-scoped caches

Every `ThemeState` owns a `themeStyles` registry that lives exactly as long as that state (see `theming.md`). Cached
values must depend only on `ThemeState`, such as its tokens and resolved appearance. Apply props, interaction state,
and user styles outside the cache so one component instance cannot leak into another, and treat cached objects as
immutable.

Create every factory at module scope, never inside a hook or render function. Each factory owns a private symbol key in
the registry.

## Factories

| API                          | Entry point                             | Caches                                                                    |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| `themedStyleSheetFactory`    | `@fluentui-react-native/design`         | One complete `StyleSheet`-style object per `ThemeState`                   |
| `getStateStyleFactory`       | `@fluentui-react-native/design/styling` | One lazily flattened, theme-independent state definition                  |
| `getThemedStateStyleFactory` | `@fluentui-react-native/design/styling` | One flattened, token-derived state definition per `ThemeState`            |
| `getThemedColorStyleFactory` | `@fluentui-react-native/design/styling` | Semantic color definitions, resolved through `getThemedStateStyleFactory` |

Prefer the state factories for styles that vary by component state; use `themedStyleSheetFactory` only for a complete
theme-only style set that a branched definition does not represent. The state factories cache plain resolved style
objects; do not wrap them in another `StyleSheet.create` cache.

## State hierarchies

A state style definition declares ordered hierarchy levels. Each level lists mutually exclusive states in precedence
order, and a state can contain states from any later level. Later-level states can also appear at the base as
fallbacks. `createStateLevelMap` rejects ambiguous hierarchies.

`pickActiveStyle` selects the most specific defined path: paths with more active states win, followed by paths whose
states come from deeper levels. `getActiveState` picks the first active state in a precedence list;
`interactiveStatePriority` is `disabled`, `pressed`, then `hovered`.

`getThemedColorStyleFactory` and `colorStyleDef` accept semantic color keys in place of colors. They synthesize hovered
and pressed nodes wherever those states are declared, resolving `tokens.color.hover` and `tokens.color.pressed` for the
inherited key. An interaction branch may still select a different semantic key explicitly.

## Value helpers

Token types can be wider than a React Native style property. `getGapStyleValue` narrows a gap token to a valid
`ViewStyle['gap']`, and `getNumericStyleValue` accepts finite numbers and numeric strings.

## Legacy styling

`@fluentui-react-native/design/styling/stylesheet` (`themedStyleSheet`) and `@fluentui-react-native/design/styling/tokens`
(token-to-style builders such as `styleFunction`) serve v0 and v1 code, directly or through their compatibility packages;
see `entry-points.md`. Agentic components use the modern factories instead.
