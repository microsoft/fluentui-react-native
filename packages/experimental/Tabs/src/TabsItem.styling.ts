import { tabsItemName, TabsItemTokens, TabsItemSlotProps, TabsItemProps } from './TabsItem.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles, getPaletteFromTheme } from '@fluentui-react-native/tokens';
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
    stack: buildProps(
      (tokens: TabsItemTokens) => ({
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
      (tokens: TabsItemTokens, theme: Theme) => ({
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
