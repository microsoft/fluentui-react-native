// This package is a compatibility shim. Theme appearance and token-pipeline
// utilities now live in the `@fluentui-react-native/design/theming` submodule.
// These explicit re-exports preserve the existing package entry point.
export {
  getCurrentAppearance,
  isHighContrast,
  mapFontPipelineToTheme,
  mapPipelineToShadow,
  mapPipelineToTheme,
  setIsHighContrast,
} from '@fluentui-react-native/design/theming';
