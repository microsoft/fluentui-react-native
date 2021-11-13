import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonCoreTokens } from '../Button.types';

export const defaultFabButtonTokens: TokenSettings<ButtonCoreTokens, Theme> = () =>
  ({
    borderRadius: globalTokens.corner.radius.circle,
    minHeight: 56,
    minWidth: 56,
    padding: globalTokens.spacing.l,
    hasContent: {
      hasIcon: {
        spacingIconContent: globalTokens.spacing.mNudge,
      },
    },
  } as ButtonCoreTokens);
