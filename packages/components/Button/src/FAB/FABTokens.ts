import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonCoreTokens } from '../Button.types';

export const defaultFABTokens: TokenSettings<ButtonCoreTokens, Theme> = () =>
  ({
    borderRadius: globalTokens.corner.radius.circle,
    minHeight: 56,
    minWidth: 56,
    padding: globalTokens.spacing.l,
    hasContent: {
      hasIconBefore: {
        spacingIconContentBefore: globalTokens.spacing.mNudge,
      },
    },
    shadowDepth: 'shadow8', //TODO: refactor shadows so we can pass in t.shadows.shadow8 here instead
  } as ButtonCoreTokens);
