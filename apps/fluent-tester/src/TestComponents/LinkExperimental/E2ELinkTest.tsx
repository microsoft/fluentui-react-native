import * as React from 'react';
import { LinkV1 as Link } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_LINK_TEST_COMPONENT,
  EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_LINK_TEST_COMPONENT_LABEL,
} from '../../../../E2E/src/LinkExperimental/consts';
import { testProps } from '../Common/TestProps';

export const LinkE2ETest: React.FunctionComponent = () => {
  const doPress = (): void => {
    console.log('Link pressed');
  };

  return (
    <Stack style={stackStyle}>
      <Link
        url="https://www.bing.com/"
        accessibilityLabel={EXPERIMENTAL_LINK_ACCESSIBILITY_LABEL}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(EXPERIMENTAL_LINK_TEST_COMPONENT)}
      >
        Link with Accessibility Label
      </Link>
      <Link
        onPress={doPress}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT)}
      >
        {EXPERIMENTAL_LINK_TEST_COMPONENT_LABEL}
      </Link>
    </Stack>
  );
};
