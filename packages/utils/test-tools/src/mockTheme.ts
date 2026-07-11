// This module is a compatibility shim. `mockTheme` now lives in the
// `@fluentui-react-native/design` package and is exposed via its `/testing`
// submodule. This re-export preserves the existing `@fluentui-react-native/test-tools`
// entry point.
export { mockTheme } from '@fluentui-react-native/design/testing';
