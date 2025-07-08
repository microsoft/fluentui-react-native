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
} from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const RadioGroupLegacyE2ETest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <RadioGroup
          label="RadioGroup for E2E Testing - Ally Label Set"
          accessibilityLabel={RADIOGROUP_ACCESSIBILITY_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(RADIOGROUP_TEST_COMPONENT)}
        >
          <RadioButton
            content="Option A"
            buttonKey="A"
            accessibilityLabel={FIRST_RADIO_BUTTON_ACCESSIBILITY_LABEL}
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(FIRST_RADIO_BUTTON)}
          />
          <RadioButton
            content={SECOND_RADIO_BUTTON_LABEL}
            buttonKey="B"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(SECOND_RADIO_BUTTON)}
          />
          <RadioButton
            content="Option C (disabled)"
            buttonKey="C"
            disabled={true}
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(THIRD_RADIO_BUTTON)}
          />
          <RadioButton
            content="Option D"
            buttonKey="C"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(FOURTH_RADIO_BUTTON)}
          />
        </RadioGroup>
        <RadioGroup
          label={RADIOGROUP_TEST_COMPONENT_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(RADIOGROUP_NO_A11Y_LABEL_COMPONENT)}
        >
          <RadioButton content="Option W" buttonKey="W" />
          <RadioButton content="Option X" buttonKey="X" />
          <RadioButton content="Option Y (disabled)" buttonKey="C" disabled={true} />
          <RadioButton content="Option Z" buttonKey="Z" />
        </RadioGroup>
      </Stack>
    </View>
  );
};
