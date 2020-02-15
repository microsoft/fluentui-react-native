import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { personaCoinName, IPersonaCoinType, PersonaSize, PersonaCoinColor } from './PersonaCoin.types';
import { convertCoinColor } from './PersonaCoin.helpers';

export const defaultSize: PersonaSize = 'size40';
export const defaultColor: PersonaCoinColor = 'lightBlue';

export const settings: IComposeSettings<IPersonaCoinType> = [
  {
    tokens: {
      horizontalIconAlignment: 'end',
      verticalIconAlignment: 'end',
      color: 'white', // initials is always 'white', unless overriden by token
      // initialsSize: defaultSizeConfig.initialsSize,
      // coinSize: defaultSizeConfig.physicalSize,
      // iconSize: defaultSizeConfig.iconSize,
      backgroundColor: convertCoinColor('lightBlue')
    }
  },
  personaCoinName
];
