import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { RadioGroupTokens } from './RadioGroup.types';

export const defaultRadioGroupTokens: TokenSettings<RadioGroupTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.menuItemText,
    variant: 'subtitle2Strong',
    requiredColor: t.colors.redForeground3,
    requiredPadding: globalTokens.size40,
    flexDirection: 'column',
    disabled: {
      color: t.colors.neutralForegroundDisabled,
    },
    isHorizontal: {
      flexDirection: 'row',
    },
  }) as RadioGroupTokens;
