# Customized Themes

One of the powerful aspects of FURN theming is that it is heavily customizable. We recognize that users may have a need to change various parts of default themes, so we allow for several ways to specify overrides.

You can create a custom theme by either building on top of an existing `ThemeReference` or building one from scratch. This then can be used by [passing it into our `ThemeProvider`](./Basics.md), which makes the theme available for all child components of the provider.

## Different aspects of customization

There's two main ways to customize a FURN theme - you can specify how to customize components, or you can customize theme tokens directly by overriding certain tokens.

### Components

The FURN theme has a components property which can be used to customize components:

```ts
interface Theme {
  ...
  components: {
    [key: string]: object,
  };
  ...
}
```

<font size=1>(Taken from the [`Theme` type definition](https://github.com/microsoft/fluentui-react-native/blob/master/packages/theming/theme-types/src/Theme.types.ts).)</font>

In order to have the theme override a particular component's styling, you'll need to specify a component's name and provide some overrides for the component's settings. The settings are an object that specifies how a component's tokens or slot's style are filled out.

```ts
components: {
  <ComponentName>: {
    <tokenName>: <overrideValue>
  },
},
```

For example, if you want to change the settings on the [Button component](https://github.com/microsoft/fluentui-react-native/blob/master/packages/components/Button/src/Button.settings.ts), you could do something like the following:

```ts
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
```

You can see what settings can be customized by looking at a component's settings, styling, or tokens file.

The advantage of this approach is that the customizations are targetted to a particular component, so the changes are localized.

### Changing theme tokens directly

Theme tokens can be overridden directly as well. You can specify different color values for a particular set of color entries, add to the set of colors, or have different values for particular typography variants. You can see what can be overridden by looking at the [Theme type definition](https://github.com/microsoft/fluentui-react-native/blob/master/packages/theming/theme-types/src/Theme.types.ts).

This approach can be preferred if you need the customizations to be applied to all components.

#### Color example

```ts
color: {
  buttonBackground: 'red',
  neutralForeground1: theme.host.palette.Bkg,
  otherToken: theme.colors.themePrimary,
}
```

#### Typography example

```ts
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
```

#### Spacing example

```ts
spacing: {
  s1: '10px';
}
```

## Creating a custom `ThemeReference`

There are two ways to make a custom `ThemeReference`: you can tack onto an existing one using `ThemeRecipes`, or create one from scratch. Generally it's easier to extend one of the default ones we provide.

### Theme reipces

We have a concept of `ThemeRecipes` which allow for layering of partial theme objects to create the ultimately desired theme. `ThemeRecipes` are functions which take a `Theme` and spit out a `PartialTheme`, which is then deep merged into the base them object.

You can extend one of our default themes by creating a `ThemeReference` using the default theme as the base theme, and then your customization as a `ThemeRecipe`:

```ts
import { ThemeReference, ThemeProvider } from '@fluentui-react-native/theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';

const theme = new ThemeReference(createDefaultTheme(),
  () => { return {{ colors: { buttonBackground: 'red' }}}}, // overrides the buttonBackground color token, all other colors are kept in tact
  (theme) => {
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

A good example from our repo is [the Office theme](https://github.com/microsoft/fluentui-react-native/blob/master/packages/theming/win32-theme/src/createOfficeTheme.ts).

### `ThemeReference` from scratch

You can create your own `ThemeReference` and pass it into the `ThemeProvider`. To create a `ThemeReference` you'll need to define the base, and add any ThemeRecipes you'd like. You can find the type definition [here](https://github.com/microsoft/fluentui-react-native/blob/master/packages/framework/theme/src/themeReference.ts).
