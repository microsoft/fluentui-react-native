# Theme-types

This package is a compatibility shim. The theme type definitions now live in `@fluentui-react-native/design` and are exposed via its `@fluentui-react-native/design/theming` submodule. This package re-exports them so the existing `@fluentui-react-native/theme-types` entry point keeps working; new code should import from `@fluentui-react-native/design/theming`.
