import * as React from 'react';

import { Stack } from '@fluentui-react-native/stack';

import { Drawer } from '../../../../../packages/experimental/Drawer/lib';
import { stackStyle } from '../Common/styles';
export const E2EDrawerTest: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Drawer />
    </Stack>
  );
};
