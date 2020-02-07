import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { personaCoinName, IPersonaCoinType } from './PersonaCoin.types';

export const settings: IComposeSettings<IPersonaCoinType> = [
  {
    tokens: {
      horizontalIconAlignment: 'end',
      verticalIconAlignment: 'end'
    }
  },
  personaCoinName
];
