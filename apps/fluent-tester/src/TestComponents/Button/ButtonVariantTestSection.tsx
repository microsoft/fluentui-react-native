import { ButtonV1 } from '@fluentui-react-native/button';
import * as React from 'react';
import { View } from 'react-native';

import { testContentRootViewStyle } from '../Common/styles';

// Test also pulls button from deprecated package to ensure it's still working
export const ButtonVariantTest: React.FunctionComponent = () => {
  return (
    <View style={testContentRootViewStyle}>
      <ButtonV1 appearance="primary">A test</ButtonV1>
    </View>
  );
};
