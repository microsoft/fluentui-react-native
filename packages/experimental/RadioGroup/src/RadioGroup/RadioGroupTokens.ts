import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { RadioGroupTokens } from './RadioGroup.types';

export const defaultRadioGroupTokens: TokenSettings<RadioGroupTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.menuItemText,
    variant: 'subtitle2Strong',
    disabled: {
      color: t.colors.neutralForegroundDisabled,
      fontFamily: 'Segoe UI',
      fontSize: 16,
      fontWeight: '600',
    },
  } as RadioGroupTokens);
