import { Button, CompoundButton, ToggleButton, FAB } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button style={commonTestStyles.vmargin}>Text</Button>
      <Button appearance="primary" style={commonTestStyles.vmargin}>
        Text
      </Button>
      <CompoundButton secondaryContent="A second line" style={commonTestStyles.vmargin}>
        Text
      </CompoundButton>
      <CompoundButton appearance="primary" secondaryContent="A second line" style={commonTestStyles.vmargin}>
        Text
      </CompoundButton>
      <ToggleButton style={commonTestStyles.vmargin}>Text</ToggleButton>
      <ToggleButton checked={true} style={commonTestStyles.vmargin}>
        Text
      </ToggleButton>
      <FAB style={commonTestStyles.vmargin}>Text</FAB>
    </View>
  );
};
