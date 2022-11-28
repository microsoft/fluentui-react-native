import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { FABTokens } from './FAB.types';

export const defaultFABTokens: TokenSettings<FABTokens, Theme> = (t: Theme) =>
  ({
    elevation: t.shadows.shadow8.key.blur,
    disabled: {
      elevation: 0,
    },
    pressed: {
      elevation: t.shadows.shadow2.key.blur,
    },
    focused: {
      elevation: t.shadows.shadow2.key.blur,
      borderWidth: globalTokens.stroke.width20,
      borderInnerWidth: globalTokens.stroke.width10,
    },
    subtle: {
      elevation: t.shadows.shadow8.key.blur,
      disabled: {
        elevation: 0,
      },
      pressed: {
        elevation: t.shadows.shadow2.key.blur,
      },
      focused: {
        elevation: t.shadows.shadow2.key.blur,
        borderWidth: globalTokens.stroke.width20,
        borderInnerWidth: globalTokens.stroke.width10,
      },
    },
    large: {
      borderRadius: globalTokens.corner.radiusCircular,
      iconSize: 24,
      minHeight: 56,
      minWidth: 56,
      paddingHorizontal: globalTokens.spacing.m,
      paddingVertical: globalTokens.spacing.m,
      spacingIconContentBefore: 0,
      hasContent: {
        borderRadius: globalTokens.corner.radiusCircular,
        iconSize: 24,
        fontSize: t.typography.variants.body1Strong.size,
        fontFamily: t.typography.variants.body1Strong.face,
        fontWeight: t.typography.variants.body1Strong.weight,
        minHeight: 56,
        minWidth: 56,
        paddingStart: globalTokens.spacing.m,
        paddingEnd: globalTokens.spacing.l,
        paddingVertical: globalTokens.spacing.m,
        spacingIconContentBefore: globalTokens.spacing.xs,
      },
    },
    small: {
      borderRadius: globalTokens.corner.radiusCircular,
      iconSize: 20,
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: globalTokens.spacing.s,
      paddingVertical: globalTokens.spacing.s,
      spacingIconContentBefore: 0,
      hasContent: {
        borderRadius: globalTokens.corner.radiusCircular,
        iconSize: 20,
        fontSize: t.typography.variants.body2Strong.size,
        fontFamily: t.typography.variants.body2Strong.face,
        fontWeight: t.typography.variants.body2Strong.weight,
        minHeight: 44,
        minWidth: 44,
        paddingHorizontal: globalTokens.spacing.s,
        paddingStart: globalTokens.spacing.s,
        paddingEnd: globalTokens.spacing.m,
        spacingIconContentBefore: globalTokens.spacing.xs,
      },
    },
  } as FABTokens);
