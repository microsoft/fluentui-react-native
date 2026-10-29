---
'@fluentui-react-native/design': minor
---

Rework Flex tokens around the current x3 defaults. Legacy `ThemeReference` themes, `ThemeProvider`, `useTheme`, the
legacy Fluent defaults, and Flex tokens projected from legacy themes keep their values.

Breaking changes for Flex consumers and theme authors:

- Every Flex semantic color is a resolved `InteractiveColor` with `rest`, `hover`, and `pressed`. Read
  `tokens.color.x.rest` instead of `tokens.color.x`, and `.hover` or `.pressed` instead of the removed `color.hover`
  and `color.pressed` maps. Omitted interactive states derive lazily from rest with no configuration.
- Author a color as a value, a `[light, dark]` tuple, or `flexColor` options with explicit states and a `standard`,
  `inverted`, or `fixed` interaction type. Each color override replaces the previous color atomically. Recipes receive
  the authored description; `selectColorEntry` reads an entry for an appearance.
- Appearances accept an optional `colorTone` (`cool` or `warm`) that selects the default tokens and interaction
  algorithm.
- The default tokens follow x3-design/fluent-design@206e890b for both tones, including an achromatic brand,
  translucent neutral backgrounds, and larger corner radii. Tests should read defaults from `defaultFlexTokens` in the
  `testing` entry point.
- Shadows are arrays of `{ x, y, blur, color }` layers and may vary by color scheme; author a former `{ ambient, key }`
  shadow as `[ambient, key]`, and use `selectShadowEntry` to read an authored entry. Motion tokens and
  `spacing.componentBase800` are new.
- The `color-lib` interaction functions no longer take a token; their `variant` option is replaced by `colorTone`,
  `direction`, and `compositing`. `isInverseInteractionToken` moves from `color-lib` to the package root, alongside the
  new `INTERACTIVE_COLOR_TOKENS` and `isInteractiveColorToken`.

Root `useThemeState` consumers now bundle the interaction algorithm and generated defaults, about 23 KB raw and 8 KB
gzip in the measured scenarios. Package sources move under `src/flex`, `src/fluent`, `src/types`, and `src/test`; export
keys and conditions are unchanged.
