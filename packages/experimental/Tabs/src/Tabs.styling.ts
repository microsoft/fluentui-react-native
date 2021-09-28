import { tabsName, TabsTokens, TabsSlotProps, TabsProps } from './Tabs.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/tokens';
import { defaultTabsTokens } from './TabsTokens';
import { getRootMargins, getLabelMargins, getStackMargins } from './TabsMargins';

export const stylingSettings: UseStylingOptions<TabsProps, TabsSlotProps, TabsTokens> = {
  tokens: [defaultTabsTokens, tabsName],
  slotProps: {
    root: buildProps(
      () => ({
        style: {
          display: 'flex',
          minHeight: 32,
          minWidth: 80,
          ...getRootMargins(),
        },
      }),
      [],
    ),
    label: buildProps(
      (tokens: TabsTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...getLabelMargins(),
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    stack: buildProps(
      (tokens: TabsTokens) => ({
        style: {
          flexDirection: 'row',
          backgroundColor: tokens.backgroundColor,
          ...getStackMargins(),
        },
      }),
      ['backgroundColor'],
    ),
  },
};
