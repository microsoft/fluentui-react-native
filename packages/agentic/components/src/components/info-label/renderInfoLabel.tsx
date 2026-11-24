/** @jsxImportSource @fluentui-react-native/framework-base */
import type { InfoLabelState } from './info-label.types';

export function renderInfoLabel_unstable(state: InfoLabelState) {
  const Help = state.help;
  const HelpText = state.helpText;
  return (
    <state.root>
      <state.label />
      {Help && <Help>{HelpText ? <HelpText /> : state.helpContent}</Help>}
    </state.root>
  );
}
