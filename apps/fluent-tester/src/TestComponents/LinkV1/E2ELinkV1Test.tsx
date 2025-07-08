import * as React from 'react';

import { LinkV1 as Link } from '@fluentui/react-native';
import {
  LINKV1_TEST_COMPONENT,
  LINKV1_ACCESSIBILITY_LABEL,
  LINKV1_NO_A11Y_LABEL_COMPONENT,
  LINKV1_TEST_COMPONENT_LABEL,
} from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const E2ELinkV1Test: React.FunctionComponent = () => {
  const doPress = (): void => {
    console.log('Link pressed');
  };

  return (
    <Stack style={stackStyle}>
      <Link
        url="https://www.bing.com/"
        accessibilityLabel={LINKV1_ACCESSIBILITY_LABEL}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(LINKV1_TEST_COMPONENT)}
      >
        Link with Accessibility Label
      </Link>
      <Link
        onPress={doPress} /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(LINKV1_NO_A11Y_LABEL_COMPONENT)}
      >
        {LINKV1_TEST_COMPONENT_LABEL}
      </Link>
    </Stack>
  );
};
