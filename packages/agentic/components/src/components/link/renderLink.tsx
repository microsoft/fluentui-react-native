/** @jsxImportSource @fluentui-react-native/framework-base */
import type { LinkState } from './link.types';

export function renderLink_unstable(state: LinkState) {
  return (
    <state.root>
      {state.content && <state.content />}
      {state.icon && <state.icon />}
    </state.root>
  );
}
