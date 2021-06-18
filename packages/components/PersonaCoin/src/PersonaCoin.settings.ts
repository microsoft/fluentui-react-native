import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { personaCoinName, IPersonaCoinType } from './PersonaCoin.types';
import { convertCoinColor } from './PersonaCoin.helpers';

export const settings: IComposeSettings<IPersonaCoinType> = [
  {
    tokens: {
      horizontalIconAlignment: 'end',
      verticalIconAlignment: 'end',
      color: 'white', // initials is always 'white', unless overriden by token
      iconStrokeColor: 'white', // icon stroke color is always 'white', unless overriden by token
      backgroundColor: convertCoinColor('lightBlue'),
    },
  },
  personaCoinName,
];
