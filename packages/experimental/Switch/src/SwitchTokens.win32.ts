import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SwitchTokens } from './Switch.types';

// toggleOn: {
//   trackColor: t.colors.compoundBrandBackground1,
//   thumbColor: t.colors.neutralForegroundOnBrandHover,
//   borderColor: t.colors.compoundBrandBackground1,
//   hovered: {
//     trackColor: t.colors.neutralForegroundOnBrandHover,
//     thumbColor: t.colors.compoundBrandBackground1Hover,
//     borderColor: t.colors.compoundBrandBackground1Hover,
//   },
//   pressed: {
//     trackColor: t.colors.compoundBrandBackground1Pressed,
//     thumbColor: t.colors.neutralForegroundOnBrandHoverPressed,
//     borderColor: t.colors.compoundBrandBackground1Pressed,
//   },
//   disabled: {
//     trackColor: t.colors.neutralForegroundDisabled,
//     thumbColor: t.colors.brandBackground,
//     borderColor: t.colors.neutralForegroundDisabled,
//   },
// },
// toggleOff: {
//   trackColor: t.colors.brandBackground,
//   thumbColor: t.colors.neutralForegroundOnBrand,
//   borderColor: t.colors.neutralForegroundOnBrand,
//   hovered: {
//     trackColor: t.colors.brandBackgroundHover,
//     thumbColor: t.colors.neutralForegroundOnBrandHover,
//     borderColor: t.colors.neutralForegroundOnBrandHover,
//   },
//   pressed: {
//     trackColor: t.colors.neutralForegroundOnBrandPressed,
//     thumbColor: t.colors.neutralStrokeAccessiblePressed,
//     borderColor: t.colors.neutralStrokeAccessiblePressed,
//   },
//   disabled: {
//     trackColor: t.colors.brandBackground,
//     thumbColor: t.colors.neutralStrokeDisabled,
//     borderColor: t.colors.neutralStrokeDisabled,
//   },
// }

export const defaultSwitchTokens: TokenSettings<SwitchTokens, Theme> = (t: Theme) => ({
  borderWidth: 1,
  borderRadius: 10,
  minHeight: 28,
  minWidth: 40,
  thumbSize: 14,
  thumbRadius: 17,
  trackHeight: 20,
  trackWidth: 40,
  focusBorderRadius: 4,
  focusBorderWidth: 2,
  focusStrokeColor: t.colors.transparentBackground,
  padding: 2,
  color: t.colors.neutralForeground2,
  trackMarginTop: 2,
  trackMarginBottom: 2,
  trackMarginLeft: 2,
  trackMarginRight: 2,
  thumbMargin: 2,

  beforeContent: {
    trackMarginLeft: 8,
  },

  afterContent: {
    trackMarginRight: 8,
  },

  before: {
    flexDirection: 'row',
    toggleContainerFlexDirection: 'row',
  },

  above: {
    flexDirection: 'column',
    toggleContainerFlexDirection: 'row',
  },

  after: {
    flexDirection: 'row-reverse',
    toggleContainerFlexDirection: 'row-reverse',
  },

  toggleOn: {
    trackColor: t.colors.compoundBrandBackground1,
    thumbColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrandHover : t.colors.neutralForegroundInverted,
    borderColor: t.colors.compoundBrandBackground1,
    justifyContent: 'flex-end',
    hovered: {
      trackColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrandHover : t.colors.compoundBrandBackground1Hover,
      thumbColor: isHighContrast(t) ? t.colors.compoundBrandBackground1Hover : t.colors.neutralForegroundInvertedLink,
      borderColor: t.colors.compoundBrandBackground1Hover,
    },
    pressed: {
      trackColor: t.colors.compoundBrandBackground1Pressed,
      thumbColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrandHoverPressed : t.colors.neutralForegroundInvertedLink,
      borderColor: t.colors.compoundBrandBackground1Pressed,
    },
    disabled: {
      trackColor: isHighContrast ? t.colors.neutralForegroundDisabled : t.colors.neutralBackgroundDisabled,
      thumbColor: isHighContrast ? t.colors.brandBackground : t.colors.neutralStrokeDisabled,
      borderColor: t.colors.neutralForegroundDisabled,
    },
  },

  toggleOff: {
    trackColor: isHighContrast(t) ? t.colors.brandBackground : t.colors.neutralForegroundInvertedLink,
    thumbColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrand : t.colors.neutralStrokeAccessible,
    borderColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrand : t.colors.neutralStrokeAccessible,
    justifyContent: 'flex-start',
    hovered: {
      trackColor: isHighContrast(t) ? t.colors.brandBackgroundHover : t.colors.neutralForegroundInvertedLinkHover,
      thumbColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrandHover : t.colors.neutralStrokeAccessibleHover,
      borderColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrandHover : t.colors.neutralStrokeAccessibleHover,
    },
    pressed: {
      trackColor: isHighContrast(t) ? t.colors.neutralForegroundOnBrandPressed : t.colors.neutralForegroundInvertedLinkPressed,
      thumbColor: t.colors.neutralStrokeAccessiblePressed,
      borderColor: t.colors.neutralStrokeAccessiblePressed,
    },
    disabled: {
      trackColor: isHighContrast(t) ? t.colors.brandBackground : t.colors.neutralBackgroundDisabled,
      thumbColor: t.colors.neutralStrokeDisabled,
      borderColor: t.colors.neutralStrokeDisabled,
    },
  },

  focused: {
    focusStrokeColor: t.colors.strokeFocus2,
  },
});

function isHighContrast(t: Theme) {
  return t.name === 'HighContrast';
}
