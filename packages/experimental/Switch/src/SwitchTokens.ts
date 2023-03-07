import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SwitchTokens } from './Switch.types';

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
    thumbColor: t.colors.neutralForegroundInverted,
    borderColor: t.colors.compoundBrandBackground1,
    justifyContent: 'flex-end',
    hovered: {
      trackColor: t.colors.compoundBrandBackground1Hover,
      thumbColor: t.colors.neutralForegroundInvertedLink,
      borderColor: t.colors.compoundBrandBackground1Hover,
    },
    pressed: {
      trackColor: t.colors.compoundBrandBackground1Pressed,
      thumbColor: t.colors.neutralForegroundInvertedLink,
      borderColor: t.colors.compoundBrandBackground1Pressed,
    },
    disabled: {
      trackColor: t.colors.neutralBackgroundDisabled,
      thumbColor: t.colors.neutralStrokeDisabled,
      borderColor: t.colors.neutralForegroundDisabled,
    },
  },

  toggleOff: {
    trackColor: t.colors.neutralForegroundInvertedLink,
    thumbColor: t.colors.neutralStrokeAccessible,
    borderColor: t.colors.neutralStrokeAccessible,
    justifyContent: 'flex-start',
    hovered: {
      trackColor: t.colors.neutralForegroundInvertedLinkHover,
      thumbColor: t.colors.neutralStrokeAccessibleHover,
      borderColor: t.colors.neutralStrokeAccessibleHover,
    },
    pressed: {
      trackColor: t.colors.neutralForegroundInvertedLinkPressed,
      thumbColor: t.colors.neutralStrokeAccessiblePressed,
      borderColor: t.colors.neutralStrokeAccessiblePressed,
    },
    disabled: {
      trackColor: t.colors.neutralBackgroundDisabled,
      thumbColor: t.colors.neutralStrokeDisabled,
      borderColor: t.colors.neutralStrokeDisabled,
    },
  },

  focused: {
    focusStrokeColor: t.colors.strokeFocus2,
  },
});
