import * as React from 'react';

import { SPINNER_TEST_COMPONENT } from '@fluentui-react-native/e2e-testing';
import { Spinner } from '@fluentui-react-native/spinner';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const E2ETestingSpinner: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Spinner
        size="large"
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(SPINNER_TEST_COMPONENT)}
      />
    </Stack>
  );
};
