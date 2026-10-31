/** @jsxImportSource @fluentui-react-native/framework-base */
import { Text, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { DropdownPopup } from './dropdownPopup';
import { dropdownStyles } from './dropdown.styles';
import type { DropdownState } from './dropdown.types';

/**
 * Renders the root around the combobox trigger, with Input's chrome, the value, and the chevron, and the list popup
 * host beside the trigger.
 */
export function renderDropdown_unstable(state: DropdownState) {
  const { chevron: Chevron, iconStart: IconStart, resolved, value: Value } = state;
  return (
    <state.root>
      <state.trigger ref={state.triggerRef}>
        <View {...hiddenFromAccessibilityProps} pointerEvents="none" style={resolved.iconTextStack}>
          {IconStart && <IconStart />}
          <View
            style={dropdownStyles.valueBox}
            onLayout={(event: LayoutChangeEvent) => state.onValueLayout(event.nativeEvent.layout.width)}
          >
            <Value />
            {state.measureText !== undefined && (
              <View {...hiddenFromAccessibilityProps} pointerEvents="none" style={dropdownStyles.measure}>
                <Text
                  numberOfLines={1}
                  style={[resolved.textInput, dropdownStyles.measureText]}
                  onLayout={(event: LayoutChangeEvent) => state.onMeasureLayout(event.nativeEvent.layout.width)}
                >
                  {state.measureText}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View {...hiddenFromAccessibilityProps} pointerEvents="none" style={resolved.iconEnd}>
          <Chevron />
        </View>
        {state.underline && <state.underline />}
        {state.underlineFocus && <state.underlineFocus />}
      </state.trigger>
      {state.FocusRing && <state.FocusRing />}
      <DropdownPopup {...state.popupProps} />
    </state.root>
  );
}
