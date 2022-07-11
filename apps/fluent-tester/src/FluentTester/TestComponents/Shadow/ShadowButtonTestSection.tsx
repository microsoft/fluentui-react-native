import * as React from 'react';
import { Platform, View } from 'react-native';
import { FAB } from '@fluentui/react-native';
import { commonTestStyles } from '../Common/styles';
import { svgProps } from '../Common/iconExamples';

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  if (Platform.OS === 'ios') {
    const iconProps = { svgSource: svgProps, width: 20, height: 20 };
    return (
      <View style={{ padding: 24, margin: 16 }}>
        <FAB style={commonTestStyles.vmargin} icon={iconProps}>
          FAB
        </FAB>
      </View>
    );
  } else {
    return null;
  }
};
