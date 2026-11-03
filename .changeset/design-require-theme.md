---
'@fluentui-react-native/design': minor
'@fluentui-react-native/components': minor
---

Flex theme consumers now require a theme. `useThemeState` and `useThemeAppearance` throw when no `ThemeProvider`,
`ThemedRoot`, or legacy `ThemeContext` provider is above the caller instead of falling back to a default theme state,
and the default theme state is removed. Render components inside a `ThemedRoot` or `ThemeProvider`.

Add the `@fluentui-react-native/design/testing/theme` entry point with `TestThemeProvider` and `createThemeWrapper` for
tests that render Flex consumers. It is separate from `design/testing`, which stays free of `react-native`.

A legacy `ThemeReference` paired with `useThemeState` no longer bundles the x3 defaults and interaction algorithm, and
a component bundle that does not render `ThemedRoot` is about 17 KB raw smaller.
