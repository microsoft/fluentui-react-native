import { Theme } from '@fluentui-react-native/framework';

export function shouldUseThickCheckmark(theme: Theme): boolean {
  if (theme.name === 'HighContrast') {
    return true;
  }

  return false;
}
