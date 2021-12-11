import { contextualMenuName, ContextualMenuType } from './ContextualMenu.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ContextualMenuType> = [
  {
    container: {
      style: {
        padding: 5,
      },
    },
  },
  contextualMenuName,
];
