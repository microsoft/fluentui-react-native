# Customized Themes

One of the powerful aspects of FURN theming is that it is heavily customizable. We recognize that users may have a need to change various parts of default themes, so we allow for several ways to specify overrides.

## Creating a custom theme

There are two ways to make a custom theme: you can tack onto an existing one using `ThemeRecipes`, or create one from scratch. Generally it's easier to extend one of the default ones we provide.

### Extending an existing `ThemeReference`

We have a concept of `ThemeRecipes` which allow for layering of partial theme objects to create the ultimately desired theme. `ThemeRecipes` are functions which take a `Theme` and spit out a [`PartialTheme`](../../../packages/theming/theme-types/src/Theme.types.ts), which is then deep merged into the base theme object.

You can extend one of our default themes by creating a `ThemeReference` using the default theme as the base theme, and then add your customization as a `ThemeRecipe`:

```ts
import { ThemeReference, ThemeProvider } from '@fluentui-react-native/theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import { Theme } from '@fluentui-react-native/framework';

const theme = new ThemeReference(createDefaultTheme(),
  () => { return {{ colors: { buttonBackground: 'red' }}}}, // overrides the buttonBackground color token, all other colors are kept in tact
  (theme: Theme) => {
    return {
      { colors: { neutralBackground1: theme.colors.buttonBackground }}, // This is now red, because theme has previous recipe applied
      { spacing: s1: '10px' }
    }},
  // other recipes
);

// Use created theme reference in ThemeProvider
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### `ThemeReference` from scratch

You can create your own `ThemeReference` and pass it into the `ThemeProvider`. To create a `ThemeReference` you'll need to create a new instance of `ThemeReference`. You can find the type definition [here](../../../packages/framework/theme/src/themeReference.ts).

## Theme property customization

There's two ways to customize a FURN theme's properties:

1. Customize theme tokens directly by overriding certain tokens (recommended)
2. Specify how to customize FURN components for the whole theme

### Changing theme tokens directly

Theme tokens can be overridden directly. You can specify different values for theme entries and add to the set of colors. You can see what can be overridden by looking at the [Theme type definition](../../../packages/theming/theme-types/src/Theme.types.ts).

This approach is useful if you need the customizations to be applied to all components.

#### Color example

```ts
(theme: Theme) => {
  return {
    colors: {
      buttonBackground: 'red',
      neutralForeground1: theme.host.palette.Bkg,
      otherToken: theme.colors.themePrimary,
    }
  }
},
```

#### Typography example

```ts
(theme: Theme) => {
  return {
    typography: {
      sizes: {
        caption: 6,
      },
      weights: {
        semiBold: '300',
      },
      families: {
        cursive: 'Segoe UI',
      },
      variants: {
        heroLargeSemibold: { face: 'cursive', size: 'heroLarge', weight: 'semiBold' }
      }
    }
  }
},
```

#### Spacing example

```ts
(theme: Theme) => {
  return {
    spacing: {
      s1: '10px';
    }
  }
},
```

### Examples of changing theme entries based on host theme

#### Win32

```ts
import { ThemeReference, ThemeProvider } from '@fluentui-react-native/theme';
import { createOfficeTheme } from '@fluentui-react-native/win32-theme';
import { Theme } from '@fluentui-react-native/framework';

const theme = new ThemeReference(createOfficeTheme({ paletteName: 'palette' }),
  (theme: Theme) => {
    // theme.name has the current Office theme
    if (theme.name === 'Colorful') {
      return { colors: { otherToken: '#ffffff' }},
    }
    else if (theme.name === 'Black') {
      return { colors: { otherToken: '#000000' }},
    }
    // etc.
  }
  // other recipes
);
```

#### MacOS

```ts
import { ThemeReference, ThemeProvider } from '@fluentui-react-native/theme';
import { createAppleTheme } from '@fluentui-react-native/apple-theme';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { Theme } from '@fluentui-react-native/framework';

const theme = new ThemeReference(createAppleTheme(),
  (theme: Theme) => {
    // You can use getCurrentAppearance to get light/dark mode information for MacOS
    if (getCurrentAppearance(theme.host.appearance, 'light') === 'light') {
      return { colors: { otherToken: '#ffffff' }},
    }
    else if (getCurrentAppearance(theme.host.appearance, 'light') === 'dark') {
      return { colors: { otherToken: '#000000' }},
    }

    return {};
  }
  // other recipes
);
```

### Components (Only for FURN components)

The FURN theme has a components property which can be used to customize all instances of a FURN component used under the theme:

```ts
interface Theme {
  ...
  components: {
    [key: string]: object,
  };
  ...
}
```

<font size=1>(Taken from the [`Theme` type definition](../../../packages/theming/theme-types/src/Theme.types.ts).)</font>

NOTE: If you would prefer to customize one instance of a FURN component instead, use [the customize API](../../../packages/framework/composition/README.md).

In order to have the theme override a particular component's styling, you'll need to specify a component's name and provide some overrides for the component's tokens. The object specifies how a component's tokens should be overridden.

```ts
components: {
  <ComponentName>: {
    <tokenName>: <overrideValue>
  },
},
```

For example, if you want to change the tokens on the [Button component](../../../packages/components/Button) for the whole theme, you could do something like the following:

```ts
(theme: Theme) => {
  return {
    components: {
      Button: {
        backgroundColor: 'primaryButtonBackground', // Different semantic color
        color: 'neutralBackground1', // Alias token
        hovered: {
          backgroundColor: theme.host.colors['AppShade10'], // Get brand color from host
          color: theme.host.colors['Gray96'], // Get gray from host
          borderColor: theme.host.palette.Bkg, // Get entry from palette from host
        },
      },
    }
  }
},
```

You can see what settings can be customized by looking at a component's settings, styling, or tokens file.

For an example on the older framework:

```ts
(theme: Theme) => {
  return {
    components: {
      Button: {
        tokens: {
          backgroundColor: 'primaryButtonBackground', // Different semantic color
          color: 'neutralBackground1', // Alias token
        },
        _overrides:{
          tokens:{
            hovered: {
              backgroundColor: theme.host.colors['AppShade10'], // Get brand color from host
              color: theme.host.colors['Gray96'], // Get gray from host
              borderColor: theme.host.palette.Bkg, // Get entry from palette from host
            },
          },
        }
      },
    },
  }
},
```
