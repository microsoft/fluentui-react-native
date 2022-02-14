/* eslint-disable @typescript-eslint/no-var-requires */
import { MenuButtonItemProps } from '@fluentui/react-native';
import { SvgIconProps } from '@fluentui-react-native/icon';
export const testImage = require('../Button/icon_24x24.png');
import TestSvg from '../Button/test.svg';

const svgProps: SvgIconProps = {
  src: TestSvg,
  viewBox: '0 0 500 500',
};

export const menuItems: MenuButtonItemProps[] = [
  {
    itemKey: '1',
    text: 'MenuItem 1',
    icon: testImage,
  },
  {
    itemKey: '2',
    text: 'MenuItem 2',
  },
  {
    itemKey: '3',
    text: 'MenuItem 3',
    disabled: true,
  },
];

export const iconProps = { svgSource: svgProps, width: 12, height: 12 };
