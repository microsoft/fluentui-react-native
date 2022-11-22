import { ButtonV1 as Button } from '@fluentui/react-native';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { commonTestStyles, testContentRootViewStyle } from '../Common/styles';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from './test.svg';

export const ButtonIconTest: React.FunctionComponent = () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 24,
  };

  /* eslint-disable @typescript-eslint/no-var-requires */
  const testImage = require('../../../../assets/icon_24x24.png');

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };
  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={testContentRootViewStyle}>
      <Button icon={{ fontSource: fontBuiltInProps }} style={commonTestStyles.vmargin}>
        Font icon
      </Button>
      {svgIconsEnabled && (
        <>
          <Button appearance="accent" icon={{ svgSource: svgProps, color: 'red' }} style={commonTestStyles.vmargin}>
            SVG
          </Button>
        </>
      )}
      <Button icon={testImage} style={commonTestStyles.vmargin}>
        PNG
      </Button>
    </View>
  );
};
