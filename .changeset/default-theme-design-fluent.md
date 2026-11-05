---
'@fluentui-react-native/default-theme': minor
---

Use the design package's Fluent themes instead of building default tokens locally. `defaultFluentTheme` and
`defaultFluentDarkTheme` are now the design package's `fluentLightTheme` and `fluentDarkTheme`, and `createDefaultTheme`
resolves its `fluentTheme`, so each platform uses its own generated Fluent tokens (macOS previously used the Windows
set) and high contrast follows the color scheme. Breaking: `createAliasTokens` is removed; read alias colors from
`theme.colors` instead.
