import type { Theme } from '@fluentui-react-native/framework';
import { buildUseTokens } from '@fluentui-react-native/framework';

import type { MenuPopoverTokens } from './MenuPopover.types';
import { menuPopoverName } from './MenuPopover.types';

export const useMenuPopoverTokens = buildUseTokens<MenuPopoverTokens>(
  (_t: Theme) => ({
    borderWidth: 0,
    borderRadius: 5,
  }),
  menuPopoverName,
);
