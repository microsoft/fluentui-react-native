import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { tabName } from './Tab.types';
import type { TabSlotProps, TabTokens, TabProps } from './Tab.types';
import { tabStates, defaultTabTokens } from './TabTokens';

export const stylingSettings: UseStylingOptions<TabProps, TabSlotProps, TabTokens> = {
  tokens: [defaultTabTokens, tabName],
  states: tabStates,
  slotProps: {
    root: buildProps(() => ({}), []),
    content: buildProps(() => ({}), []),
    icon: buildProps(() => ({}), []),
    stack: buildProps(() => ({}), []),
    indicator: buildProps(() => ({}), []),
  },
};
