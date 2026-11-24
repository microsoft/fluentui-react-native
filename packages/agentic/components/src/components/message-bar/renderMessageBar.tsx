/** @jsxImportSource @fluentui-react-native/framework-base */
import type { MessageBarState } from './message-bar.types';

export function renderMessageBar_unstable(state: MessageBarState) {
  if (!state.hasContent) return null;
  return (
    <state.root>
      <state.row>
        <state.statusIcon />
        <state.message>
          {state.title && <state.title />}
          <state.content />
        </state.message>
        {state.dismiss && <state.dismiss />}
      </state.row>
      {state.actions && (
        <state.actions>
          {state.firstAction && <state.firstAction />}
          {state.secondAction && <state.secondAction />}
        </state.actions>
      )}
    </state.root>
  );
}
