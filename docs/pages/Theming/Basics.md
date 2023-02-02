# Theming

## What is a theme in FURN?

In FURN, a theme can affect things like typography and spacing, in addition to colors.

Components that are provided by FURN take advantage of the set theme and change their appearance if the theme changes.
A FURN theme can also be applied to other components or scenarios, if you want to build your own components using FURN's frameworks or just want to use the theming system by itself.
FURN has default themes, but also allows for users to customize them in various ways.

The theming system in FURN runs on top of [the Context concept from React](https://reactjs.org/docs/context.html).

## When to use FURN theming

The FURN themes follow the Fluent design system, so if you're using the Fluent design system to build UI on native platforms, then using a FURN theme is an easy way to achieve that goal. The theming system provides an easy way to access the values from Fluent design system.

If you're using FURN components, a benefit of using a theme is that FURN components are built to take advantage of it. Although we do have a built-in default theme, our components work best when a theme is provided.

If you're using FURN inside of an Office host, the theme on the win32 platform will also have access to palettes from Office.

## Creating a FURN theme

We have default themes for each platform. See [this page](./DefaultThemes.md) for how to get the default theme for a particular platform. These can also be used as a basis for a custom theme. For more information about customizing themes, take a look at [Custom Themes](./CustomTheme.md).

## Applying a FURN theme

### Populating the Theme

The theme is made available by the `ThemeProvider`. It takes in a `ThemeReference` as a value, which is the object created by the functions referenced in the pages above.

```tsx
import { ThemeProvider } from '@fluentui-react-native/theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';

// This will use the built-in theme from FURN.
const defaultTheme = createDefaultTheme();

// Then, wrap your components in the ThemeProvder
export const App = () => {
  return (
    // Theme is available to all children through ThemeContext
    <ThemeProvider theme={defaultTheme}>
      <AppContent />
    </ThemeProvider>
  );
};
```

### Accessing theme properties

You can use the `useFluentTheme()` hook to get the current theme inside a component. The hook must be used in a component that is under the `ThemeProvider` in the component tree, since it grabs the `context` from the `ThemeProvider`. If you try to access the theme outside of a `ThemeProvider`, you will get a hardcoded fallback theme.

```tsx
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Text } from 'react-native';

export const AppContent = () => {
  const theme = useFluentTheme();

  return <Text style={{ color: theme.colors.bodyText }}>Hello World!</Text>;
};
```

This is useful if you are styling a stock React Native component, or want to override the default style of a FURN component. It is not necessary if you are using the default style of a FURN component.

If you'd prefer to put the component's styles into a `StyleSheet` instead of accessing the `theme` directly, you can use [themed `StyleSheets`](./ThemedStylesheet.md)

## Testing a FURN theme

See [this page](../Testing/TestingThemesWin32.md) for information about testing themes.
