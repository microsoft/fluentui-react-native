/** @jsxImportSource @fluentui-react-native/framework-base */
import type { LabelState } from './label.types';

/**
 * Renders Label with the text followed by the optional required indicator.
 */
export function renderLabel_unstable(state: LabelState) {
  const Content = state.content;
  const RequiredIndicator = state.requiredIndicator;

  return (
    <state.root>
      <Content />
      {RequiredIndicator && <RequiredIndicator />}
    </state.root>
  );
}
