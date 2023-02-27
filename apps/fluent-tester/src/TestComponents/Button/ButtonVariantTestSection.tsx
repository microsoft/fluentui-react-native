import * as React from 'react';
import { View, Text } from 'react-native';

import { testContentRootViewStyle } from '../Common/styles';

// Test also pulls button from deprecated package to ensure it's still working
export const ButtonVariantTest: React.FunctionComponent = () => {
  return (
    <View style={testContentRootViewStyle}>
      <View style={{ borderWidth: 1, borderColor: 'black', flexDirection: 'row', backgroundColor: 'red', alignSelf: 'baseline' }}>
        <View style={{ borderWidth: 1, borderColor: 'white', backgroundColor: 'navy', minHeight: 28, minWidth: 60 }}>
          <Text style={{ color: 'white' }}>Testing</Text>
        </View>
      </View>
    </View>
  );
};
