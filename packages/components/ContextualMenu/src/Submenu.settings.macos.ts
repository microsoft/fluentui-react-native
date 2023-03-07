import { I18nManager } from 'react-native';

import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { SubmenuType } from './Submenu.types';
import { submenuName } from './Submenu.types';

export const settings: IComposeSettings<SubmenuType> = [
  {
    root: {
      accessibilityRole: 'menu',
      directionalHint: I18nManager.isRTL ? 'leftTopEdge' : 'rightTopEdge',
    },
    container: {
      style: {
        padding: 5,
        flex: 1,
      },
    },
  },
  submenuName,
];
