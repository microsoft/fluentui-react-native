import { contextualMenuName, IContextualMenuType } from './ContextualMenu.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IContextualMenuType> = [
  {
    tokens: {
      backgroundColor: 'bodyStandoutBackground',
      beakWidth: 20,
      borderColor: 'bodyFrameBackground',
      borderWidth: 1,
      directionalHint: 'bottonLeftEdge',
      gapSpace: 0,
      minPadding: 0
    },
    root: {
      accessibilityRole: 'menu'
    }
  },
  contextualMenuName
];
