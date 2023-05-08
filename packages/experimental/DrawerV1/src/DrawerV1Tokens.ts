import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { DrawerV1Tokens } from './DrawerV1.types';

export const defaultDrawerV1Tokens: TokenSettings<DrawerV1Tokens, Theme> = () =>
  ({
    color: 'red',
  } as DrawerV1Tokens);
