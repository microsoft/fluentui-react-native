/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import type { DividerState } from './divider.types';
import { getDividerAfterLineStyle, getDividerBeforeLineStyle } from './useApplyStyles';

/**
 * Renders the Divider component.
 */
export function renderDivider_unstable(state: DividerState) {
  return (
    <state.root>
      <View style={getDividerBeforeLineStyle(state)} />
      {state.contentContainer && (
        <state.contentContainer>
          {state.icon && <state.icon />}
          {state.label && <state.label />}
        </state.contentContainer>
      )}
      <View style={getDividerAfterLineStyle(state)} />
    </state.root>
  );
}
