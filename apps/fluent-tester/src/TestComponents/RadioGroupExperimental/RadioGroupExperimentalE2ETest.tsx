import * as React from 'react';
import { View } from 'react-native';
import { RadioGroup, Radio } from '@fluentui-react-native/experimental-radio-group';
import {
  EXPERIMENTAL_RADIOGROUP_TEST_COMPONENT,
  EXPERIMENTAL_RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_RADIOGROUP_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_RADIOGROUP_ACCESSIBILITY_LABEL,
  FIRST_RADIO,
  SECOND_RADIO,
  THIRD_RADIO,
  FOURTH_RADIO,
  FIFTH_RADIO,
  FIRST_RADIO_ACCESSIBILITY_LABEL,
  SECOND_RADIO_LABEL,
} from '../../../../E2E/src/RadioGroupExperimental/consts';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const E2ERadioGroupExperimentalTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <RadioGroup
          label="RadioGroup for E2E Testing - Ally Label Set"
          accessibilityLabel={EXPERIMENTAL_RADIOGROUP_ACCESSIBILITY_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(EXPERIMENTAL_RADIOGROUP_TEST_COMPONENT)}
        >
          <Radio
            label="Option A"
            value="A"
            accessibilityLabel={FIRST_RADIO_ACCESSIBILITY_LABEL}
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(FIRST_RADIO)}
          />
          <Radio
            label={SECOND_RADIO_LABEL}
            value="B"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(SECOND_RADIO)}
          />
          <Radio
            label="Option C (disabled)"
            value="C"
            disabled={true}
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(THIRD_RADIO)}
          />
          <Radio
            label="Option D"
            value="C"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(FOURTH_RADIO)}
          />
        </RadioGroup>
        <RadioGroup
          label={
            EXPERIMENTAL_RADIOGROUP_TEST_COMPONENT_LABEL
          } /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(EXPERIMENTAL_RADIOGROUP_NO_A11Y_LABEL_COMPONENT)}
        >
          <Radio label="Option W" value="W" testID={FIFTH_RADIO} />
          <Radio label="Option X" value="X" />
          <Radio label="Option Y (disabled)" value="C" disabled={true} />
          <Radio label="Option Z" value="Z" />
        </RadioGroup>
      </Stack>
    </View>
  );
};
