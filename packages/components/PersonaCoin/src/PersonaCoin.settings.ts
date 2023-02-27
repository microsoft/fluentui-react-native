import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import { convertCoinColorFluent } from './PersonaCoin.helpers';
import type { IPersonaCoinType } from './PersonaCoin.types';
import { personaCoinName } from './PersonaCoin.types';

export const settings: IComposeSettings<IPersonaCoinType> = [
  {
    tokens: {
      horizontalIconAlignment: 'end',
      verticalIconAlignment: 'end',
      color: 'white', // initials is always 'white', unless overriden by token
      iconStrokeColor: 'white', // icon stroke color is always 'white', unless overriden by token
      backgroundColor: convertCoinColorFluent('cornflower'),
    },
  },
  personaCoinName,
];
