/** @jsxImportSource @fluentui-react-native/framework-base */
import { TabListProvider } from './TabListProvider';
import type { TabListState } from './tablist.types';

export function renderTabList_unstable(state: TabListState) {
  return (
    <state.root>
      <TabListProvider value={state.contextValue}>{state.children}</TabListProvider>
      {state.endContent}
    </state.root>
  );
}
