/* eslint-disable @typescript-eslint/no-var-requires */
import { MenuButtonItemProps } from '@fluentui/react-native';
import { testImage, svgProps } from '../Common/iconExamples';

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
