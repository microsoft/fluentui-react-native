import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { RadioGroupTokens } from './RadioGroup.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultRadioGroupTokens: TokenSettings<RadioGroupTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.menuItemText,
    variant: 'subtitle2Strong',
    disabled: {
      color: t.colors.neutralForegroundDisabled,
      fontFamily: globalTokens.font.family.default,
      fontSize: globalTokens.font.size[400],
      fontWeight: globalTokens.font.weight.semibold,
    },
  } as RadioGroupTokens);
