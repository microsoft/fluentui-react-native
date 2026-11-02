---
'@fluentui-react-native/design': minor
---

Breaking: move every module that loads the Fluent 2 token JSON into a new `@fluentui-react-native/design/deprecated`
entry point, reserved for tests and the existing platform themes. It exports `getAliasTokens`, `getShadowTokens`,
`globalTokens`, `hcAliasTokens`, `mapPipelineToTheme`, `mapFontPipelineToTheme`, and `mapPipelineToShadow`. The
`theming` entry point no longer exports the pipeline mappers, and the `tokens/legacy` and `theming/compat/defaults`
entry points and `getDefaultLegacyTheme` are removed; use the Fluent themes from `@fluentui-react-native/design/themes`
for complete default themes. `themeFromFlexTokens` now fills the values Flex cannot represent from the generated Fluent
theme for the appearance instead of the removed legacy defaults, so the `theming` entry point no longer bundles the
token JSON.
