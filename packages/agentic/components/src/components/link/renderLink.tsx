/** @jsxImportSource @fluentui-react-native/framework-base */
import type { LinkState } from './link.types';

export function renderLink_unstable(state: LinkState) {
  const TrailingIcon = state.trailingIcon;
  return (
    <state.root ref={state.focusTargetRef}>
      {state.FocusRing && <state.FocusRing />}
      <state.content />
      {TrailingIcon && <TrailingIcon />}
    </state.root>
  );
}
