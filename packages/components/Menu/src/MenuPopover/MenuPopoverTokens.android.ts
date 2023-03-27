import type { Theme } from '@fluentui-react-native/framework';
import { buildUseTokens } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { MenuPopoverTokens } from './MenuPopover.types';
import { menuPopoverName } from './MenuPopover.types';

export const useMenuPopoverTokens = buildUseTokens<MenuPopoverTokens>(
  (t: Theme) => ({
    borderWidth: 1,
    borderColor: t.colors.neutralStrokeAccessible,
    maxHeight: 200, // Hardcoded for now, as design value pending and no global token available
    maxWidth: 400, // Hardcoded for now, as design value pending and no global token available
    cornerRadius: globalTokens.corner.radius80,
    elevation: globalTokens.size160,
  }),
  menuPopoverName,
);
