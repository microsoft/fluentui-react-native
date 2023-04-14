import { Dimensions } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import { buildUseTokens } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { MenuPopoverTokens } from './MenuPopover.types';
import { menuPopoverName } from './MenuPopover.types';

export const useMenuPopoverTokens = buildUseTokens<MenuPopoverTokens>(
  (t: Theme) => ({
    borderWidth: 1,
    borderColor: t.colors.neutralStrokeAccessible,
    maxHeight: Dimensions.get('window').height / 2 - globalTokens.size320, // Getting window height size and subtracting the padding considering on vertical
    maxWidth: Dimensions.get('window').width - globalTokens.size160, // Getting window height size and subtracting the screen offset a/c design
    cornerRadius: globalTokens.corner.radius80,
    elevation: globalTokens.size160,
    minPadding: globalTokens.size160,
  }),
  menuPopoverName,
);
