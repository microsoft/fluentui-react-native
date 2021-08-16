import { tabsItemName, TabsItemTokens, TabsItemSlotProps, TabsItemProps } from './TabsItem.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles } from '@fluentui-react-native/tokens';
import { tabsItemStates, defaultTabsItemTokens } from './TabsItemTokens';

export const stylingSettings: UseStylingOptions<TabsItemProps, TabsItemSlotProps, TabsItemTokens> = {
  tokens: [defaultTabsItemTokens, tabsItemName],
  states: tabsItemStates,
  slotProps: {
    root: buildProps(
      (tokens: TabsItemTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          width: tokens.width,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
          ...shadowStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'width', ...borderStyles.keys, ...layoutStyles.keys, ...shadowStyles.keys],
    ),
    content: buildProps(
      (tokens: TabsItemTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: TabsItemTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
      }),
      ['iconColor'],
    ),
  },
};
