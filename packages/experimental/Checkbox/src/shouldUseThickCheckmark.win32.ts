import { Theme } from '@fluentui-react-native/theme-types';

export function shouldUseThickCheckmark(theme: Theme): boolean {
  if (theme.name === 'HighContrast') {
    return true;
  }

  return false;
}
