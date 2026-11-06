# `@fluentui-react-native/design`

Core design system concepts, utilities, and types for Fluent UI React Native: theme sources and providers, ready-made
Fluent and Flex themes, structured light, dark, high-contrast, and elevated appearance, Flex semantic tokens, themed
style factories, and an opt-in runtime color library. Legacy theme and token packages re-export their APIs from here.

## Quick start

Wrap a scene in `ThemedRoot` (or `ThemeProvider`) and read Flex tokens with `useThemeState`:

```tsx
import { Text } from 'react-native';
import { FlexThemeReference, ThemedRoot, useThemeState } from '@fluentui-react-native/design';

const theme = new FlexThemeReference({ appearance: { colorScheme: 'system' } });

const Title = () => {
  const { tokens } = useThemeState();
  return <Text style={{ color: tokens.color.foregroundNeutralPrimary.rest, fontSize: tokens.fontSize.functionalTitleSmall }}>Hello</Text>;
};

export const App = () => (
  <ThemedRoot theme={theme} style={{ flex: 1 }}>
    <Title />
  </ThemedRoot>
);
```

Existing `ThemeReference` themes and `useTheme` consumers keep working under the same provider; the
[theming reference](references/theming.md) explains both authoring models and how they interoperate.

Fluent's own light, dark, and high-contrast themes ship in the `themes` entry point, and `fluentTheme` follows the
system appearance, including high contrast:

```tsx
import { ThemedRoot } from '@fluentui-react-native/design';
import { fluentTheme } from '@fluentui-react-native/design/themes';

export const App = () => (
  <ThemedRoot theme={fluentTheme} style={{ flex: 1 }}>
    <Title />
  </ThemedRoot>
);
```

Use `fluentLightTheme` or `fluentDarkTheme` when you need one fixed `Theme` object, or `fluentHcTheme` to always use
high contrast.

The same entry point ships the x3 Flex defaults as `flexCoolTheme` and `flexWarmTheme`, independently bundleable
descriptions covering light and dark. `flexTheme` includes both and switches palettes with `appearance.colorTone`.
Use one as a `FlexThemeReference` base:

```tsx
import { FlexThemeReference } from '@fluentui-react-native/design';
import { flexWarmTheme } from '@fluentui-react-native/design/themes';

const theme = new FlexThemeReference({ base: flexWarmTheme, appearance: { colorScheme: 'system' } });
```

Without an explicit theme or inherited boundary, `ThemedRoot` and the theme hooks use `flexCoolTheme`.

## Documentation

| Topic                                          | Covers                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| [Theming](references/theming.md)               | Theme references, providers, appearance, hooks, and legacy projection |
| [Flex colors](references/flex-colors.md)       | Authoring and reading Flex colors, and migrating from flat colors     |
| [Tokens](references/tokens.md)                 | Token sources and Flex token mapping maintenance                      |
| [Styling](references/styling.md)               | Themed style caches and state or color style factories                |
| [Color library](references/color-lib.md)       | Raw `color-lib` algorithms and the Flex interaction-color policy      |
| [Testing helpers](references/testing.md)       | Test-only fixtures and contrast validation                            |
| [Entry points](references/entry-points.md)     | Every subpath and the legacy compatibility packages                   |
| [Contributing](references/contributing.md)     | Source ownership, generated files, tests, and validation              |
| [Remaining work](references/remaining-work.md) | Open theming and appearance work                                      |

The [reference index](references/README.md) lists every reference by ID. Agents working in this package start from
[AGENTS.md](AGENTS.md).
