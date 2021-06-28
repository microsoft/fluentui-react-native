import { contextualMenuName, ContextualMenuType } from './ContextualMenu.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ContextualMenuType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      beakWidth: 20,
      borderColor: 'buttonBorder',
      borderWidth: 1,
      directionalHint: 'bottonLeftEdge',
      gapSpace: 0,
      minPadding: 0,
    },
    root: {
      accessibilityRole: 'menu',
    },
    container: {
      style: {
        padding: 1,
      },
    },
  },
  contextualMenuName,
];
