import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    block: {
      width: '100%',
    },
    medium: {
      padding: globalTokens.size80 - globalTokens.stroke.width10,
      borderWidth: globalTokens.stroke.width10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.size80,
      },
      hasContent: {
        minWidth: 96,
        padding: globalTokens.size60 - globalTokens.stroke.width10,
        paddingHorizontal: globalTokens.size120 - globalTokens.stroke.width10,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.size80,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.size80,
        },
        focused: {
          padding: globalTokens.size60,
          paddingHorizontal: globalTokens.size120,
        },
      },
    },
    small: {
      padding: globalTokens.size40 - globalTokens.stroke.width10,
      borderWidth: globalTokens.stroke.width10,
      iconSize: 16,
      focused: {
        borderWidth: 0,
        padding: globalTokens.size40,
      },
      hasContent: {
        minWidth: 64,
        minHeight: 32,
        paddingHorizontal: globalTokens.size80 - globalTokens.stroke.width10,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.size40,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.size40,
        },
        focused: {
          paddingHorizontal: globalTokens.size80,
        },
      },
    },
    large: {
      padding: globalTokens.size100 - globalTokens.stroke.width10,
      borderWidth: globalTokens.stroke.width10,
      iconSize: 20,
      focused: {
        borderWidth: 0,
        padding: globalTokens.size100,
      },
      hasContent: {
        minWidth: 96,
        minHeight: 40,
        padding: globalTokens.size80 - globalTokens.stroke.width10,
        paddingHorizontal: globalTokens.size160 - globalTokens.stroke.width10,
        hasIconAfter: {
          spacingIconContentAfter: globalTokens.size60,
        },
        hasIconBefore: {
          spacingIconContentBefore: globalTokens.size60,
        },
        focused: {
          padding: globalTokens.size80,
          paddingHorizontal: globalTokens.size160,
        },
      },
    },
    rounded: {
      borderRadius: globalTokens.corner.radius40,
    },
    circular: {
      borderRadius: globalTokens.corner.radiusCircular,
    },
    square: {
      borderRadius: globalTokens.corner.radiusNone,
    },
  } as ButtonTokens);
