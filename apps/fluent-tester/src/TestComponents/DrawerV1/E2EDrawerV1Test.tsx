import * as React from 'react';

import { DrawerV1 } from '@fluentui-react-native/drawer';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
export const E2EDrawerV1Test: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <DrawerV1 />
    </Stack>
  );
};
