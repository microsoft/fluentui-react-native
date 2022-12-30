import * as React from 'react';
import { Alert } from 'react-native';
import { Link } from '@fluentui-react-native/experimental-link';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_LINK_TEST_COMPONENT,
  EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_LINK_TEST_COMPONENT_LABEL,
} from '../../../../E2E/src/LinkV1/consts';

export const LinkE2ETest: React.FunctionComponent = () => {
  const doPress = (): void => {
    Alert.alert('Alert.', 'You have been alerted.');
  };

  return (
    <Stack style={stackStyle}>
      <Link
        url="https://www.bing.com/"
        testID={EXPERIMENTAL_LINK_TEST_COMPONENT}
        accessibilityLabel={EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL}
      >
        Link with Accessibility Label
      </Link>
      <Link onPress={doPress} testID={EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT}>
        {EXPERIMENTAL_LINK_TEST_COMPONENT_LABEL}
      </Link>
    </Stack>
  );
};
