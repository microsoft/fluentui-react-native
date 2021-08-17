import { tabsName, TabsTokens, TabsSlotProps, TabsProps } from './Tabs.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';

export const stylingSettings: UseStylingOptions<TabsTokens, TabsSlotProps, TabsProps> = {
  tokens: [tabsName],
  states: [],
  slotProps: {
    root: buildProps(
      (tokens: TabsTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          paddingStart: 16,
          paddingEnd: 16,
        },
      }),
      ['backgroundColor', 'width'],
    ),
  },
};
