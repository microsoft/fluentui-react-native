import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@fluentui/react-native';
import {
  CHECKBOXV1_TEST_COMPONENT,
  CHECKBOXV1_ACCESSIBILITY_LABEL,
  CHECKBOXV1_NO_A11Y_LABEL_COMPONENT,
  CHECKBOXV1_TEST_COMPONENT_LABEL,
  CHECKBOXV1_ON_PRESS,
} from '@fluentui-react-native/e2e-testing';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const E2ECheckboxV1Test: React.FunctionComponent = () => {
  const [checkboxPressed, setCheckboxPressed] = React.useState(false);

  const onClick = React.useCallback(
    (_e, checked) => {
      setCheckboxPressed(checked);
    },
    [setCheckboxPressed],
  );

  return (
    <View>
      <Stack style={stackStyle}>
        <Checkbox
          accessibilityLabel={CHECKBOXV1_ACCESSIBILITY_LABEL}
          disabled={false}
          label="Testing accessibilityLabel"
          onChange={onClick}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(CHECKBOXV1_TEST_COMPONENT)}
        />
        <Checkbox
          label={CHECKBOXV1_TEST_COMPONENT_LABEL}
          required
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(CHECKBOXV1_NO_A11Y_LABEL_COMPONENT)}
        />
        {checkboxPressed ? (
          <Text
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(CHECKBOXV1_ON_PRESS)}
          >
            Checkbox Selected
          </Text>
        ) : null}
      </Stack>
    </View>
  );
};
