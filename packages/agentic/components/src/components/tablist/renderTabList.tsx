/** @jsxImportSource @fluentui-react-native/framework-base */
import { TabListProvider } from './TabListProvider';
import type { TabListState } from './tablist.types';

export function renderTabList_unstable(state: TabListState) {
  return (
    <TabListProvider value={state.contextValue}>
      <state.root>{state.children}</state.root>
    </TabListProvider>
  );
}
