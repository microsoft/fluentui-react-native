import * as React from 'react';
import { View } from 'react-native';

import { Button } from '@fluentui-react-native/experimental-button';
import { Tooltip } from '@fluentui-react-native/tooltip';

export const TooltipPosition: React.FunctionComponent = () => {
  const topCenterRef = React.useRef<View>(null);

  return (
    <View>
      <Tooltip content="Test" positioning="topCenter">
        <Button>No Target + TopCenter</Button>
      </Tooltip>
      <Tooltip content="Test" positioning="topCenter" target={topCenterRef}>
        <Button componentRef={topCenterRef}>Target + TopCenter</Button>
      </Tooltip>
      {/* Adding more tests as follow-up*/}
    </View>
  );
};
