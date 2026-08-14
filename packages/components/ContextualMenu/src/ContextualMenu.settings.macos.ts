import { I18nManager } from 'react-native';

import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { ContextualMenuType } from './ContextualMenu.types';
import { contextualMenuName } from './ContextualMenu.types';

export const settings: IComposeSettings<ContextualMenuType> = [
  {
    tokens: {
      directionalHint: I18nManager.isRTL ? 'bottomRightEdge' : 'bottomLeftEdge',
    },
    container: {
      style: {
        padding: 5,
      },
    },
  },
  contextualMenuName,
];
