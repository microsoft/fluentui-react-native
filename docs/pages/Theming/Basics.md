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

## Applying a FURN theme

Below are the steps outlining how to use FURN's theming system.

### ThemeProvider

The available theme is defined by the `ThemeProvider`. It takes in a `ThemeReference` as a value.

A `ThemeReference` is a class that creates a theme based on either another `Theme` or a parent `ThemeReference`. You can learn more about `ThemeReference` [here](https://github.com/microsoft/fluentui-react-native/blob/master/packages/framework/theme/README.md). We have a built in `ThemeReference` which you can access by calling `createDefaultTheme()`

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

For more information about customizing themes, take a look at [Custom Themes](./CustomTheme.md). For information about our default themes, take a look at [Default Themes](./DefaultThemes.md).

### Accessing theme properties

You can use the `useTheme()` hook to get the current theme inside a component.

```tsx
import { useTheme } from '@fluentui-react-native/framework';

export const Component = () => {
  const theme = useTheme();

  return <Text color={theme.colors.bodyText}>Hello World!</Text>;
};
```

The component will rerender if the theme is invalidated.

If you'd prefer to put the component's styles into a `StyleSheet` instead of accessing the `theme` directly, you can use [themed `StyleSheets`](./ThemedStylesheet.md)
