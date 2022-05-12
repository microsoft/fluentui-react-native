export { createOfficeTheme } from './createOfficeTheme';
export { createPartialOfficeTheme } from './createPartialOfficeTheme';
export { fallbackGetPalette, fallbackOfficeModule, getThemingModule } from './NativeModule/index';
export type {
  CxxException,
  IEventEmitter,
  NativeColorNames,
  NativeColorRamps,
  OfficeThemingModule,
  PlatformDefaultsChangedArgs,
  PlatformDefaultsChangedCallback,
} from './NativeModule/index';
export { paletteFromOfficeColors } from './paletteFromOfficeColors';
export { createOfficeColorAliasTokens as createOfficeAliasTokens } from './createOfficeAliasTokens';
export { createBrandedThemeWithAlias, getCurrentBrandAliasTokens } from './createBrandedThemeWithAlias';
