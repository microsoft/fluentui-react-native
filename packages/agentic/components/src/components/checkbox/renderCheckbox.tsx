/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import type { CheckboxState } from './checkbox.types';

export function renderCheckbox_unstable(state: CheckboxState) {
  const shouldRenderLabel = Boolean(state.labelText || state.secondaryTextSlot);

  return (
    <state.root ref={state.focusTargetRef}>
      {state.FocusRing && <state.FocusRing />}
      <CheckboxIndicator
        {...hiddenFromAccessibilityProps}
        iconColor={state.indicatorIconColor}
        iconSize={state.indicatorIconSize}
        status={state.status}
        style={state.indicatorStyle}
        testID="checkbox-indicator"
      />
      {shouldRenderLabel && (
        <View {...hiddenFromAccessibilityProps} style={state.labelContainerStyle}>
          {state.labelText && <state.labelText />}
          {state.secondaryTextSlot && <state.secondaryTextSlot />}
        </View>
      )}
    </state.root>
  );
}
