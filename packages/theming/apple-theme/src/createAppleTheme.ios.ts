import { Appearance, NativeEventEmitter } from 'react-native';

import { NativeAppearanceAdditions } from '@fluentui-react-native/experimental-appearance-additions';
import { createThemeAppearanceSource, ThemeReference } from '@fluentui-react-native/design/theming';
import type { Theme } from '@fluentui-react-native/design/theming';

import { getBaseAppleThemeIOS } from './appleTheme.ios';

export function createAppleTheme(): ThemeReference {
  const appearanceSource = createThemeAppearanceSource(
    () => ({
      colorScheme: Appearance.getColorScheme(),
      interfaceLevel: NativeAppearanceAdditions.userInterfaceLevel() === 'elevated' ? 'elevated' : 'base',
    }),
    (listener) => {
      const appearanceSubscription = Appearance.addChangeListener(listener);
      const eventEmitter = new NativeEventEmitter(NativeAppearanceAdditions);
      const interfaceLevelSubscription = eventEmitter.addListener('appearanceChanged', listener);
      return () => {
        appearanceSubscription.remove();
        interfaceLevelSubscription.remove();
      };
    },
  );
  return new ThemeReference({
    base: {} as Theme,
    appearance: {
      colorScheme: 'system',
      contrast: 'system',
      interfaceLevel: 'system',
    },
    appearanceSource,
    recipes: [
      (_theme, appearance) => {
        const isLightMode = appearance ? appearance.colorScheme === 'light' : Appearance.getColorScheme() === 'light';
        const isElevated = appearance
          ? appearance.interfaceLevel === 'elevated'
          : NativeAppearanceAdditions.userInterfaceLevel() === 'elevated';
        return getBaseAppleThemeIOS(isLightMode, isElevated);
      },
    ],
  });
}
