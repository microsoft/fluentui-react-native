/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import { Icon } from '../../primitives/icon/icon';
import type { CheckboxState } from './checkbox.types';

const checkIcon = { codepoint: 0x2713, fontFamily: 'Arial' } as const;
const dashIcon = { codepoint: 0x2212, fontFamily: 'Arial' } as const;

export function renderCheckbox_unstable(state: CheckboxState) {
  const shouldRenderLabel = Boolean(state.labelText || state.secondaryTextSlot);

  return (
    <state.root>
      <View accessible={false} style={state.indicatorStyle} testID="checkbox-indicator">
        {state.status !== 'unchecked' && (
          <Icon
            accessible={false}
            color={state.indicatorIconColor}
            fontSource={state.status === 'indeterminate' ? dashIcon : checkIcon}
            height={state.indicatorIconSize}
            testID={state.status === 'indeterminate' ? 'checkbox-dash-icon' : 'checkbox-check-icon'}
            width={state.indicatorIconSize}
          />
        )}
      </View>
      {shouldRenderLabel && (
        <View accessible={false} style={state.labelContainerStyle}>
          {state.labelText && <state.labelText />}
          {state.secondaryTextSlot && <state.secondaryTextSlot />}
        </View>
      )}
    </state.root>
  );
}

