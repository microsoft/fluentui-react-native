import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { stackItemName, IStackItemType } from './StackItem.types';

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
