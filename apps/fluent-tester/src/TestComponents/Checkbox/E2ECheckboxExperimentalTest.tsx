import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import {
  CHECKBOX_V1_TEST_COMPONENT,
  CHECKBOX_V1_ACCESSIBILITY_LABEL,
  CHECKBOX_V1_NO_A11Y_LABEL_COMPONENT,
  CHECKBOX_V1_TEST_COMPONENT_LABEL,
  CHECKBOX_V1_ON_PRESS,
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
          accessibilityLabel={CHECKBOX_V1_ACCESSIBILITY_LABEL}
          disabled={false}
          label="Testing accessibilityLabel"
          testID={CHECKBOX_V1_TEST_COMPONENT}
          onChange={onClick}
        />
        <Checkbox label={CHECKBOX_V1_TEST_COMPONENT_LABEL} testID={CHECKBOX_V1_NO_A11Y_LABEL_COMPONENT} />
        {checkboxPressed ? <Text testID={CHECKBOX_V1_ON_PRESS}>Checkbox Selected</Text> : null}
      </Stack>
    </View>
  );
};
