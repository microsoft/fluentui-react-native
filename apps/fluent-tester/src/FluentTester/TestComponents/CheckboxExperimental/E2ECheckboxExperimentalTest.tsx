import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT,
  EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_CHECKBOX_ON_PRESS,
} from './consts';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui/react-native';

export const E2ECheckboxExperimentalTest: React.FunctionComponent = () => {
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
          accessibilityLabel={EXPERIMENTAL_CHECKBOX_ACCESSIBILITY_LABEL}
          disabled={false}
          label="Testing accessibilityLabel"
          testID={EXPERIMENTAL_CHECKBOX_TEST_COMPONENT}
          onChange={onClick}
        />
        <Checkbox label={EXPERIMENTAL_CHECKBOX_TEST_COMPONENT_LABEL} testID={EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT} />
        {checkboxPressed ? <Text testID={EXPERIMENTAL_CHECKBOX_ON_PRESS}>Checkbox Selected</Text> : null}
      </Stack>
    </View>
  );
};
