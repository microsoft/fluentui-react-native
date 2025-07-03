/* eslint-disable @typescript-eslint/no-var-requires */
import type { MenuButtonItemProps } from '@fluentui/react-native';
import { MENU_ITEM_1_COMPONENT } from '@fluentui-react-native/e2e-testing';

import { svgProps, testImage } from '../Common/iconExamples';

export const menuItems: MenuButtonItemProps[] = [
  {
    itemKey: '1',
    text: 'MenuItem 1',
    icon: testImage,
    testID: MENU_ITEM_1_COMPONENT,
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
