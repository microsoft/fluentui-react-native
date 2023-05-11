import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { DrawerV1Tokens } from './DrawerV1.types';

export const defaultDrawerV1Tokens: TokenSettings<DrawerV1Tokens, Theme> = (t: Theme) =>
  ({
    backdropColor: '#00000080', // to be replace with token in future based on design guidance
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
  } as DrawerV1Tokens);
