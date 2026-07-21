import { Appearance } from 'react-native';

import { getCurrentAppearance, setIsHighContrast, ThemeReference } from '@fluentui-react-native/design/theming';
import type { Theme } from '@fluentui-react-native/design/theming';
import { AccessibilityInfo } from 'react-native-macos';

import { getBaseAppleThemeMacOS } from './appleTheme.macos';

let appleThemeReference: ThemeReference;

export function createAppleTheme(): ThemeReference {
  appleThemeReference = new ThemeReference({} as Theme, () => {
    const appearance = Appearance.getColorScheme();
    const mode = getCurrentAppearance(appearance, 'light');
    return getBaseAppleThemeMacOS(mode);
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
    setIsHighContrast(isEnabled);
    appleThemeReference.invalidate();
  });
}
