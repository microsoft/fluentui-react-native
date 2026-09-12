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

### Scene roots with Flex themes

`ThemedRoot` from `@fluentui-react-native/design` (also available from
`@fluentui-react-native/design/theming`) is a `View` with the theme and appearance
options of `ThemeProvider`. It forwards View props, children, and the native View
ref without adding layout or background styles.

```tsx
import { ThemedRoot } from '@fluentui-react-native/design';

export const App = () => (
  <ThemedRoot style={{ flex: 1 }}>
    <AppContent />
    <ThemedRoot appearance={{ colorScheme: 'dark', interfaceLevel: 'elevated' }}>
      <OverlayContent />
    </ThemedRoot>
  </ThemedRoot>
);
```

An omitted `theme` inherits the nearest theme boundary, including an existing
`ThemeProvider`. Without a boundary it uses a default `FlexThemeReference`.
That default supplies the existing baseline Flex tokens; use an appearance-aware
theme recipe when colors should vary with the resolved appearance.
Nested roots can override individual `appearance` fields, `appearanceSource`,
or `fallbackAppearance` while retaining the inherited source and other options.
An explicit `theme` starts a new theme/appearance configuration, using that
source's defaults plus the root's options.

The outermost `ThemedRoot` also provides `RootContext`. `useRootContext()` returns
the same object throughout a mounted scene, including under nested roots that
replace the theme. Its read-only `inputModality` is initially `'pointer'`, becomes
`'keyboard'` on key-down, and returns to `'pointer'` on pointer-down or touch-start.
Read the property in an event handler when making a focus decision:

```tsx
import { useRootContext } from '@fluentui-react-native/design';

const root = useRootContext();
const onFocus = () => {
  const showKeyboardFocus = root.inputModality === 'keyboard';
  // Apply the focus behavior appropriate to this component.
};
```

Modality changes do not notify React or rerender consumers; do not destructure
the property during render if it needs to remain current in an event handler.
Theme and appearance changes remain reactive. The hook throws outside a
`ThemedRoot`; independent scenes maintain independent modality state.

Only the outermost root installs tracking handlers. Keyboard and pointer capture
handlers observe descendant input before bubbling handlers, and responder
capture provides a touch fallback without claiming the responder by default.
Caller handlers still run after tracking, and caller responder return values are
preserved. Keyboard tracking requires a platform that emits View key events
(macOS, Windows, Win32, or web); this component does not add native hardware-key
support to iOS or Android. Native windows or portals whose events do not reach
the scene root need their own scene boundary.

### Populating the Theme

The theme is made available by the `ThemeProvider`. It takes in a `ThemeReference` as a value, which is the object created by the functions referenced in the pages above.

```tsx
import { ThemeProvider } from '@fluentui-react-native/design/theming';
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
