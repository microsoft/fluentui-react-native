---
id: design.entry-points
kind: instruction-reference
owner_paths:
  - packages/agentic/design/package.json
---

# Entry points

The package is `sideEffects: false` and exposes explicit subpaths so consumers load only the graph they use. Export
public symbols by name from each entry point; do not add barrel re-exports.

| Subpath                     | Contents                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `.` (root)                  | Modern theming (`ThemeProvider`, `ThemedRoot`, `FlexThemeReference`, hooks), Flex token types |
| `./theming`                 | The complete modern and legacy theming API, including `ThemeReference` and `useTheme`         |
| `./theming/legacy-source`   | `ThemeReference` without the legacy consumption graph                                         |
| `./theming/compat`          | `themeFromFlexTokens` and `getDefaultLegacyTheme`                                             |
| `./theming/compat/defaults` | `getDefaultLegacyTheme` alone, for platform theme packages                                    |
| `./tokens/global`           | Generated platform global token constants                                                     |
| `./tokens/legacy`           | Legacy alias, shadow, and global token data                                                   |
| `./color-lib`               | Raw color parsing, conversion, compositing, and interaction algorithms; see `color-lib.md`    |
| `./styling`                 | State and color style factories; see `styling.md`                                             |
| `./styling/stylesheet`      | The legacy `themedStyleSheet` helper                                                          |
| `./styling/tokens`          | Legacy token-to-style builders                                                                |
| `./testing`                 | Test-only fixtures and validation; see `testing.md`                                           |

The `apps/bundle-size` `design-*` scenarios guard these boundaries. Input patterns check the import graph and output
patterns check the modules a tree-shaken bundle retains. The modern root and legacy-source scenarios forbid the
compatibility and legacy-token modules; the modern root scenarios forbid `color-lib/compositing` and require the
retained Flex interaction policy; the legacy-source and legacy theme scenarios forbid any retained color-library or Flex
interaction module, although the legacy-source scenario retains the engine-free color envelope that `useThemeState`
returns; and the color-library and legacy-projection scenarios require their expected modules. Every scenario
also requires a module it is expected to load, so a moved file cannot make a forbidden pattern pass vacuously.

The package specifiers above are the supported import surface. Source and build paths such as `src/fluent/...` or
`lib/...` are private implementation details that may move without a breaking change.

## Compatibility packages

`@fluentui-react-native/design` is the definition site for the symbols below.
The legacy packages listed here are compatibility entry points and contain only
explicit named re-exports.

| Legacy package                             | Exported symbols                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Owning design entry point                          | Definition                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `@fluentui-react-native/theme`             | `ThemeProvider`, `ThemeProviderProps`, `ThemeReference`, `OnThemeChange`, `ThemeRecipe`, `ThemeTransform`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `@fluentui-react-native/design/theming`            | `src/theming/ThemeProvider.tsx`, `src/fluent/themeReference.ts`                                           |
| `@fluentui-react-native/theme-types`       | `AliasColorTokens`, `AppearanceOptions`, `BaseShadowAliasTokens`, `Color`, `FabricWebPalette`, `FontDynamicTypeRamp`, `FontFamilies`, `FontFamily`, `FontFamilyValue`, `FontSize`, `FontSizeValuePoints`, `FontSizes`, `FontWeight`, `FontWeightValue`, `FontWeights`, `OfficePalette`, `Palette`, `PaletteBackgroundColors`, `PaletteTextColors`, `PartialPalette`, `PartialShadowDefinition`, `PartialTheme`, `PartialTypography`, `ShadowToken`, `ShadowValue`, `Spacing`, `TextStyling`, `Theme`, `ThemeColorDefinition`, `ThemeContext`, `ThemeOptions`, `ThemeShadowDefinition`, `Typography`, `Variant`, `VariantValue`, `Variants`, `useTheme` | `@fluentui-react-native/design/theming`            | `src/theming/context.ts`, `src/fluent/types/`                                                             |
| `@fluentui-react-native/theming-utils`     | `getCurrentAppearance`, `isHighContrast`, `mapFontPipelineToTheme`, `mapPipelineToShadow`, `mapPipelineToTheme`, `setIsHighContrast`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `@fluentui-react-native/design/theming`            | `src/fluent/platformUtils.*.ts`, `src/fluent/mapPipelineToShadow.ts`, `src/fluent/mapPipelineToTheme*.ts` |
| `@fluentui-react-native/theme-tokens`      | `getAliasTokens`, `getShadowTokens`, `globalTokens`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `@fluentui-react-native/design/tokens/legacy`      | `src/fluent/tokens/`                                                                                      |
| `@fluentui-react-native/tokens`            | `backgroundColorTokens`, `borderStyles`, `borderTokens`, `colorTokens`, `fontStyles`, `foregroundColorTokens`, `getPaletteFromTheme`, `layoutStyles`, `layoutTokens`, `shadowStyles`, `shadowTokens`, `styleFunction`, `textTokens`, `tokenBuilder`, `FontDecorationTokens`, `FontStyleTokens`, `FontTokens`, `FontVariantTokens`, `IBackgroundColorTokens`, `IBorderTokens`, `IColorTokens`, `IForegroundColorTokens`, `IShadowTokens`, `LayoutTokens`, `LookupThemePart`, `OperationSet`, `StyleFactoryFunction`, `StyleFactoryFunctionRaw`, `StyleFactoryOperation`, `TokenBuilder`                                                                 | `@fluentui-react-native/design/styling/tokens`     | `src/fluent/styling/tokens/`                                                                              |
| `@fluentui-react-native/themed-stylesheet` | `NamedStyles`, `themedStyleSheet`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `@fluentui-react-native/design/styling/stylesheet` | `src/fluent/styling/stylesheet/themedStyleSheet.ts`                                                       |

The three optional entry points (`tokens/legacy`, `styling/tokens`, and
`styling/stylesheet`) are intentionally absent from the design root barrel.
This keeps legacy token data and styling infrastructure out of consumers that
only use the current design APIs.
