import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../Common/styles';
import {
  CHECKBOXV1_TEST_COMPONENT,
  CHECKBOXV1_ACCESSIBILITY_LABEL,
  CHECKBOXV1_NO_A11Y_LABEL_COMPONENT,
  CHECKBOXV1_TEST_COMPONENT_LABEL,
  CHECKBOXV1_ON_PRESS,
} from '../../../../E2E/src/CheckboxV1/consts';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui/react-native';

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
          testID={CHECKBOXV1_TEST_COMPONENT}
          onChange={onClick}
        />
        <Checkbox label={CHECKBOXV1_TEST_COMPONENT_LABEL} testID={CHECKBOXV1_NO_A11Y_LABEL_COMPONENT} />
        {checkboxPressed ? <Text testID={CHECKBOXV1_ON_PRESS}>Checkbox Selected</Text> : null}
      </Stack>
    </View>
  );
};
