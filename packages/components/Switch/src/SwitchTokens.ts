import { Theme } from '@fluentui-react-native/framework';
// import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SwitchTokens } from './Switch.types';

export const defaultSwitchTokens: TokenSettings<SwitchTokens, Theme> = (t: Theme) => ({
  background: t.colors.neutralForegroundInvertedLink,
  thumb: t.colors.neutralStrokeAccessible,
  stroke: t.colors.neutralStrokeAccessible,

  // stroke: t.host.palette.StrokeToggleSwitchOff
  toggleOn: {
    background: t.colors.compoundBrandBackground1,
    thumb: t.colors.neutralForegroundInverted,
    stroke: t.colors.compoundBrandBackground1,
    justifyContent: 'flex-end',
  },

  toggleOff: {
    background: t.colors.neutralForegroundInvertedLink,
    thumb: t.colors.neutralStrokeAccessible,
    stroke: t.colors.neutralStrokeAccessible,
    justifyContent: 'flex-start',
    hover: {
      background: t.colors.neutralForegroundInvertedLinkHover,
      thumb: t.colors.neutralStrokeAccessibleHover,
      stroke: t.colors.neutralStrokeAccessibleHover,
    },
  },
});
