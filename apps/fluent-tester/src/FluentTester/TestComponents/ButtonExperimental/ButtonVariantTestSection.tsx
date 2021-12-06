import { Button, CompoundButton, FAB } from '@fluentui-react-native/experimental-button';
import * as React from 'react';
import { View } from 'react-native';
import { commonTestStyles, stackStyle } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from './test.svg';

export const ButtonVariantTest: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  return (
    <View style={[stackStyle, commonTestStyles.view]}>
      <Button style={commonTestStyles.vmargin}>Default</Button>
      <Button appearance="primary" style={commonTestStyles.vmargin}>
        Primary
      </Button>
      <Button appearance="subtle" style={commonTestStyles.vmargin}>
        Subtle
      </Button>
      <Button block style={commonTestStyles.vmargin}>
        Block
      </Button>
      <Button appearance="primary" block style={commonTestStyles.vmargin}>
        Block Primary
      </Button>
      <Button appearance="subtle" block style={commonTestStyles.vmargin}>
        Block Subtle
      </Button>
      <CompoundButton content="Default" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton appearance="primary" content="Primary" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <CompoundButton appearance="subtle" content="Subtle" secondaryContent="Compound" style={commonTestStyles.vmargin} />
      <FAB icon={{ svgSource: svgProps, width: 20, height: 20 }} style={commonTestStyles.vmargin} />
      <FAB icon={{ svgSource: svgProps, width: 20, height: 20 }} content="FAB" style={commonTestStyles.vmargin} />
    </View>
  );
};
