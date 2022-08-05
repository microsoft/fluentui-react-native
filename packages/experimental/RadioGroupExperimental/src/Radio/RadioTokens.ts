import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    // backgroundColor: t.colors.neutralBackground1,
    disabled: {
      backgroundColor: t.colors.neutralBackgroundDisabled,
      thumbColor: t.colors.neutralStrokeDisabled,
      borderColor: t.colors.neutralForegroundDisabled,
    },
  } as RadioTokens);
