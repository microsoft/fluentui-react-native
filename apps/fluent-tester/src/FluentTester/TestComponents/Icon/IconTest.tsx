/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui/react-native';
import { Icon, RasterImageIconProps, SvgIconProps, FontIconProps } from '@fluentui-react-native/icon';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ICON_TESTPAGE } from './consts';

const testImage = require('./assets/testicon.png');
const testTtf = require('./assets/Font Awesome 5 Free-Solid-900.otf');
import TestSvg from './assets/test.svg';

const icons: React.FunctionComponent<{}> = () => {
  const rasterProps: RasterImageIconProps = { src: testImage };

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  const svgUriProps: SvgIconProps = {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
    viewBox: '0 0 100 100',
  };

  const fontProps: FontIconProps = {
    fontFamily: `Font Awesome 5 Free`,
    fontSrcFile: testTtf,
    codepoint: 0xf083,
    fontSize: 32,
  };

  return (
    <View>
      <Text>Font icon</Text>
      <Icon fontSource={fontProps} width={100} height={100} color="purple" />
      <Text>Svg icons</Text>
      <Icon svgSource={svgProps} width={100} height={100} color="yellow" />
      <Icon svgSource={svgUriProps} width={100} height={100} color="red" />
      <Text>Raster icon</Text>
      <Icon rasterImageSource={rasterProps} width={100} height={100} color="green" />
    </View>
  );
};

const iconSections: TestSection[] = [
  {
    name: 'Icon',
    testID: ICON_TESTPAGE,
    component: icons,
  },
];

export const IconTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Icons are styled images that can be fonts, svgs, or bitmaps';

  return <Test name="Icon Test" description={description} sections={iconSections} status={status}></Test>;
};
