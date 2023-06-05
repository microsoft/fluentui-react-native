import * as React from 'react';
import { View } from 'react-native';

import { Button } from '@fluentui-react-native/experimental-button';

import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';

export const ButtonVariantTest: React.FunctionComponent = () => {
  return (
    <View style={testContentRootViewStyle}>
      <Button style={commonTestStyles.vmargin}>Default</Button>
      <Button disabled style={commonTestStyles.vmargin}>
        Default Disabled
      </Button>
      <Button appearance="accent" style={commonTestStyles.vmargin}>
        Accent
      </Button>
      <Button disabled appearance="accent" style={commonTestStyles.vmargin}>
        Accent Disabled
      </Button>
      <Button appearance="outline" style={commonTestStyles.vmargin}>
        Outline
      </Button>
      <Button appearance="outline" disabled style={commonTestStyles.vmargin}>
        Outline Disabled
      </Button>
      <Button appearance="subtle" style={commonTestStyles.vmargin}>
        Subtle
      </Button>
      <Button appearance="subtle" disabled style={commonTestStyles.vmargin}>
        Subtle Disabled
      </Button>
    </View>
  );
};
