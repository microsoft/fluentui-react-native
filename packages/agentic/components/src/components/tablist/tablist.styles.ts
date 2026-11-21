import type { ViewStyle } from 'react-native';
import {
  alignItemsToken,
  alignSelfToken,
  defineComponentTokens,
  flexDirectionToken,
  getComponentTokens,
  getGapStyleValue,
  resolveTokenStates,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { TabListState } from './tablist.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TabListTokenState = Pick<TabListState, 'orientation'>;
const domains = {
  root: {
    style: { alignItems: alignItemsToken, alignSelf: alignSelfToken, flexDirection: flexDirectionToken, gap: getGapStyleValue },
    props: {},
  },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.tablist': ComponentTokenPatch<TabListTokenState, typeof domains>;
  }
}

const tabListTokens = defineComponentTokens<TabListTokenState, typeof domains>({ id: 'furn.tablist', slots: domains, schema });

export function getTabListRootStyle(state: TabListState): ViewStyle {
  return resolveTokenStates(getComponentTokens(state, tabListTokens).root, state).style;
}
