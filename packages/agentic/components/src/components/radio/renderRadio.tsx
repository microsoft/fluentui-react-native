/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, View } from 'react-native';

import { FocusVisual } from '../../primitives/focus-visual/focus-visual';
import type { RadioState } from './radio.types';

/**
 * Renders the Radio component.
 */
export function renderRadio_unstable(state: RadioState) {
  return (
    <state.root>
      <FocusVisual {...state.focusVisualProps} />
      <View testID="radio-indicator" style={state.indicatorStyle}>
        <View testID="radio-dot" style={state.indicatorDotStyle} />
      </View>
      <View style={state.labelContainerStyle}>
        <Text style={state.labelStyle}>{state.label}</Text>
        {state.showSecondaryText ? <Text style={state.secondaryTextStyle}>{state.secondaryText}</Text> : null}
      </View>
    </state.root>
  );
}
