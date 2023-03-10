import * as React from 'react';
import { View } from 'react-native';

import { Input } from '@fluentui-react-native/input';

export const InputDefault: React.FunctionComponent = () => {
  return (
    <View>
      <Input label="Label" assistiveText="Assistive Text" secondaryText="Secondary" />
    </View>
  );
};
