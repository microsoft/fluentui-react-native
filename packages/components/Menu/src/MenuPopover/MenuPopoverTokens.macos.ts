import type { Theme } from '@fluentui-react-native/framework';
import { buildUseTokens } from '@fluentui-react-native/framework';
import { isHighContrast } from '@fluentui-react-native/theming-utils';

import type { MenuPopoverTokens } from './MenuPopover.types';
import { menuPopoverName } from './MenuPopover.types';


export const useMenuPopoverTokens = buildUseTokens<MenuPopoverTokens>(
  (t: Theme) => ({
    borderWidth: 1,
    borderRadius: 5,
    borderColor: isHighContrast() ? t.colors.neutralStroke1 : t.colors.transparentStroke,
  }),
  menuPopoverName,
);
