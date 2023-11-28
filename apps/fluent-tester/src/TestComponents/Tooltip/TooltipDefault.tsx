import * as React from 'react';
import { View } from 'react-native';

import { Button } from '@fluentui-react-native/experimental-button';
import { Tooltip } from '@fluentui-react-native/tooltip';

export const TooltipDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Tooltip content="Test">
        <Button>Test</Button>
      </Tooltip>
      <Tooltip content="Test 2">
        <Button>Test 2</Button>
      </Tooltip>
      <Tooltip content="Test 3">
        <Button>Test 3</Button>
      </Tooltip>
      <Tooltip content="Test 4">
        <Button>Test 4</Button>
      </Tooltip>
    </View>
  );
};
