import React from 'react';
import { FontIcon, SvgIcon, Icon } from '@fluentui-react-native/experimental-icon';
import { Text, View } from 'react-native';
import TestSvg from './assets/test.svg';
import { SvgIconProps } from '@fluentui-react-native/icon';

const fontBuiltInProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 32,
};

export const IconExperimental: React.FunctionComponent = () => {
  const svgProps: SvgIconProps = {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
    viewBox: '0 0 1000 1000',
  };
  return (
    <View>
      <Text>Icon component</Text>
      <Icon svgSource={{ width: 100, height: 100, color: 'purple', viewBox: '0 0 500 500', src: TestSvg }} />
      <Icon svgSource={{ width: 100, height: 100, ...svgProps }} />
      <Icon fontSource={{ ...fontBuiltInProps, color: 'purple' }} />

      <Text>SVG</Text>
      <SvgIcon width={72} height={72} color="green" viewBox="0 0 500 500" src={TestSvg} />

      <Text>FontIcon</Text>
      <FontIcon fontFamily="Arial" codepoint={0x2663} fontSize={200} color="#f09" />
      <FontIcon fontFamily="Arial" codepoint={0x2663} color="red" />
    </View>
  );
};
