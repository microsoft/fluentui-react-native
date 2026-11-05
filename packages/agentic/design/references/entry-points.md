---
id: design.entry-points
kind: instruction-reference
owner_paths:
  - packages/agentic/design/package.json
---

# Entry points

The package is `sideEffects: false` and exposes explicit subpaths so consumers load only the graph they use. Export
public symbols by name from each entry point; do not add barrel re-exports.

| Subpath                   | Contents                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `.` (root)                | Modern theming (`ThemeProvider`, `ThemedRoot`, `FlexThemeReference`, hooks), Flex token types                                               |
| `./theming`               | The complete modern and legacy theming API, including `ThemeReference` and `useTheme`                                                       |
| `./theming/legacy-source` | `ThemeReference` without the legacy consumption graph                                                                                       |
| `./theming/compat`        | `themeFromFlexTokens`, which projects Flex tokens onto the Fluent theme for the appearance                                                  |
| `./themes`                | Ready-made themes: `fluentLightTheme`, `fluentDarkTheme`, `fluentHcTheme`, `fluentTheme`, `flexTheme`, `flexCoolTheme`, and `flexWarmTheme` |
| `./tokens/global`         | Generated platform global token constants                                                                                                   |
| `./color-lib`             | Raw color parsing, conversion, compositing, and interaction algorithms; see `color-lib.md`                                                  |
| `./styling`               | State and color style factories; see `styling.md`                                                                                           |
| `./styling/stylesheet`    | The legacy `themedStyleSheet` helper                                                                                                        |
| `./styling/tokens`        | Legacy token-to-style builders                                                                                                              |
| `./testing`               | Test-only fixtures and validation; see `testing.md`                                                                                         |
| `./deprecated`            | Fluent 2 token JSON loaders and pipeline mappers, restricted to existing consumers; see [below](#deprecated-entry-point)                    |

The `apps/bundle-size` `design-*` scenarios guard these boundaries. Input patterns check the import graph and output
patterns check the modules a tree-shaken bundle retains. Every design scenario except the color-library one forbids
`src/deprecated/` from the import graph. The modern root and legacy-source scenarios forbid the compatibility modules
and `color-lib/compositing`. The modern root scenarios and the legacy-source scenario, which pairs a legacy
`ThemeReference` with `useThemeState`, require the retained Flex interaction policy and `color-lib/interaction`; the
legacy-source scenario also forbids a retained `FlexThemeReference`. Only the legacy theme scenario forbids any retained
`color-lib/` or `flex/` module. The Fluent theme scenarios forbid `useTheme` and the compatibility modules from the
import graph and any retained `flex/`, `color-lib/`, or Flex theme module, and a bundle that imports only
`fluentLightTheme` retains no other theme and no `ThemeReference`, while one that imports only `fluentHcTheme` retains
only the high-contrast themes. The fixed Flex theme scenarios reject the other palette's generated data in retained
output; the dynamic `flexTheme` scenario requires both palettes. The Flex theme scenarios require the x3 defaults and forbid `fluent/` and
`color-lib/compositing`. The color-library scenario requires its algorithms, and the legacy-projection scenario requires
the projection, the Fluent theme selection, and the generated Fluent tokens it projects onto. Every scenario also
requires a module it is expected to load, so a moved file cannot make a forbidden pattern pass vacuously.

The package specifiers above are the supported import surface. Source and build paths such as `src/fluent/...` or
`lib/...` are private implementation details that may move without a breaking change.

## Deprecated entry point

`./deprecated` is built from `src/deprecated/`, the only design source that imports the Fluent 2 token JSON from the
`@fluentui-react-native/design-tokens-*` packages. It exports the token loaders (`getAliasTokens`, `getShadowTokens`,
`globalTokens`, and `hcAliasTokens`) and the pipeline mappers that turn that JSON into theme values
(`mapPipelineToTheme`, `mapFontPipelineToTheme`, and `mapPipelineToShadow`). It has no replacement API: new code uses
the ready-made themes from `./themes`, whose generated tokens the build derives from the same JSON with these mappers.

- **R-DESIGN-003:** Only tests, other `src/deprecated/` modules, and build scripts may use `src/deprecated/`, and only
  the existing deprecated consumers may import `@fluentui-react-native/design/deprecated`: the `theme-tokens` and
  `theming-utils` shims, the Android, Apple, and Win32 theme packages, and the private tester app. No other design
  source imports a `design-tokens-*` package, and no other production entry point reaches `src/deprecated/`.

`src/test/compatibility/importBoundaries.test.ts` enforces the rule inside this package, and the bundle-size scenarios
forbid `src/deprecated/` from the other design entry points. `remaining-work.md` tracks retiring the entry point.

## Compatibility packages

`@fluentui-react-native/design` is the definition site for the symbols below.
The legacy packages listed here are compatibility entry points and contain only
explicit named re-exports.

| Legacy package                             | Exported symbols                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Owning design entry point                                                              | Definition                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@fluentui-react-native/theme`             | `ThemeProvider`, `ThemeProviderProps`, `ThemeReference`, `OnThemeChange`, `ThemeRecipe`, `ThemeTransform`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `@fluentui-react-native/design/theming`                                                | `src/theming/ThemeProvider.tsx`, `src/fluent/themeReference.ts`                                                   |
| `@fluentui-react-native/theme-types`       | `AliasColorTokens`, `AppearanceOptions`, `BaseShadowAliasTokens`, `Color`, `FabricWebPalette`, `FontDynamicTypeRamp`, `FontFamilies`, `FontFamily`, `FontFamilyValue`, `FontSize`, `FontSizeValuePoints`, `FontSizes`, `FontWeight`, `FontWeightValue`, `FontWeights`, `OfficePalette`, `Palette`, `PaletteBackgroundColors`, `PaletteTextColors`, `PartialPalette`, `PartialShadowDefinition`, `PartialTheme`, `PartialTypography`, `ShadowToken`, `ShadowValue`, `Spacing`, `TextStyling`, `Theme`, `ThemeColorDefinition`, `ThemeContext`, `ThemeOptions`, `ThemeShadowDefinition`, `Typography`, `Variant`, `VariantValue`, `Variants`, `useTheme` | `@fluentui-react-native/design/theming`                                                | `src/theming/context.ts`, `src/fluent/types/`                                                                     |
| `@fluentui-react-native/theming-utils`     | `getCurrentAppearance`, `isHighContrast`, `setIsHighContrast`; the deprecated `mapFontPipelineToTheme`, `mapPipelineToShadow`, and `mapPipelineToTheme`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `@fluentui-react-native/design/theming` and `@fluentui-react-native/design/deprecated` | `src/fluent/platformUtils.*.ts`, `src/deprecated/mapPipelineToShadow.ts`, `src/deprecated/mapPipelineToTheme*.ts` |
| `@fluentui-react-native/theme-tokens`      | `getAliasTokens`, `getShadowTokens`, `globalTokens`, `hcAliasTokens` (deprecated)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `@fluentui-react-native/design/deprecated`                                             | `src/deprecated/`                                                                                                 |
| `@fluentui-react-native/tokens`            | `backgroundColorTokens`, `borderStyles`, `borderTokens`, `colorTokens`, `fontStyles`, `foregroundColorTokens`, `getPaletteFromTheme`, `layoutStyles`, `layoutTokens`, `shadowStyles`, `shadowTokens`, `styleFunction`, `textTokens`, `tokenBuilder`, `FontDecorationTokens`, `FontStyleTokens`, `FontTokens`, `FontVariantTokens`, `IBackgroundColorTokens`, `IBorderTokens`, `IColorTokens`, `IForegroundColorTokens`, `IShadowTokens`, `LayoutTokens`, `LookupThemePart`, `OperationSet`, `StyleFactoryFunction`, `StyleFactoryFunctionRaw`, `StyleFactoryOperation`, `TokenBuilder`                                                                 | `@fluentui-react-native/design/styling/tokens`                                         | `src/fluent/styling/tokens/`                                                                                      |
| `@fluentui-react-native/themed-stylesheet` | `NamedStyles`, `themedStyleSheet`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `@fluentui-react-native/design/styling/stylesheet`                                     | `src/fluent/styling/stylesheet/themedStyleSheet.ts`                                                               |

The optional `deprecated`, `styling/tokens`, and `styling/stylesheet` entry
points are intentionally absent from the design root barrel. This keeps
deprecated token data and legacy styling infrastructure out of consumers that
only use the current design APIs.
