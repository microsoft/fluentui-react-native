/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { CheckboxState } from './checkbox.types';

export function renderCheckbox_unstable(state: CheckboxState) {
  const shouldRenderLabel = Boolean(state.labelText || state.secondaryTextSlot);

  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      <CheckboxIndicator
        iconColor={state.indicatorIconColor}
        iconSize={state.indicatorIconSize}
        status={state.status}
        style={state.indicatorStyle}
        testID="checkbox-indicator"
      />
      {shouldRenderLabel && (
        <View accessible={false} style={state.labelContainerStyle}>
          {state.labelText && <state.labelText />}
          {state.secondaryTextSlot && <state.secondaryTextSlot />}
        </View>
      )}
    </state.root>
  );
}
