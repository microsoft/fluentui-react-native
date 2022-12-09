import { Checkbox, Text } from '@fluentui/react-native';
import * as React from 'react';
import { View } from 'react-native';
import { stackStyle } from '../../Common/styles';
import {
  CHECKBOX_TEST_COMPONENT_LEGACY,
  CHECKBOX_ON_PRESS_LEGACY,
  CHECKBOX_NO_A11Y_LABEL_COMPONENT_LEGACY,
  CHECKBOX_TEST_COMPONENT_LABEL_LEGACY,
  CHECKBOX_ACCESSIBILITY_LABEL_LEGACY,
} from './../consts';
import { Stack } from '@fluentui-react-native/stack';

export const E2ECheckboxTest_legacy: React.FunctionComponent = () => {
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
          accessibilityLabel={CHECKBOX_ACCESSIBILITY_LABEL_LEGACY}
          disabled={false}
          label="Testing accessibilityLabel"
          testID={CHECKBOX_TEST_COMPONENT_LEGACY}
          onChange={onClick}
        />
        <Checkbox label={CHECKBOX_TEST_COMPONENT_LABEL_LEGACY} testID={CHECKBOX_NO_A11Y_LABEL_COMPONENT_LEGACY} />
        {checkboxPressed ? <Text testID={CHECKBOX_ON_PRESS_LEGACY}>Checkbox Selected</Text> : null}
      </Stack>
    </View>
  );
};
