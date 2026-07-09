import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadiusCircular,
  size120,
  size160,
  size200,
  size80,
  strokeWidth10,
  strokeWidth20,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { FABTokens } from './FAB.types';

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
      borderWidth: strokeWidth20,
      borderInnerWidth: strokeWidth10,
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
        borderWidth: strokeWidth20,
        borderInnerWidth: strokeWidth10,
      },
    },
    large: {
      borderRadius: cornerRadiusCircular,
      iconSize: 24,
      minHeight: 56,
      minWidth: 56,
      paddingHorizontal: size160,
      paddingVertical: size160,
      spacingIconContentBefore: 0,
      hasContent: {
        borderRadius: cornerRadiusCircular,
        iconSize: 24,
        fontSize: t.typography.variants.body1Strong.size,
        fontFamily: t.typography.variants.body1Strong.face,
        fontWeight: t.typography.variants.body1Strong.weight,
        minHeight: 56,
        minWidth: 56,
        paddingStart: size160,
        paddingEnd: size200,
        paddingVertical: size160,
        spacingIconContentBefore: size80,
      },
    },
    small: {
      borderRadius: cornerRadiusCircular,
      iconSize: 20,
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: size120,
      paddingVertical: size120,
      spacingIconContentBefore: 0,
      hasContent: {
        borderRadius: cornerRadiusCircular,
        iconSize: 20,
        fontSize: t.typography.variants.body2Strong.size,
        fontFamily: t.typography.variants.body2Strong.face,
        fontWeight: t.typography.variants.body2Strong.weight,
        minHeight: 44,
        minWidth: 44,
        paddingHorizontal: size120,
        paddingStart: size120,
        paddingEnd: size160,
        spacingIconContentBefore: size80,
      },
    },
  }) as FABTokens;
