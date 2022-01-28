import { ButtonV2 as Button, CompoundButton } from '@fluentui-react-native/button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';

export const ButtonShapeTest: React.FunctionComponent = () => {
  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button shape="rounded" style={commonTestStyles.vmargin}>
        Default Rounded Button
      </Button>
      <Button shape="square" style={commonTestStyles.vmargin}>
        Square Button
      </Button>
      <Button shape="circular" style={commonTestStyles.vmargin}>
        Circular Button
      </Button>
      <Button appearance="primary" shape="rounded" style={commonTestStyles.vmargin}>
        Primary Rounded Button
      </Button>
      <Button appearance="primary" shape="square" style={commonTestStyles.vmargin}>
        Square Button
      </Button>
      <Button appearance="primary" shape="circular" style={commonTestStyles.vmargin}>
        Circular Button
      </Button>
      <CompoundButton secondaryContent="rounded" shape="rounded" style={commonTestStyles.vmargin}>
        Compound Button
      </CompoundButton>
      <CompoundButton secondaryContent="square" shape="square" style={commonTestStyles.vmargin}>
        Compound Button
      </CompoundButton>
      <CompoundButton secondaryContent="circular" shape="circular" style={commonTestStyles.vmargin}>
        Compound Button
      </CompoundButton>
    </View>
  );
};
