import { Checkbox, Text } from '@fluentui/react-native';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import {
  CHECKBOX_TEST_COMPONENT,
  CHECKBOX_ON_PRESS,
  CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  CHECKBOX_TEST_COMPONENT_LABEL,
  CHECKBOX_ACCESSIBILITY_LABEL,
} from './consts';
import { Stack } from '@fluentui-react-native/stack';

export const E2ECheckboxTest: React.FunctionComponent = () => {
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
          testID={CHECKBOX_TEST_COMPONENT}
          onChange={onClick}
        />
        <Checkbox label={CHECKBOX_TEST_COMPONENT_LABEL} testID={CHECKBOX_NO_A11Y_LABEL_COMPONENT} />
        {checkboxPressed ? <Text testID={CHECKBOX_ON_PRESS}>Checkbox Selected</Text> : null}
      </Stack>
    </View>
  );
};
