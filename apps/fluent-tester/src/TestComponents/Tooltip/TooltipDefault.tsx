import * as React from 'react';
import { View } from 'react-native';

import { Button } from '@fluentui-react-native/experimental-button';
import { Tooltip } from '@fluentui-react-native/tooltip';

export const TooltipDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Tooltip content="Tooltip should show under mouse cursor.">
        <Button>Test</Button>
      </Tooltip>
    </View>
  );
};
