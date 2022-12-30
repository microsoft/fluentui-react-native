import * as React from 'react';
import { View } from 'react-native';
import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import {
  RADIOGROUPV1_TEST_COMPONENT,
  RADIOGROUPV1_NO_A11Y_LABEL_COMPONENT,
  RADIOGROUPV1_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_RADIOGROUP_ACCESSIBILITY_LABEL,
  FIRST_RADIO,
  SECOND_RADIO,
  THIRD_RADIO,
  FOURTH_RADIO,
  FIFTH_RADIO,
  FIRST_RADIO_ACCESSIBILITY_LABEL,
  SECOND_RADIO_LABEL,
} from '../../../../E2E/src/RadioGroupV1/consts';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';

export const E2ERadioGroupExperimentalTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <RadioGroup
          label="RadioGroup for E2E Testing - Ally Label Set"
          accessibilityLabel={EXPERIMENTAL_RADIOGROUP_ACCESSIBILITY_LABEL}
          testID={RADIOGROUPV1_TEST_COMPONENT}
        >
          <Radio label="Option A" value="A" testID={FIRST_RADIO} accessibilityLabel={FIRST_RADIO_ACCESSIBILITY_LABEL} />
          <Radio label={SECOND_RADIO_LABEL} value="B" testID={SECOND_RADIO} />
          <Radio label="Option C (disabled)" value="C" disabled={true} testID={THIRD_RADIO} />
          <Radio label="Option D" value="C" testID={FOURTH_RADIO} />
        </RadioGroup>
        <RadioGroup label={RADIOGROUPV1_TEST_COMPONENT_LABEL} testID={RADIOGROUPV1_NO_A11Y_LABEL_COMPONENT}>
          <Radio label="Option W" value="W" testID={FIFTH_RADIO} />
          <Radio label="Option X" value="X" />
          <Radio label="Option Y (disabled)" value="C" disabled={true} />
          <Radio label="Option Z" value="Z" />
        </RadioGroup>
      </Stack>
    </View>
  );
};
