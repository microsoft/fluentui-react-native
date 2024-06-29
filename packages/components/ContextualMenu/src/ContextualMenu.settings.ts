import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { ContextualMenuType } from './ContextualMenu.types';
import { contextualMenuName } from './ContextualMenu.types';

export const settings: IComposeSettings<ContextualMenuType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      beakWidth: 20,
      borderColor: 'buttonBorder',
      borderWidth: 1,
      directionalHint: 'bottomLeftEdge',
      gapSpace: 0,
      minPadding: 0,
    },
    container: {
      style: {
        padding: 1,
        minWidth: 180,
        flex: 1,
      },
    },
  },
  contextualMenuName,
];
