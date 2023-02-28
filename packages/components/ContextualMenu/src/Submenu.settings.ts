import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { SubmenuType } from './Submenu.types';
import { submenuName } from './Submenu.types';

export const settings: IComposeSettings<SubmenuType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      beakWidth: 20,
      borderColor: 'buttonBorder',
      borderWidth: 1,
      gapSpace: 0,
      minPadding: 0,
    },
    root: {
      accessibilityRole: 'menu',
      directionalHint: 'rightTopEdge',
    },
    container: {
      style: {
        padding: 1,
        minWidth: 180,
        flex: 1,
      },
    },
  },
  submenuName,
];
