/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { Icon, IRasterImageIconProps, ISvgIconProps, IFontIconProps } from '@fluentui/react-native';

const testImage = require('./assets/testicon.png');
const testTtf = require('./assets/Font Awesome 5 Free-Solid-900.otf');
import TestSvg from './assets/test.svg';

export const IconTest: React.FunctionComponent<{}> = () => {
  const rasterProps: IRasterImageIconProps = { src: testImage };

  const svgProps: ISvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
    color: 'purple',
  };

  const svgUriProps: ISvgIconProps = {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
    viewBox: '0 0 100 100',
    color: 'purple',
  };

  const fontProps: IFontIconProps = {
    fontFamily: `Font Awesome 5 Free`,
    fontSrcFile: testTtf,
    codepoint: 0xf083,
    fontSize: 32,
    color: 'green',
  };

  const keys: string = '';

  Object.keys(testTtf).forEach((key) => keys.concat(key));
  return (
    <View>
      <Text>pat3 {JSON.stringify(fontProps, null, 2)}</Text>
      <Icon fontSource={fontProps} width={100} height={100} />

      <Icon svgSource={svgProps} width={100} height={100} />

      <Icon svgSource={svgUriProps} width={100} height={100} />

      <Icon rasterImageSource={rasterProps} width={100} height={100} />
    </View>
  );
};
