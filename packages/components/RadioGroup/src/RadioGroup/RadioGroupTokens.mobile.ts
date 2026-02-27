import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { RadioGroupTokens } from './RadioGroup.types';

export const defaultRadioGroupTokens: TokenSettings<RadioGroupTokens, Theme> = (t: Theme) =>
  ({
    // Tokens taken from Android Popover
    color: t.colors.neutralForeground1,
    variant: 'body1Strong',
    requiredColor: globalTokens.color.darkRed.primary,
    requiredPadding: globalTokens.size20,
    flexDirection: 'column',
    disabled: {
      color: t.colors.neutralForegroundDisabled1,
    },
    isHorizontal: {
      flexDirection: 'row',
    },
  }) as RadioGroupTokens;
