import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { RadioGroupTokens } from './RadioGroup.types';
// import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultRadioGroupTokens: TokenSettings<RadioGroupTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.menuItemText,
    // fontFamily: t.typography.families.primary,
    // fontSize: globalTokens.font.size[400],
    // fontWeight: globalTokens.font.weight.semibold,
    // variant: t.typography.variants.subtitle2,
  } as RadioGroupTokens);
