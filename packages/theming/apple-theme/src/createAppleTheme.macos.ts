import { ThemeReference } from '@fluentui-react-native/theme';
import { Theme } from '@fluentui-react-native/theme-types';
import { Appearance } from 'react-native';
import { getBaseAppleThemeMacOS } from './appleTheme.macos';
import { AccessibilityInfo } from 'react-native-macos';

export let isHighContrastMode: boolean;
let appleThemeReference: ThemeReference;

export function createAppleTheme(): ThemeReference {
  appleThemeReference = new ThemeReference({} as Theme, () => {
    return getBaseAppleThemeMacOS();
  });
  // Fetch initial system settings for high contrast mode
  highContrastHandler();
  // Invalidate theme and set prop when high contrast setting changes
  AccessibilityInfo.addEventListener('highContrastChanged', () => {
    highContrastHandler();
  });

  Appearance.addChangeListener(() => {
    appleThemeReference.invalidate();
  });
  return appleThemeReference;
}

function highContrastHandler() {
  AccessibilityInfo.isHighContrastEnabled().then((isEnabled) => {
    appleThemeReference.invalidate();
    isHighContrastMode = isEnabled;
  });
}
