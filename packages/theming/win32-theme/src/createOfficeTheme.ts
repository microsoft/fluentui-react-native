import { ThemeReference } from '@fluentui-react-native/theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import { getThemingModule } from './NativeModule/getThemingModule';
import { CxxException, PlatformDefaultsChangedArgs } from './NativeModule/officeThemingModule';
import { OfficePalette, Theme, ThemeOptions } from '@fluentui-react-native/theme-types';
import { createPartialOfficeTheme } from './createPartialOfficeTheme';
import { createBrandedThemeWithAlias } from './createBrandedThemeWithAlias';
import { createAliasTokens, getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { createAliasesFromPalette } from './createAliasesFromPalette';

function handlePaletteCall(palette: OfficePalette | CxxException): OfficePalette | undefined {
  const exception = palette as CxxException;
  return exception && exception.message !== undefined ? undefined : (palette as OfficePalette);
}

/**
 * create a theme reference for an Office win32 theme. This will be based upon the standard
 * fluent defaults but will attempt to use the theming native module to get information about
 * the office palette.
 *
 * This theme will also listen for native changes and reload itself when things change on the native side of things
 *
 * @param paletteName - optional specifier for the currently active office palette
 */
export function createOfficeTheme(options: ThemeOptions = {}): ThemeReference {
  const [module, emitter] = getThemingModule();
  const ref = { module, emitter, themeName: module.initialHostThemeSetting || '' };
  const { paletteName } = options;

  const themeRef = new ThemeReference(
    createDefaultTheme(options),
    () => {
      const name = paletteName || '';
      const palette = handlePaletteCall(ref.module.getPalette(name));
      return createPartialOfficeTheme(module, ref.themeName, palette);
    },
    (theme: Theme) => {
      return { colors: { ...createAliasTokens(getCurrentAppearance(theme.host.appearance, 'light')) } };
    },
    (theme: Theme) => {
      return createBrandedThemeWithAlias(theme);
    },
    (theme: Theme) => {
      if (!theme.host.palette) {
        return {};
      }

      return { colors: createAliasesFromPalette(theme.host.palette) };
    },
  );

  // set up the callback for theme changes on the native side
  const onPlatformDefaultsChanged = (args: PlatformDefaultsChangedArgs) => {
    ref.themeName = (args && args.hostThemeSetting) || ref.themeName;
    themeRef.invalidate();
  };
  emitter && emitter.addListener('onPlatformDefaultsChanged', onPlatformDefaultsChanged);

  // now return the theme reference
  return themeRef;
}
