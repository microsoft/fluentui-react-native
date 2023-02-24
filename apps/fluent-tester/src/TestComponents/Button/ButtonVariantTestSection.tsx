import * as React from 'react';
import { View, Text } from 'react-native';

import { testContentRootViewStyle } from '../Common/styles';

// Test also pulls button from deprecated package to ensure it's still working
export const ButtonVariantTest: React.FunctionComponent = () => {
  return (
    <View style={testContentRootViewStyle}>
      <View style={{ height: 32, width: 64, borderWidth: 1, borderColor: 'black', flexDirection: 'row', alignSelf: 'baseline' }}>
        <View style={{ borderWidth: 1, borderColor: 'white', backgroundColor: 'navy' }}>
          <Text style={{ color: 'white' }}>Testing</Text>
        </View>
      </View>
    </View>
  );
};
