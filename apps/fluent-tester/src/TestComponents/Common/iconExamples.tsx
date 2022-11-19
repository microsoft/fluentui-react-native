import { Platform } from 'react-native';
import { SvgIconProps, FontIconProps, IconProps } from '@fluentui-react-native/icon';
import TestSvg from '../../../assets/test.svg';
import { useTheme } from '@fluentui-react-native/theme-types';

export const svgProps: SvgIconProps = {
  src: TestSvg,
  viewBox: '0 0 500 500',
};

export const commonIconProps: IconProps = { svgSource: svgProps };
// In some cases, android icons need a color explicitly passed to render. This hook gets an updated version of the props above with a color option.
export function useCommonIconProps(color?: string | { light: string; dark: string }): IconProps {
  const {
    host: { appearance },
  } = useTheme();
  const ret: IconProps = { svgSource: svgProps };
  if (color) {
    ret.color = typeof color === 'string' ? color : color[appearance];
  }
  return Platform.select({
    android: ret,
    default: commonIconProps,
  });
}

export const testTtf = require('./../../../../assets/Font_Awesome_900.otf');

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

export const testImage = require('./../../../assets/icon_24x24.png');
