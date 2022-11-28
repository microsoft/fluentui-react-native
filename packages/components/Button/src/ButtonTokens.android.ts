import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = () =>
  ({
    focused: {
      borderWidth: globalTokens.stroke.width20,
      borderInnerWidth: globalTokens.stroke.width10,
    },
    subtle: {
      focused: {
        borderWidth: globalTokens.stroke.width20,
        borderInnerWidth: globalTokens.stroke.width10,
      },
    },
    outline: {
      borderWidth: globalTokens.stroke.width10,
      disabled: {
        borderWidth: globalTokens.stroke.width10,
      },
      pressed: {
        borderWidth: globalTokens.stroke.width10,
      },
      focused: {
        borderWidth: globalTokens.stroke.width20,
        borderInnerWidth: globalTokens.stroke.width10,
      },
    },
    block: {
      width: '100%',
    },
    large: {
      paddingHorizontal: globalTokens.spacing.l,
      paddingVertical: globalTokens.spacing.s,
      borderRadius: globalTokens.corner.radius60,
      iconSize: 20,
      outline: {
        borderWidth: globalTokens.stroke.width10,
        iconSize: 20,
      },
      spacingIconContentBefore: globalTokens.spacing.xs,
      spacingIconContentAfter: globalTokens.spacing.xs,
      minHeight: 36,
      minWidth: 36,
    },
    medium: {
      paddingHorizontal: globalTokens.spacing.s,
      paddingVertical: globalTokens.spacing.xs,
      borderRadius: globalTokens.corner.radius40,
      iconSize: 20,
      outline: {
        borderWidth: globalTokens.stroke.width10,
        iconSize: 20,
      },
      spacingIconContentBefore: globalTokens.spacing.xs,
      spacingIconContentAfter: globalTokens.spacing.xs,
      minHeight: 36,
      minWidth: 36,
    },
    small: {
      paddingHorizontal: globalTokens.spacing.xs,
      paddingVertical: globalTokens.spacing.xxs,
      borderRadius: globalTokens.corner.radius40,
      iconSize: 16,
      outline: {
        borderWidth: globalTokens.stroke.width10,
        iconSize: 16,
      },
      spacingIconContentBefore: globalTokens.spacing.xxs,
      spacingIconContentAfter: globalTokens.spacing.xxs,
      minHeight: 28,
      minWidth: 28,
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
