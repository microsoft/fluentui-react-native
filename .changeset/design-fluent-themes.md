---
'@fluentui-react-native/design': minor
---

Add the `@fluentui-react-native/design/themes` entry point with `fluentLightTheme`, `fluentDarkTheme`, and `fluentTheme`.
The themes are built from the generated Fluent 2 alias colors, shadows, font aliases, and global tokens rather than
hand-authored values, and each legacy palette color points at the alias color that plays its role. `fluentTheme` is a
`ThemeReference` that follows the system appearance, and the `appearance` prop of `ThemeProvider` or `ThemedRoot`
overrides it. High-contrast and elevated appearances resolve by color scheme for now.
