import { tabsItemName, TabsItemTokens, TabsItemSlotProps, TabsItemProps } from './TabsItem.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';
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
          flexDirection: 'column',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          minHeight: 32,
          minWidth: 80,
          borderWidth: 2,
          borderRadius: 4,
          ...borderStyles.from(tokens, theme),
        },
      }),
      [...borderStyles.keys],
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
    stack: buildProps(
      () => ({
        style: {
          display: 'flex',
          marginHorizontal: 10,
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          minHeight: 32,
          minWidth: 32,
          justifyContent: 'center',
        },
      }),
      ['iconColor', 'indicatorColor'],
    ),
    indicator: buildProps(
      (tokens: TabsItemTokens) => ({
        style: {
          minHeight: 2,
          borderRadius: 2,
          marginBottom: 2,
          alignSelf: 'stretch',
          marginHorizontal: 10,
          backgroundColor: tokens.indicatorColor,
        },
      }),
      ['indicatorColor'],
    ),
  },
};
