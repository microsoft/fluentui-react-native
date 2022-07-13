import * as React from 'react';
import { Platform, View } from 'react-native';
import { FAB, Text } from '@fluentui/react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

const CustomFABNoShadow = FAB.customize({ shadowDepth: undefined });
const CustomFABShadow64 = FAB.customize({ shadowDepth: 'shadow64' });

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  if (Platform.OS === 'ios') {
    return (
      <View style={stackStyle}>
        <FAB style={commonTestStyles.vmargin}>FAB with default shadow</FAB>
        <CustomFABShadow64 style={commonTestStyles.vmargin}>Custom FAB with shadow64</CustomFABShadow64>
        <CustomFABNoShadow style={commonTestStyles.vmargin}>Custom FAB with no shadow</CustomFABNoShadow>
      </View>
    );
  } else {
    return (
      <View style={stackStyle}>
        <Text>Shadows only implemented for iOS at this time</Text>
      </View>
    );
  }
};
