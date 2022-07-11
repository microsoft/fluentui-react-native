import * as React from 'react';
import { Platform, View } from 'react-native';
import { ButtonV1 as Button, FAB } from '@fluentui/react-native';
import { commonTestStyles } from '../Common/styles';
import { svgProps } from '../Common/iconExamples';

export const ShadowButtonTestSection: React.FunctionComponent = () => {
  if (Platform.OS === 'macos') {
    return (
      <View style={{ padding: 24, margin: 16 }}>
        <Button style={commonTestStyles.vmargin}>Default Button: has shadow by default</Button>
        <Button style={commonTestStyles.vmargin} appearance="primary">
          Primary Button: does not have shadow by default
        </Button>
        <Button style={commonTestStyles.vmargin} appearance="subtle">
          Subtle Button: does not have shadow by default
        </Button>
      </View>
    );
  } else if (Platform.OS === 'ios') {
    return (
      <View style={{ padding: 24, margin: 16 }}>
        <FAB style={commonTestStyles.vmargin} icon={{ svgSource: svgProps, width: 20, height: 20 }}>
          FAB
        </FAB>
      </View>
    );
  } else {
    return null;
  }
};
