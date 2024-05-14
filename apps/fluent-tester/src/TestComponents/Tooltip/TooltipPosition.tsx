import * as React from 'react';
import { View } from 'react-native';

import { ButtonV1 } from '@fluentui-react-native/button';
import { Tooltip } from '@fluentui-react-native/tooltip';

export const TooltipPosition: React.FunctionComponent = () => {
  const topCenterRef = React.useRef<View>(null);

  return (
    <View>
      {/* In Progress - Implementation for custom positioning and anchoring is not completed in the native module. */}
      <Tooltip content="Test" positioning="topCenter" target={topCenterRef}>
        <ButtonV1 componentRef={topCenterRef}>Target + TopCenter</ButtonV1>
      </Tooltip>
      <Tooltip content="Test" positioning="topCenter" target={'test'}>
        <ButtonV1 nativeID={'test'}>Target + TopCenter</ButtonV1>
      </Tooltip>
      {/* Adding more tests as follow-up*/}
    </View>
  );
};
