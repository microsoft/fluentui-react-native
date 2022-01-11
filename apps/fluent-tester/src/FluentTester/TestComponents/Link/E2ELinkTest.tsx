import * as React from 'react';
import { Alert } from 'react-native';
import { Link } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { LINK_TEST_COMPONENT, LINK_ACCESSIBILITY_LABEL, LINK_NO_A11Y_LABEL_COMPONENT, LINK_TEST_COMPONENT_LABEL } from './consts';

export const LinkE2ETest: React.FunctionComponent = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  return (
    <Stack style={stackStyle}>
      <Link
        url="https://www.bing.com/"
        content="Link with Accessibility Label."
        testID={LINK_TEST_COMPONENT}
        accessibilityLabel={LINK_ACCESSIBILITY_LABEL}
      />
      <Link url="https://www.bing.com/" onPress={doPress} content={LINK_TEST_COMPONENT_LABEL} testID={LINK_NO_A11Y_LABEL_COMPONENT} />
    </Stack>
  );
};
