import { Appearance, NativeEventEmitter } from 'react-native';

import { NativeAppearanceAdditions } from '@fluentui-react-native/experimental-appearance-additions';
import { ThemeReference } from '@fluentui-react-native/theme';
import type { PartialTheme, Theme } from '@fluentui-react-native/theme-types';

import { getBaseAppleThemeIOS } from './appleTheme.ios';
import { defaultButtonTheme } from './components/Button/ButtonTheme';

export function createAppleTheme(): ThemeReference {
  const appleThemeReference = new ThemeReference<Theme, PartialTheme>(
    {} as Theme,
    () => {
      const isLightMode = Appearance.getColorScheme() === 'light';
      const isElevated = NativeAppearanceAdditions.userInterfaceLevel() === 'elevated';
      return getBaseAppleThemeIOS(isLightMode, isElevated);
    },
    defaultButtonTheme,
  );

  Appearance.addChangeListener(() => {
    appleThemeReference.invalidate();
  });

  const eventEmitter = new NativeEventEmitter(NativeAppearanceAdditions);
  eventEmitter.addListener('appearanceChanged', (_newTraits) => {
    appleThemeReference.invalidate();
  });

  return appleThemeReference;
}
