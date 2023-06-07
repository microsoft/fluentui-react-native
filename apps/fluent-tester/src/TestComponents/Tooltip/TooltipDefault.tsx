import { Tooltip } from '@fluentui-react-native/tooltip';
import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@fluentui-react-native/experimental-button';

export const TooltipDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Tooltip content="Test">
        <Button>Test</Button>
      </Tooltip>
    </View>
  );
};
