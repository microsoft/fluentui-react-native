import * as React from 'react';
import { View } from 'react-native';
import { RadioButton, RadioGroup } from '@fluentui/react-native';
import {
  RADIOGROUP_TEST_COMPONENT,
  RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  RADIOGROUP_ACCESSIBILITY_LABEL,
  FIRST_RADIO_BUTTON,
  SECOND_RADIO_BUTTON,
  THIRD_RADIO_BUTTON,
  FOURTH_RADIO_BUTTON,
  FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL,
  SECOND_RADIO_BUTTON_LABEL,
} from './consts';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';

export const E2ERadioGroupTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <RadioGroup
          label="RadioGroup for E2E Testing - Ally Label Set"
          accessibilityLabel={RADIOGROUP_ACCESSIBILITY_LABEL}
          testID={RADIOGROUP_TEST_COMPONENT}
        >
          <RadioButton
            content="Option A"
            buttonKey="A"
            testID={FIRST_RADIO_BUTTON}
            accessibilityLabel={FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL}
          />
          <RadioButton content={SECOND_RADIO_BUTTON_LABEL} buttonKey="B" testID={SECOND_RADIO_BUTTON} />
          <RadioButton content="Option C (disabled)" buttonKey="C" disabled={true} testID={THIRD_RADIO_BUTTON} />
          <RadioButton content="Option D" buttonKey="C" testID={FOURTH_RADIO_BUTTON} />
        </RadioGroup>
        <RadioGroup label={RADIOGROUP_TEST_COMPONENT_LABEL} testID={RADIOGROUP_NO_A11Y_LABEL_COMPONENT}>
          <RadioButton content="Option W" buttonKey="W" />
          <RadioButton content="Option X" buttonKey="X" />
          <RadioButton content="Option Y (disabled)" buttonKey="C" disabled={true} />
          <RadioButton content="Option Z" buttonKey="Z" />
        </RadioGroup>
      </Stack>
    </View>
  );
};
