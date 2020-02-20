import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { separatorName, ISeparatorType } from './Separator.types';

export const settings: IComposeSettings<ISeparatorType> = [
  {
    tokens: {
      separatorWidth: 1
    }
  },
  separatorName
];
