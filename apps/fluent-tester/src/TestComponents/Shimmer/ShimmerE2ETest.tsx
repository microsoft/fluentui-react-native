import * as React from 'react';
import { Shimmer } from '@fluentui-react-native/experimental-shimmer';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { shimmerRectsAndRect } from './ShimmerTestElementSets';
import { SHIMMER_TEST_COMPONENT } from './consts';
import { testProps } from '../Common/TestProps';

export const E2ETestingShimmer: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer
        elements={shimmerRectsAndRect()}
        duration={2000}
        delay={1000}
        style={{ width: 300, height: 100 }}
        {...testProps(SHIMMER_TEST_COMPONENT)}
      />
    </Stack>
  );
};
