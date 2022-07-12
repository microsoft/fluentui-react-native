import * as React from 'react';
import { Platform, View } from 'react-native';
import { FAB, Text } from '@fluentui/react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import { svgProps } from '../Common/iconExamples';

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  if (Platform.OS === 'ios') {
    const iconProps = { svgSource: svgProps, width: 20, height: 20 };
    return (
      <View style={stackStyle}>
        <FAB style={commonTestStyles.vmargin} icon={iconProps}>
          FAB
        </FAB>
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
