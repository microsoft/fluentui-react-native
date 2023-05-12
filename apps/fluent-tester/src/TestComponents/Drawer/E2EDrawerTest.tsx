import * as React from 'react';

import { Drawer } from '@fluentui-react-native/drawer';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../Common/styles';
export const E2EDrawerTest: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Drawer />
    </Stack>
  );
};
