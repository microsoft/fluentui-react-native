# Theming

## What is a theme in FURN?

In FURN, a theme can affect things like typography and spacing, in addition to colors.

Components that are provided by FURN take advantage of the set theme and change their appearance if the theme changes.
A FURN theme can also be applied to other components or scenarios, if you want to build your own components using FURN's frameworks or just want to use the theming system by itself.
FURN has default themes, but also allows for users to customize them in various ways.

The theming system in FURN runs on top of [the Context concept from React](https://reactjs.org/docs/context.html).

## When to use FURN theming

The FURN themes follow the Fluent design system, so if you're using the Fluent design system on to build UI on native platforms, then using a FURN theme is an easy way to achieve that goal. The theming system provides an easy way to access the values from Fluent design system.

If you're using FURN components, a benefit of using a theme is that FURN components are built to take advantage of it. Although we do have a built-in default theme, our components work best a theme is provided.

If you're using FURN inside of an Office host, the theme on the Windows desktop platform will also have access to palettes from Office.

## Applying a FURN theme

Below are the steps outlining how to use FURN's theming system.

### ThemeProvider

The available theme is defined by the ThemeProvider. It takes in a ThemeReference.

```tsx
import { ThemeProvider } from '@fluentui-react-native/theme';
```

### Accessing theme properties

In a component that has a FURN theme available, you can use the `useTheme()` hook to get the current value of the theme.

```tsx
```

### Using ThemeRegistry (Deprecated)

// TODO
