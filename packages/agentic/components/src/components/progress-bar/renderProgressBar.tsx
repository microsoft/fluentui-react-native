/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, View } from 'react-native';

import type { ProgressBarState } from './progress-bar.types';

export function renderProgressBar_unstable(state: ProgressBarState) {
  const ValidationIcon = state.validationIcon;

  return (
    <state.root>
      <View style={state.styles.header}>
        <Text accessible={false} nativeID={state.labelId} style={state.styles.label}>
          {state.label}
        </Text>
        {(state.showValidationIcon || state.showValueText) && (
          <View style={state.styles.trailing}>
            {ValidationIcon && <ValidationIcon />}
            {state.showValueText && (
              <Text accessible={false} style={state.styles.valueText}>
                {state.valueText}
              </Text>
            )}
          </View>
        )}
      </View>
      <state.track>
        <state.indicator />
      </state.track>
    </state.root>
  );
}
