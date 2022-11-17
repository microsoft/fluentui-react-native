import React, { useMemo } from 'react';
import { FontIcon, SvgIcon, Icon } from '@fluentui-react-native/experimental-icon';
import { Text, View } from 'react-native';
import TestSvg from './assets/test.svg';
import { SvgIconProps } from '@fluentui-react-native/experimental-icon';

const fontBuiltInProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 100,
  color: '#f09',
};

const svgUriProps: SvgIconProps = {
  uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
  viewBox: '0 0 1000 1000',
  width: 100,
  height: 100,
};

const svgSrcProps: SvgIconProps = {
  viewBox: '0 0 500 500',
  src: TestSvg,
  width: 72,
  height: 72,
};

export const IconExperimental: React.FunctionComponent = () => {
  const svgSource = useMemo(
    () => ({
      color: 'lightgreen',
      ...svgSrcProps,
    }),
    [],
  );
  const fontSource = useMemo(
    () => ({
      ...fontBuiltInProps,
      color: 'lightskyblue',
    }),
    [],
  );

  return (
    <View>
      <Text>Icon component</Text>
      <Icon svgSource={svgSource} />
      <Icon svgSource={svgUriProps} />
      <Icon fontSource={fontSource} />

      <Text>SVG</Text>
      <SvgIcon color="green" {...svgSrcProps} />

      <Text>FontIcon</Text>
      <FontIcon {...fontBuiltInProps} />
    </View>
  );
};
