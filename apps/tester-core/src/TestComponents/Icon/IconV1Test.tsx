import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import type { FontIconPropsV1, SvgIconPropsV1 } from '@fluentui-react-native/icon';
import { FontIcon, SvgIcon, IconV1 } from '@fluentui-react-native/icon';

import TestSvg from '../../../assets/test.svg';

const fontBuiltInProps: FontIconPropsV1 = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 100,
  color: '#f09',
};

const svgUriProps: SvgIconPropsV1 = {
  uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
  viewBox: '0 0 1000 1000',
  width: 100,
  height: 100,
  accessibilityLabel: 'Just another example',
};

const svgSrcProps: SvgIconPropsV1 = {
  viewBox: '0 0 500 500',
  src: TestSvg,
  width: 72,
  height: 72,
  accessibilityLabel: 'Wheelchair',
};

export const IconV1Test: React.FunctionComponent = () => {
  const svgSource = useMemo(
    () => ({
      color: 'lightgreen',
      ...svgSrcProps,
      accessibilityLabel: 'Wheelchair',
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
      <IconV1 svgSource={svgSource} />
      <IconV1 svgSource={svgUriProps} />
      <IconV1 fontSource={fontSource} />

      <Text>SVG</Text>
      <SvgIcon color="green" {...svgSrcProps} />

      <Text>FontIcon</Text>
      <FontIcon {...fontBuiltInProps} />
    </View>
  );
};
