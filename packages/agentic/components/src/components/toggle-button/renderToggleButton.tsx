/** @jsxImportSource @fluentui-react-native/framework-base */
import { LayoutStableText } from '../../primitives/layout-stable-text/layout-stable-text';
import type { ToggleButtonState } from './toggle-button.types';

export function renderToggleButton_unstable(state: ToggleButtonState) {
  const { leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, content: Content, contentHidden: Reserve } = state;
  return (
    <state.root ref={state.focusTargetRef}>
      {state.FocusRing && <state.FocusRing />}
      {LeadingIcon && <LeadingIcon />}
      {Content && (Reserve ? <LayoutStableText reserve={<Reserve />} visible={<Content />} /> : <Content />)}
      {TrailingIcon && <TrailingIcon />}
    </state.root>
  );
}
