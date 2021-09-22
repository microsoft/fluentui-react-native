import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';

export const defaultButtonSpacingTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    fluid: {
      width: '100%',
    },
    fab: {
      borderRadius: 100, // big number for always rounded corners
      // For large size
      minHeight: 56,
      minWidth: 56,
    },
    medium: {
      minHeight: 32,
      minWidth: 96,
      borderWidth: globalTokens.stroke.width.thin,
      borderRadius: globalTokens.corner.radius.medium,
    },
    small: {
      minHeight: 24,
      minWidth: 64,
      borderWidth: globalTokens.stroke.width.thin,
      borderRadius: globalTokens.corner.radius.small,
    },
  } as ButtonTokens);
