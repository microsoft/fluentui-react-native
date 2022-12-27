import { Button, CompoundButton, FAB } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { iconProps } from '../Common/iconExamples';
import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';

// Test also pulls button from deprecated package to ensure it's still working
export const ButtonVariantTest: React.FunctionComponent = () => {
  return (
    <View style={testContentRootViewStyle}>
      <Button style={commonTestStyles.vmargin}>Default</Button>
      <Button disabled style={commonTestStyles.vmargin}>
        Default Disabled
      </Button>
      <Button appearance="primary" style={commonTestStyles.vmargin}>
        Primary
      </Button>
      <Button disabled appearance="primary" style={commonTestStyles.vmargin}>
        Primary Disabled
      </Button>
      <Button appearance="subtle" style={commonTestStyles.vmargin}>
        Subtle
      </Button>
      <Button loading>Loading Button</Button>
      <Button block style={commonTestStyles.vmargin}>
        Block
      </Button>
      <Button appearance="primary" block style={commonTestStyles.vmargin}>
        Block Primary
      </Button>
      <Button appearance="subtle" block style={commonTestStyles.vmargin}>
        Block Subtle
      </Button>
      <CompoundButton secondaryContent="Compound" style={commonTestStyles.vmargin}>
        Default
      </CompoundButton>
      <CompoundButton appearance="primary" secondaryContent="Compound" style={commonTestStyles.vmargin}>
        Primary
      </CompoundButton>
      <CompoundButton appearance="subtle" secondaryContent="Compound" style={commonTestStyles.vmargin}>
        Subtle
      </CompoundButton>
      <FAB icon={iconProps} style={commonTestStyles.vmargin}>
        FAB
      </FAB>
    </View>
  );
};
