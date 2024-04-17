import * as React from 'react';
import { View } from 'react-native';

import { ButtonV1 } from '@fluentui-react-native/button';
import { Tooltip } from '@fluentui-react-native/tooltip';

export const TooltipDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Tooltip content="Tooltip shows relative to mouse cursor.">
        <ButtonV1>Default Tooltip</ButtonV1>
      </Tooltip>
    </View>
  );
};
