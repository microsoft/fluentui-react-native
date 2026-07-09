import type { Theme } from '@fluentui-react-native/framework';
import { colorDarkRedPrimary, size20 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { RadioGroupTokens } from './RadioGroup.types';

export const defaultRadioGroupTokens: TokenSettings<RadioGroupTokens, Theme> = (t: Theme) =>
  ({
    // Tokens taken from Android Popover
    color: t.colors.neutralForeground1,
    variant: 'body1Strong',
    requiredColor: colorDarkRedPrimary,
    requiredPadding: size20,
    flexDirection: 'column',
    disabled: {
      color: t.colors.neutralForegroundDisabled1,
    },
    isHorizontal: {
      flexDirection: 'row',
    },
  }) as RadioGroupTokens;
