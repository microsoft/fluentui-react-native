import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import {
  appearanceOptionFromResolved,
  appearanceOptionsFromLegacy,
  createThemeAppearanceSource,
  ThemeReference,
} from '@fluentui-react-native/design/theming';
import type {
  OfficePalette,
  Theme,
  ThemeAppearanceSource,
  ThemeAppearanceSourceSnapshot,
  ThemeOptions,
} from '@fluentui-react-native/design/theming';

import { createAliasesFromPalette } from './createAliasesFromPalette';
import { createBrandedThemeWithAlias } from './createBrandedThemeWithAlias';
import { createOfficeColorAliasTokens, createOfficeShadowAliasTokens } from './createOfficeAliasTokens';
import { createPartialOfficeTheme } from './createPartialOfficeTheme';
import { win32Typography } from './getThemeTypography';
import { getThemingModule } from './NativeModule/getThemingModule';
import { getCurrentHostThemeState, setCurrentHostThemeState } from './NativeModule/hostThemeSetting';
import type { CxxException, PlatformDefaultsChangedArgs } from './NativeModule/officeThemingModule';

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
  const currentHostState = getCurrentHostThemeState();
  const ref = { module, emitter, themeName: currentHostState.hostThemeSetting || '' };
  const { paletteName } = options;
  const constants = module.getConstants();
  let colorScheme = currentHostState.hostThemeSetting ? currentHostState.colorScheme : constants.initialColorScheme;
  let isHighContrast = currentHostState.hostThemeSetting ? currentHostState.isHighContrast : constants.initialIsHighContrast;
  const themeRefHolder: { current?: ThemeReference } = {};
  const updateOfficeState = (
    themeName: string | undefined,
    nextColorScheme: ThemeAppearanceSourceSnapshot['colorScheme'],
    nextIsHighContrast: boolean | undefined,
  ) => {
    const nextThemeName = themeName || ref.themeName;
    const changed = nextThemeName !== ref.themeName || nextColorScheme !== colorScheme || nextIsHighContrast !== isHighContrast;
    ref.themeName = nextThemeName;
    colorScheme = nextColorScheme;
    isHighContrast = nextIsHighContrast;
    setCurrentHostThemeState({
      hostThemeSetting: ref.themeName,
      colorScheme,
      isHighContrast,
    });
    return changed;
  };
  const appearanceSource: ThemeAppearanceSource = createThemeAppearanceSource(
    () => getOfficeAppearance(ref.themeName, colorScheme, isHighContrast),
    emitter
      ? (listener) => {
          const subscription = emitter.addListener('onPlatformDefaultsChanged', (args: PlatformDefaultsChangedArgs) => {
            updateOfficeState(args?.hostThemeSetting, args?.colorScheme, args?.isHighContrast);
            themeRefHolder.current?.invalidate();
            listener();
          });
          const currentState = getCurrentHostThemeState();
          if (updateOfficeState(currentState.hostThemeSetting, currentState.colorScheme, currentState.isHighContrast)) {
            themeRefHolder.current?.invalidate();
          }
          listener();
          return () => subscription.remove();
        }
      : undefined,
  );

  const themeRef = new ThemeReference({
    base: createDefaultTheme(options),
    getAppearance: () =>
      options.appearance
        ? appearanceOptionsFromLegacy(options.appearance)
        : { colorScheme: 'system', contrast: 'system', interfaceLevel: 'base' },
    appearanceSource,
    alwaysSubscribeToAppearanceSource: true,
    recipes: [
      () => {
        const name = paletteName || 'WhiteColors';
        const palette = handlePaletteCall(ref.module.getPalette(name));
        return createPartialOfficeTheme(module, ref.themeName, palette);
      },
      () => {
        if (!ref.themeName || ref.themeName === '') {
          return {};
        }

        return {
          shadows: { ...createOfficeShadowAliasTokens(ref.themeName) },
          typography: win32Typography(),
        };
      },
      () => {
        if (!ref.themeName || ref.themeName === '') {
          return {};
        }

        return {
          colors: { ...createOfficeColorAliasTokens(ref.themeName) },
          typography: win32Typography(),
        };
      },
      (theme: Theme) => {
        return createBrandedThemeWithAlias(ref.themeName, theme);
      },
      (theme: Theme) => {
        if (!theme.host.palette) {
          return {};
        }

        return {
          ...(paletteName !== undefined && { colors: createAliasesFromPalette(theme.host.palette, ref.themeName === 'HighContrast') }),
          typography: win32Typography(),
        };
      },
      (_theme, appearance) => ({
        host: {
          appearance: appearance ? appearanceOptionFromResolved(appearance) : undefined,
        },
      }),
    ],
  });
  themeRefHolder.current = themeRef;

  return themeRef;
}

function getOfficeAppearance(
  themeName: string,
  colorScheme?: ThemeAppearanceSourceSnapshot['colorScheme'],
  isHighContrast?: boolean,
): ThemeAppearanceSourceSnapshot {
  if (colorScheme || isHighContrast !== undefined) {
    return {
      colorScheme,
      contrast: isHighContrast ? 'highContrast' : 'standard',
      interfaceLevel: 'base',
    };
  }

  switch (themeName) {
    case 'Black':
    case 'DarkGray':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' };
    case 'HighContrast':
      // Transitional until the native contract exposes scheme and contrast as
      // separate fields rather than one host-theme name.
      return { contrast: 'highContrast', interfaceLevel: 'base' };
    case 'Colorful':
    case 'White':
      return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
    default:
      return { interfaceLevel: 'base' };
  }
}
