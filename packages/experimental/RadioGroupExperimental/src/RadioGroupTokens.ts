import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { RadioGroupExperimentalTokens } from './RadioGroup.types';

export const defaultRadioGroupExperimentalTokens: TokenSettings<RadioGroupExperimentalTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.ghostBackground,
    color: t.colors.brandBackground,
    borderColor: t.colors.brandBackground,
    small: {
      borderWidth: 1,
      padding: 10,
      borderRadius: 2,
    },
    medium: {
      borderWidth: 2,
      borderRadius: 4,
      padding: 20,
    },
    large: {
      borderWidth: 4,
      borderRadius: 6,
      padding: 30,
    },
  } as RadioGroupExperimentalTokens);
