import { Platform } from 'react-native';
import { SvgIconProps, FontIconProps, IconProps } from '@fluentui-react-native/icon';
import TestSvg from '../../../assets/test.svg';

export const svgProps: SvgIconProps = {
  src: TestSvg,
  viewBox: '0 0 500 500',
};

export const iconProps: IconProps = { svgSource: svgProps };

export const testTtf = require('../../../assets/Font_Awesome_900.otf');

export const fontProps: FontIconProps = Platform.select({
  macos: {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 12,
  },
  default: {
    fontFamily: `Font Awesome 5 Free`,
    fontSrcFile: testTtf,
    codepoint: 0xf083,
    fontSize: 12,
  },
});

export const testImage = require('../../../assets/icon_24x24.png');
