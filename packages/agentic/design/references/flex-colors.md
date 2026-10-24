---
id: design.flex-colors
kind: instruction-reference
owner_paths:
  - packages/agentic/design/src/flex/colors
  - packages/agentic/design/src/flex/flexTokenDescription.ts
  - packages/agentic/design/src/flex/tokens.types.ts
---

# Flex colors

Every Flex semantic color is authored once and resolved per appearance into one envelope with its interaction states.
This reference covers the authored and resolved contracts, resolution and merge rules, and migration from the earlier
flat colors with separate `color.hover` and `color.pressed` maps.

## Resolved colors

`useThemeState().tokens.color.<name>` is a frozen `InteractiveColor` with `rest`, `hover`, and `pressed`. Every semantic
color uses the same envelope, including roles whose states equal rest.

```ts
const { backgroundBrandLoud } = tokens.color;
const rest = backgroundBrandLoud.rest;
const hover = backgroundBrandLoud.hover;
```

An omitted state is computed on its first read and memoized for that resolved appearance. Read only the states a style
path needs; destructuring `hover` and `pressed` reads both. Resolved tokens are appearance-bound outputs: never author
them back into a theme.

## Authored colors

A `FlexColorInput` is one of:

| Input                               | Meaning                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| A `ColorValue`                      | Rest for every color scheme                                 |
| A `[light, dark]` tuple             | Rest selected by the resolved `colorScheme`                 |
| `{ rest, hover?, pressed?, type? }` | Rest plus explicit states; each entry is a value or a tuple |

`flexColor(value, type?)` normalizes an input into a new frozen description and never mutates its argument. The second
argument sets the interaction type unless `value.type` is supplied. `selectColorEntry(entry, appearance)` reads the
scheme-specific value from an authored entry.

```ts
import { flexColor } from '@fluentui-react-native/design';

// The common case: rest colors only, derived states.
const brand = flexColor(['#345678', '#abcdef'], 'inverted');

// Explicit state exceptions.
const accent = flexColor({ rest: ['#345678', '#abcdef'], pressed: ['#123456', '#cdef01'], type: 'inverted' });
```

| Type       | Omitted interactive states                                                               |
| ---------- | ---------------------------------------------------------------------------------------- |
| `standard` | Derived in the scheme's standard lightness direction; the type of a plain value          |
| `inverted` | Derived in the opposite direction, as the default heavy, loud, and on-loud roles do      |
| `fixed`    | Not derived; an interactive token with a mappable rest must author `hover` and `pressed` |

## Resolution

For each color and resolved appearance:

1. A tuple selects light or dark.
2. An explicit state wins.
3. An omitted state of a token outside `INTERACTIVE_COLOR_TOKENS` (see `color-lib.md`) is rest.
4. A `fixed` interactive color throws while resolving if a state is omitted and JavaScript can map rest; with a rest it
   cannot map, the omitted state is rest.
5. In high contrast, an omitted state is rest.
6. Otherwise the omitted state is derived from rest on first read with the `color-lib` interaction algorithm, using the
   color's type as the direction, the appearance's `colorTone`, and the token's compositing mode. No import, provider
   setting, or registration is required. When JavaScript cannot map rest, such as a `PlatformColor`, the state is the
   identical rest value; unexpected algorithm failures still throw.

The default descriptions are rest-first: they author a hover or pressed state only where the policy cannot reproduce the
x3 source (see `tokens.md`), so their other states are derived like any authored color. The Theme-to-Flex adapter never
derives states: its omitted states equal rest, so legacy-projected values are unchanged.

## Merging and recipes

`FlexThemeReference` merges the package defaults, its `base`, and its recipes in order. A color override replaces the
previous color atomically, including its explicit states and type, so a stale state never survives a new rest. Shadow
overrides also replace the whole layered shadow. An `undefined` color or shadow is not an override. Other token groups
keep deep-merge semantics.

Because replacement is atomic, a plain override uses the `standard` type even where the default color is inverted.
Use `flexColor(value, 'inverted')` when overriding a heavy, loud, or on-loud role that should keep inverted interaction
feedback.

A `base` function receives the resolved appearance. A recipe function receives the accumulated authored description and
the resolved appearance, and returns overrides. Description colors are authored entries, not resolved envelopes:

```ts
import { FlexThemeReference, selectColorEntry } from '@fluentui-react-native/design';

const theme = new FlexThemeReference({}, (description, appearance) => ({
  color: { strokeBrandLoud: selectColorEntry(description.color.backgroundBrandLoud.rest, appearance) },
}));
```

Authoring rejects resolved `InteractiveColor` values, tuples without exactly two entries, unknown option keys, nested
options, and the removed `color.hover` and `color.pressed` maps.

## Migrating from flat colors

| Before                                                                       | After                                                                                   |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `tokens.color.backgroundBrandLoud`                                           | `tokens.color.backgroundBrandLoud.rest`                                                 |
| `tokens.color.hover.backgroundBrandLoud ?? tokens.color.backgroundBrandLoud` | `tokens.color.backgroundBrandLoud.hover`                                                |
| `{ color: { x: rest, hover: { x: hover } } }`                                | `{ color: { x: { rest, hover } } }`                                                     |
| `{ color: { backgroundBrandLoud: '#…' } }` (implicitly inverted)             | `{ color: { backgroundBrandLoud: flexColor('#…', 'inverted') } }`                       |
| A recipe branching on `appearance.colorScheme` for a color                   | A `[light, dark]` tuple                                                                 |
| `(parent, appearance) => …parent.color.x…`                                   | `(description, appearance) => …selectColorEntry(description.color.x.rest, appearance)…` |
| `InteractiveColorOverrides`                                                  | `InteractiveColorOptions` or `PartialSemanticColors`                                    |

Other surfaces:

- Style factories keep their key-based definitions. `colorStyleDef` and `getThemedColorStyleFactory` read
  `.hover` and `.pressed` for inherited semantic keys; see `styling.md`.
- A custom `FlexThemeSource` must return resolved envelopes from `resolveFlexTokens`. Delegate to a
  `FlexThemeReference` to get atomic merging and automatic states.
- `legacyFallback` is unchanged and still supplies values Flex cannot represent to the projected legacy `Theme`.
- `themeFromFlexTokens` accepts resolved tokens and still accepts the deprecated `FlatFlexTokens` shape.
- `validateContrastPairs` audits resolved colors at rest; pass a flat map of state values to audit hover or pressed.
- Legacy `ThemeReference` themes, `ThemeProvider`, `useTheme`, and the legacy Fluent defaults are unchanged.
