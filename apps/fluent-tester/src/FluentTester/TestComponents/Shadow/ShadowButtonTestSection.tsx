import * as React from 'react';
import { View } from 'react-native';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { commonTestStyles } from '../Common/styles';

export const ShadowButtonTestSection: React.FunctionComponent = () => {
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
};
