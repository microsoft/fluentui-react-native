/** @jsxImportSource @fluentui-react-native/framework-base */
import { ToolbarContext } from './ToolbarContext';
import type { ToolbarState } from './toolbar.types';

export function renderToolbar_unstable(state: ToolbarState) {
  return (
    <state.root>
      <ToolbarContext.Provider value={state.contextValue}>{state.children}</ToolbarContext.Provider>
    </state.root>
  );
}
