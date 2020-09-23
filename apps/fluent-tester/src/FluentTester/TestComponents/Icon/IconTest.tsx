/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Icon, IRasterImageIconProps, ISvgIconProps, IFontIconProps} from '@fluentui-react-native/icon';


const testImage = require('./assets/testicon.png');
const testTtf = require('./assets/Font Awesome 5 Free-Solid-900.otf');
import TestSvg from './assets/test.svg';

export const IconTest: React.FunctionComponent<{}> = () => {
  const rasterProps: IRasterImageIconProps = { src: testImage };

  const svgProps: ISvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500'
  };

  const svgUriProps: ISvgIconProps = {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
    viewBox: '0 0 100 100'
  };

  const fontProps: IFontIconProps = {
    fontFamily: `Font Awesome 5 Free`,
    fontSrcFile: testTtf,
    codepoint: 0xf083,
    fontSize: 32,
  };

  return (
    <View>
      <Text>Font icon</Text>
      <Icon fontSource={fontProps} width={100} height={100} color='purple'/>
      <Text>Svg icons</Text>
      <Icon svgSource={svgProps} width={100} height={100} color="yellow" />
      <Icon svgSource={svgUriProps} width={100} height={100}  color="red"/>
      <Text>Raster icon</Text>
      <Icon rasterImageSource={rasterProps} width={100} height={100}  color="green"/>
    </View>
  );
};
