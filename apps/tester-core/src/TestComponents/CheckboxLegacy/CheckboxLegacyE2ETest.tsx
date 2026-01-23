import * as React from 'react';
import { View } from 'react-native';

import { Checkbox, Text } from '@fluentui/react-native';
import {
  CHECKBOX_TEST_COMPONENT,
  CHECKBOX_ON_PRESS,
  CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  CHECKBOX_TEST_COMPONENT_LABEL,
  CHECKBOX_ACCESSIBILITY_LABEL,
} from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const CheckboxLegacyE2ETest: React.FunctionComponent = () => {
  const [checkboxPressed, setCheckboxPressed] = React.useState(false);

  const onClick = React.useCallback(
    (checked) => {
      setCheckboxPressed(checked);
    },
    [setCheckboxPressed],
  );

  return (
    <View>
      <Stack style={stackStyle}>
        <Checkbox
          accessibilityLabel={CHECKBOX_ACCESSIBILITY_LABEL}
          disabled={false}
          label="Testing accessibilityLabel"
          onChange={onClick}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(CHECKBOX_TEST_COMPONENT)}
        />
        <Checkbox
          label={CHECKBOX_TEST_COMPONENT_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(CHECKBOX_NO_A11Y_LABEL_COMPONENT)}
        />
        {checkboxPressed ? (
          <Text /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(CHECKBOX_ON_PRESS)}
          >
            Checkbox Selected
          </Text>
        ) : null}
      </Stack>
    </View>
  );
};
