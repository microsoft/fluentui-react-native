import * as React from 'react';
import { View } from 'react-native';

import { ButtonV1 } from '@fluentui-react-native/button';
import { Tooltip } from '@fluentui-react-native/tooltip';

export const TooltipDefault: React.FunctionComponent = () => {
  const defaultContent = 'Tooltip shows relative to mouse cursor.';
  return (
    <View>
      <Tooltip content={defaultContent}>
        <ButtonV1 accessibilityDescription={defaultContent}>Default Tooltip</ButtonV1>
      </Tooltip>
    </View>
  );
};
