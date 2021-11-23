import * as React from 'react';
import { View } from 'react-native';
import { RadioButton, RadioGroup } from '@fluentui/react-native';
import {
  RADIOGROUP_TEST_COMPONENT,
  RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  RADIOGROUP_TEST_COMPONENT_LABEL,
  RADIOGROUP_ACCESSIBILITY_LABEL,
  RADIOBUTTON_TEST_COMPONENT,
  RADIOBUTTON_ACCESSIBILITY_LABEL,
  RADIOBUTTON_NO_A11Y_LABEL_COMPONENT,
  RADIOBUTTON_TEST_COMPONENT_LABEL,
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
          <RadioButton content="Option A" buttonKey="A" />
          <RadioButton
            content="Option B"
            buttonKey="B"
            testID={RADIOBUTTON_TEST_COMPONENT}
            accessibilityLabel={RADIOBUTTON_ACCESSIBILITY_LABEL}
          />
          <RadioButton content="Option C (disabled)" buttonKey="C" disabled={true} />
          <RadioButton content="Option D" buttonKey="C" />
        </RadioGroup>
        <RadioGroup label={RADIOGROUP_TEST_COMPONENT_LABEL} testID={RADIOGROUP_NO_A11Y_LABEL_COMPONENT}>
          <RadioButton content={RADIOBUTTON_TEST_COMPONENT_LABEL} buttonKey="W" testID={RADIOBUTTON_NO_A11Y_LABEL_COMPONENT} />
          <RadioButton content="Option X" buttonKey="X" />
          <RadioButton content="Option Y (disabled)" buttonKey="C" disabled={true} />
          <RadioButton content="Option Z" buttonKey="Z" />
        </RadioGroup>
      </Stack>
    </View>
  );
};
