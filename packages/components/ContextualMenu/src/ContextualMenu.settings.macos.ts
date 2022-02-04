import { contextualMenuName, ContextualMenuType } from './ContextualMenu.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
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
    scrollView: {
      contentContainerStyle: {
        flexDirection: 'column',
        flexGrow: 1,
      },
    },
  },
  contextualMenuName,
];
