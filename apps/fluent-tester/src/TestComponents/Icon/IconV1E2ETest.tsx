 
import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@fluentui/react-native';
import {
  ICON_ACCESSIBILITY_LABEL,
  ICON_TEST_COMPONENT,
  ICON_FONT_TEST_COMPONENT,
  ICON_SVG_TEST_COMPONENT,
} from '@fluentui-react-native/e2e-testing';
import type { FontIconPropsV1, SvgIconPropsV1 } from '@fluentui-react-native/icon';
import { FontIcon, SvgIcon, IconV1 } from '@fluentui-react-native/icon';

import TestSvg from '../../../assets/test.svg';

const fontBuiltInProps: FontIconPropsV1 = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 100,
  color: '#f09',
  testID: ICON_FONT_TEST_COMPONENT,
  accessibilityLabel: ICON_ACCESSIBILITY_LABEL,
};

const svgUriProps: SvgIconPropsV1 = {
  uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
  viewBox: '0 0 1000 1000',
  width: 100,
  height: 100,
  accessibilityLabel: ICON_ACCESSIBILITY_LABEL,
  testID: ICON_TEST_COMPONENT,
};

const svgSrcProps: SvgIconPropsV1 = {
  viewBox: '0 0 500 500',
  src: TestSvg,
  width: 72,
  height: 72,
  testID: ICON_SVG_TEST_COMPONENT,
  accessibilityLabel: ICON_ACCESSIBILITY_LABEL,
};

export const IconV1E2ETest: React.FunctionComponent = () => {
  return (
    <View>
      <Text>Icon component</Text>
      <IconV1 svgSource={svgUriProps} />

      <Text>SVG</Text>
      <SvgIcon {...svgSrcProps} />

      <Text>FontIcon</Text>
      <FontIcon {...fontBuiltInProps} />
    </View>
  );
};
