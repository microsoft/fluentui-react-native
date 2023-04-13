import * as React from 'react';
import { View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui/react-native';

import { testImage, svgProps } from '../Common/iconExamples';
import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';

export const ButtonIconTest: React.FunctionComponent = () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 24,
  };

  return (
    <View style={testContentRootViewStyle}>
      <Button icon={{ fontSource: fontBuiltInProps }} style={commonTestStyles.vmargin}>
        Font icon
      </Button>
      <Button appearance="accent" icon={{ svgSource: svgProps, color: 'black' }} style={commonTestStyles.vmargin}>
        SVG
      </Button>
      <Button icon={testImage} style={commonTestStyles.vmargin}>
        PNG
      </Button>
    </View>
  );
};
