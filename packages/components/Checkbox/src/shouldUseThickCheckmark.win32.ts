import type { Theme } from '@fluentui-react-native/framework';
import { isHighContrast } from '@fluentui-react-native/theming-utils';

export function shouldUseThickCheckmark(theme: Theme): boolean {
  if (isHighContrast(theme)) {
    return true;
  }

  return false;
}
