import type { Theme } from '@fluentui-react-native/framework';
import { cornerRadius120, size100, size20, size360, size40, size80, sizeNone } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { DrawerTokens } from './Drawer.types';

export const defaultDrawerTokens: TokenSettings<DrawerTokens, Theme> = (t: Theme) =>
  ({
    scrimColor: '#00000080', // to be replace with token in future based on design guidance
    drawerBackgroundColor: t.colors.neutralBackground2,
    handleBackgroundColor: t.colors.neutralStroke1,
    handleWidth: size360,
    handleHeight: size40,
    handleCornerRadius: size20,
    handleAlignment: 'center',
    handleMarginTop: size80,
    handleMarginBottom: sizeNone,
    handleMarginEnd: sizeNone,
    handleMarginStart: sizeNone,
    drawerElevation: size100,
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
      drawerCornerRadius: cornerRadius120,
      height: '50%',
    },
  }) as DrawerTokens;
