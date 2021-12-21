import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT,
  EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
} from './consts';
import { Stack } from '@fluentui-react-native/stack';

export const E2ECheckboxExperimentalTest: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle}>
        <Checkbox
          accessibilityLabel={EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL}
          disabled={false}
          label="Testing accessibilityLabel"
          testID={EXPERIMENTAL_CHECKBOX_TEST_COMPONENT}
        />
        <Checkbox label={EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL} testID={EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT} />
      </Stack>
    </View>
  );
};
