/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ButtonState } from './button.types';

/**
 * Render the Button component
 * @param state The state of the Button component containing slots and other state information.
 * @returns The rendered Button component.
 */
export function renderButton_unstable(state: ButtonState) {
  const { content: Content, leadingIcon: LeadingIcon, trailingIcon: TrailingIcon } = state;
  return (
    <state.root ref={state.focusTargetRef}>
      {state.FocusRing && <state.FocusRing />}
      {LeadingIcon && <LeadingIcon />}
      {Content && <Content />}
      {TrailingIcon && <TrailingIcon />}
    </state.root>
  );
}
