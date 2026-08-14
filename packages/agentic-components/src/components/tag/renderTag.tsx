/** @jsxImportSource @fluentui-react-native/framework-base */
import type { TagState } from './tag.types';

export function renderTag_unstable(state: TagState) {
  return (
    <state.root>
      {state.leadingIcon && <state.leadingIcon />}
      {state.content && <state.content />}
      {state.dismissIcon && state.dismiss && <state.dismissIcon />}
    </state.root>
  );
}
