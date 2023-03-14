import { Platform } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import { buildUseTokens } from '@fluentui-react-native/framework';

import type { MenuPopoverTokens } from './MenuPopover.types';
import { menuPopoverName } from './MenuPopover.types';

export const useMenuPopoverTokens = buildUseTokens<MenuPopoverTokens>(
  (t: Theme) => (Platform.OS === 'android' ? {} : { borderWidth: 1, borderColor: t.colors.neutralStrokeAccessible }),
  menuPopoverName,
);
