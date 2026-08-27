// This package is a compatibility shim. The theme framework (ThemeProvider,
// ThemeReference, and related types) now lives in the `@fluentui-react-native/design`
// package and is exposed via its `/theming` submodule. These re-exports preserve the
// existing `@fluentui-react-native/theme` entry point.
export { ThemeProvider } from '@fluentui-react-native/design/theming';
export type { ThemeProviderProps } from '@fluentui-react-native/design/theming';
export { ThemeReference } from '@fluentui-react-native/design/theming';
export type { OnThemeChange, ThemeRecipe, ThemeTransform } from '@fluentui-react-native/design/theming';
