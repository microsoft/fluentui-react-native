import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SwitchTokens } from './Switch.types';

export const defaultSwitchTokens: TokenSettings<SwitchTokens, Theme> = (t: Theme) => ({
  borderWidth: 1,
  borderRadius: 50,
  minHeight: 28,
  minWidth: 40,

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
    backgroundColor: t.colors.compoundBrandBackground1,
    thumbColor: t.colors.neutralForegroundInverted,
    borderColor: t.colors.compoundBrandBackground1,
    justifyContent: 'flex-end',
    hovered: {
      backgroundColor: t.colors.compoundBrandBackground1Hover,
      thumbColor: t.colors.neutralForegroundInvertedLink,
      borderColor: t.colors.compoundBrandBackground1Hover,
    },
    pressed: {
      backgroundColor: t.colors.compoundBrandBackground1Pressed,
      thumbColor: t.colors.neutralForegroundInvertedLink,
      borderColor: t.colors.compoundBrandBackground1Pressed,
    },
    disabled: {
      backgroundColor: t.colors.neutralBackgroundDisabled,
      thumbColor: t.colors.neutralStrokeDisabled,
      borderColor: t.colors.neutralForegroundDisabled,
    },
  },

  toggleOff: {
    backgroundColor: t.colors.neutralForegroundInvertedLink,
    thumbColor: t.colors.neutralStrokeAccessible,
    borderColor: t.colors.neutralStrokeAccessible,
    justifyContent: 'flex-start',
    hovered: {
      backgroundColor: t.colors.neutralForegroundInvertedLinkHover,
      thumbColor: t.colors.neutralStrokeAccessibleHover,
      borderColor: t.colors.neutralStrokeAccessibleHover,
    },
    pressed: {
      backgroundColor: t.colors.neutralForegroundInvertedLinkPressed,
      thumbColor: t.colors.neutralStrokeAccessiblePressed,
      borderColor: t.colors.neutralStrokeAccessiblePressed,
    },
    disabled: {
      backgroundColor: t.colors.neutralBackgroundDisabled,
      thumbColor: t.colors.neutralStrokeDisabled,
      borderColor: t.colors.neutralStrokeDisabled,
    },
  },
});
