import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { DrawerTokens } from './Drawer.types';

export const defaultDrawerTokens: TokenSettings<DrawerTokens, Theme> = (t: Theme) =>
  ({
    scrimColor: '#00000080', // to be replace with token in future based on design guidance
    drawerBackgroundColor: t.colors.neutralBackground2,
    handleBackgroundColor: t.colors.neutralStroke1,
    handleWidth: globalTokens.size360,
    handleHeight: globalTokens.size40,
    handleCornerRadius: globalTokens.size20,
    handleAlignment: 'center',
    handleMarginTop: globalTokens.size80,
    handleMarginBottom: globalTokens.sizeNone,
    handleMarginEnd: globalTokens.sizeNone,
    handleMarginStart: globalTokens.sizeNone,
    drawerElevation: globalTokens.size100,
    topPosition: 0,
    left: {
      height: '100%',
      width: '80%',
      leftPosition: 0,
      drawerCornerRadius: 0,
    },
    right: {
      height: '100%',
      width: '80%',
      rightPosition: 0,
      drawerCornerRadius: 0,
    },
    bottom: {
      bottomPosition: 0,
      width: '100%',
      drawerCornerRadius: globalTokens.corner.radius120,
      height: '50%',
    },
  }) as DrawerTokens;
