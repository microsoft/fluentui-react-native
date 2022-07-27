import { Theme } from '@fluentui-react-native/framework';
// import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SwitchTokens } from './Switch.types';

export const defaultSwitchTokens: TokenSettings<SwitchTokens, Theme> = () => ({
  // background: t.host.palette.BkgToggleSwitchOff,
  background: '#FFFFFF',
  // thumb: t.host.palette.ThumbToggleSwitchOff,
  thumb: '#505050',
  stroke: '#505050',

  // stroke: t.host.palette.StrokeToggleSwitchOff
  toggleOn: {
    background: '#0F6CBD',
    justifyContent: 'flex-end',
  },

  toggleOff: {
    background: '#FFFFFF',
    justifyContent: 'flex-start',
  },
});
