# Moving from old to new `ThemeProvider`

We have a deprecated ThemeProvider which takes in a `ThemeRegistry`. The new ThemeProvider takes in the `ThemeReference`. This page provides guidance on how to move from the deprecated to the newer system.

## `ThemeRegistry` to `ThemeReference`

The new `ThemeProvider` takes in a different object as its value, a `ThemeReference`, so you'll need to convert your `ThemeRegistry` into a `ThemeReference` in order to use the new `ThemeProvider`.

If you were using `createPlatformThemeRegistry(<paletteName>)` to create your `ThemeRegistry`, you can get an equivalent `ThemeReference` by calling `createOfficeTheme({ paletteName: <paletteName> })` instead. Details on `createOfficeTheme` can be found [here](https://github.com/microsoft/fluentui-react-native/blob/master/docs/pages/Theming/DefaultThemes.md#integration-with-office).

The gist is that what used to be the `ProcessTheme` function passed into the `ThemeRegistry`'s `setTheme` can now be turned into a `ThemeRecipe` passed into the `ThemeReference`. So where a `ThemeRegistry` might have had:

```ts
import { createThemeRegistry, Theme, PartialTheme, resolvePartialTheme } from '@uifabricshared/theming-react-native';

const registry = createThemeRegistry(baseTheme, resolvePartialTheme);
registry.setTheme((parentTheme: Theme) => {
  return { colors: { background: theme.colors.themeDarker } };
});
```

the `ThemeReference` would have:

```ts
import { ThemeReference } from '@fluentui-react-native/theme';
import { Theme, PartialTheme } from '@fluentui-react-native/framework';

const themeRef = new ThemeReference(
  baseTheme,
  (parentTheme: Theme): PartialTheme => {
    return { colors: { background: theme.colors.themeDarker } };
  }, // no resolver needed, automatically deeply merged into baseTheme
);
```

`ThemeReferences` can also take advantage of our [default themes](https://github.com/microsoft/fluentui-react-native/blob/master/docs/pages/Theming/DefaultThemes.md). Learn how to create custom themes [here](https://github.com/microsoft/fluentui-react-native/blob/master/docs/pages/Theming/CustomTheme.md).

## Importing `ThemeProvider` from the new package

The new `ThemeProvider` resides in a different package and takes in the `ThemeReference` instead. You'll want to change which package you import the `ThemeProvider` from, and then take the theme you converted and pass it into the new `ThemeProvider`:

```ts
import { ThemeProvider } from @uifabricshared/theming-react-native;

const App = () => {
  const themeRegistry = getThemeRegistry();

  return (
    <ThemeProvider registry={themeRegistry}>
      <AppContent />
    </ThemeProvider>
  )
}
```

to

```ts
import { ThemeProvider } from @fluentui-react-native/theme;

const App = () => {
  const themeRef = getThemeReference();

  return (
    <ThemeProvider theme={themeRef}>
      <AppContent />
    </ThemeProvider>
  )
}
```

## Accessing the theme in components

The new ThemeProvider uses the same context as the old one, so accessing the theme still uses the same `useTheme()` hook - no functional change is needed to access the theme with the new `ThemeProvider`. The only change you'll want to make is to import `useTheme()` from the newer package:

```ts
import { useTheme } from @uifabricshared/theming-react-native;
```

to

```ts
import { useTheme } from @fluentui-react-native/framework;
```
