import * as React from 'react';

import { SHIMMER_TEST_COMPONENT } from '@fluentui-react-native/e2e-testing';
import { Shimmer } from '@fluentui-react-native/experimental-shimmer';
import { Stack } from '@fluentui-react-native/stack';

import { shimmerRectsAndRect } from './ShimmerTestElementSets';
import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const E2ETestingShimmer: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer
        elements={shimmerRectsAndRect()}
        duration={2000}
        delay={1000}
        style={{ width: 300, height: 100 }}
        /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
        {...testProps(SHIMMER_TEST_COMPONENT)}
      />
    </Stack>
  );
};
