// This package is a compatibility shim. Theme appearance utilities now live in
// the `@fluentui-react-native/design/theming` submodule, and the deprecated
// token-pipeline mappers live in `@fluentui-react-native/design/deprecated`.
// These explicit re-exports preserve the existing package entry point.
export { getCurrentAppearance, isHighContrast, setIsHighContrast } from '@fluentui-react-native/design/theming';
export { mapFontPipelineToTheme, mapPipelineToShadow, mapPipelineToTheme } from '@fluentui-react-native/design/deprecated';
