import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { IStackItemType } from './StackItem.types';
import { stackItemName } from './StackItem.types';

export const settings: IComposeSettings<IStackItemType> = [
  {
    root: {
      style: {
        width: 'auto',
      },
    },
  },
  stackItemName,
];
