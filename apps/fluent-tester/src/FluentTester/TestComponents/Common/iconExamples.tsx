import { Platform } from 'react-native';
import { SvgIconProps, FontIconProps } from '@fluentui-react-native/icon';
import TestSvg from '../Button/test.svg';

export const svgProps: SvgIconProps = {
  src: TestSvg,
  viewBox: '0 0 500 500',
};

const testTtf = require('../Button/Font Awesome 5 Free-Solid-900.otf');

export const fontProps: FontIconProps = Platform.select({
  macos: {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 32,
  },
  default: {
    fontFamily: `Font Awesome 5 Free`,
    fontSrcFile: testTtf,
    codepoint: 0xf083,
    fontSize: 12,
  },
});

export const testImage = require('../Button/icon_24x24.png');