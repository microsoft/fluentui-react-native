import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SwitchTokens } from './Switch.types';

export const defaultSwitchTokens: TokenSettings<SwitchTokens, Theme> = (t: Theme) => ({
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
    background: t.colors.compoundBrandBackground1,
    thumb: t.colors.neutralForegroundInverted,
    stroke: t.colors.compoundBrandBackground1,
    justifyContent: 'flex-end',
    hovered: {
      background: t.colors.compoundBrandBackground1Hover,
      thumb: t.colors.neutralForegroundInvertedLink,
      stroke: t.colors.compoundBrandBackground1Hover,
    },
    pressed: {
      background: t.colors.compoundBrandBackground1Pressed,
      thumb: t.colors.neutralForegroundInvertedLink,
      stroke: t.colors.compoundBrandBackground1Pressed,
    },
    disabled: {
      background: t.colors.neutralBackgroundDisabled,
      thumb: t.colors.neutralStrokeDisabled,
      stroke: t.colors.neutralForegroundDisabled,
    },
  },

  toggleOff: {
    background: t.colors.neutralForegroundInvertedLink,
    thumb: t.colors.neutralStrokeAccessible,
    stroke: t.colors.neutralStrokeAccessible,
    justifyContent: 'flex-start',
    hovered: {
      background: t.colors.neutralForegroundInvertedLinkHover,
      thumb: t.colors.neutralStrokeAccessibleHover,
      stroke: t.colors.neutralStrokeAccessibleHover,
    },
    pressed: {
      background: t.colors.neutralForegroundInvertedLinkPressed,
      thumb: t.colors.neutralStrokeAccessiblePressed,
      stroke: t.colors.neutralStrokeAccessiblePressed,
    },
    disabled: {
      background: t.colors.neutralBackgroundDisabled,
      thumb: t.colors.neutralStrokeDisabled,
      stroke: t.colors.neutralStrokeDisabled,
    },
  },
});
