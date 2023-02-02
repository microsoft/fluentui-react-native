import type { ContextualMenuType } from './ContextualMenu.types';
import { contextualMenuName } from './ContextualMenu.types';
import type { IComposeSettings } from '@uifabricshared/foundation-compose';
import { I18nManager } from 'react-native';

export const settings: IComposeSettings<ContextualMenuType> = [
  {
    tokens: {
      directionalHint: I18nManager.isRTL ? 'bottomRightEdge' : 'bottonLeftEdge',
    },
    container: {
      style: {
        padding: 5,
      },
    },
  },
  contextualMenuName,
];
