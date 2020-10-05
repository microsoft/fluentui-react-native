# @fluentui-react-native/theme

Code support for working with the themes defined in `@fluentui-react-native/theme-types`. This includes a `ThemeReference` class and a `ThemeProvider` implementation that works with the references.

## `ThemeReference`

A class that constructs a `Theme` based upon a either another fully built `Theme` or a parent `ThemeReference`, then layers in `PartialTheme` fragments, or `ThemeTransform` functions. It then provides the ability to invalidate, the ability to update the fragments, and the ability to listen to changes for the theme.

### Creating a `ThemeReference`

A reference is created by combination a base with zero or more recipes.

- **Base** - either a `Theme` or another `ThemeReference`
- **Recipe** - either a `PartialTheme` or a function of the form `(parent: Theme) => PartialTheme`

The `ThemeReference` supports the following methods:

- **`theme`** - get the built theme, implemented as a getter to dynamically create it when queried
- **`invalidate()`** - let the reference know something has changed, this will replay the recipies to generate a new theme
- **`update(...recipes)`** - update the recipes used to build the theme, will also invalidate the reference
- **`addOnThemeChanged(listener)`** - add a listener to be notified of theme changes
- **`removeOnThemeChanged(listener)`** - remove the listener

In practice this can be used to implement a theme, that has some values coming from external calls (maybe to a native module), and rebuilds itself when those values change. This might look something like:

```ts
import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import { ThemeReference } from '@fluentui-react-native/theme';

// in this case wrapping the reference in a function makes it easy to encapsulate the invalidating
export const createMyCustomTheme = () => {
  // create the reference
  const themeRef = new ThemeReference(
    // base it on the default fluent theme
    defaultFluentTheme,
    // mix in some constant values to override
    {
      colors: {
        // stuff here
      },
    },
    // make some outside calls to get some values
    () => {
      // query a body background from somewhere else
      const bodyBackground = checkSomeOutsideValue();
      return {
        colors: {
          bodyBackground,
        },
      };
    },
  );
  // register a change handler that invalidates the reference
  listenForOutsideValueChange(() => {
    themeRef.invalidate();
  });
  return themeRef;
};
```

## `ThemeProvider`

This is a standard context provider that takes theme references as inputs for the theme prop.
