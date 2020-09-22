import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import { getThemingModule } from './getThemingModule';
import { CxxException, PlatformDefaultsChangedArgs } from './officeThemingModule';
import { OfficePalette } from '@fluentui-react-native/theme-types';
import { createPartialOfficeTheme } from './createPartialOfficeTheme';

function handlePaletteCall(palette: OfficePalette | CxxException): OfficePalette | undefined {
  return (palette as CxxException).message !== undefined ? undefined : (palette as OfficePalette);
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
export function createOfficeTheme(paletteName?: string): ThemeReference {
  const [module, emitter] = getThemingModule();
  const ref = { module, emitter, defaultPalette: module.initialHostThemeSetting || '' };

  const themeRef = new ThemeReference(defaultFluentTheme, () => {
    const name = paletteName || ref.defaultPalette;
    const palette = handlePaletteCall(ref.module.getPalette(name));
    return createPartialOfficeTheme(module, palette);
  });

  // set up the callback for theme changes on the native side
  const onPlatformDefaultsChanged = (args: PlatformDefaultsChangedArgs) => {
    ref.defaultPalette = (args && args.hostThemeSetting) || ref.defaultPalette;
    themeRef.invalidate();
  };
  emitter.addListener('onPlatformDefaultsChanged', onPlatformDefaultsChanged);

  // now return the theme reference
  return themeRef;
}
