import { buildUseTokens, Theme } from '@fluentui-react-native/framework';
import { menuPopoverName, MenuPopoverTokens } from './MenuPopover.types';

export const useMenuPopoverTokens = buildUseTokens<MenuPopoverTokens>(
  (t: Theme) => ({ borderWidth: 1, borderColor: t.colors.neutralStrokeAccessible }),
  menuPopoverName,
);
