import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { FABTokens } from './FAB.types';

export const defaultFABTokens: TokenSettings<FABTokens, Theme> = (t: Theme) =>
  ({
    borderRadius: globalTokens.corner.radiusCircular,
    iconSize: 24,
    minHeight: 56,
    minWidth: 56,
    padding: globalTokens.size200,
    hasContent: {
      spacingIconContentBefore: globalTokens.size80,
    },
    shadowToken: t.shadows.shadow8,
  } as FABTokens);
