---
"@fluentui-react-native/design": minor
"@fluentui-react-native/theme-types": patch
"@fluentui-react-native/android-theme": patch
"@fluentui-react-native/apple-theme": patch
"@fluentui-react-native/badge": patch
"@fluentui-react-native/button": patch
"@fluentui-react-native/default-theme": patch
"@fluentui-react-native/experimental-shadow": patch
"@fluentui-react-native/framework": patch
"@fluentui-react-native/notification": patch
"@fluentui-react-native/theme": patch
"@fluentui-react-native/theme-tokens": patch
"@fluentui-react-native/theming-utils": patch
"@fluentui-react-native/tokens": patch
"@fluentui-react-native/win32-theme": patch
"@uifabricshared/foundation-compose": patch
"@uifabricshared/theming-ramp": patch
---

Move theme type definitions into the `@fluentui-react-native/design` package under the new `@fluentui-react-native/design/theming` submodule export. The `@fluentui-react-native/theme-types` package is now a thin compatibility shim that re-exports from `@fluentui-react-native/design/theming`, and all in-repo consumers now reference the new submodule.
