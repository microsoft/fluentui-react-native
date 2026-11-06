---
'@fluentui-react-native/design': minor
---

Add `flexTheme` and `flexWarmTheme` to the `@fluentui-react-native/design/themes` entry point. Each is a new
`FlexThemeDescription`, which pairs a complete Flex token description with an optional `ColorTone`, holding the cool or
warm x3 defaults. `FlexThemeReference` now accepts a `FlexThemeDescription` as its `base`: the description replaces the
package defaults, and its tone becomes the reference's default `appearance.colorTone` unless the `appearance` option or
a provider request sets one. The `ThemeState` types now live with the Flex model; their exports are unchanged.
