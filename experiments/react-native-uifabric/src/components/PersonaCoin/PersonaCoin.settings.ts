import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { personaCoinName, IPersonaCoinType, PersonaSize, PersonaCoinColor } from './PersonaCoin.types';
import { getSizeConfig, convertCoinColor } from './PersonaCoin.helpers';

const defaultSizeConfig = getSizeConfig(PersonaSize.size40);

export const settings: IComposeSettings<IPersonaCoinType> = [
  {
    tokens: {
      horizontalIconAlignment: 'end',
      verticalIconAlignment: 'end',
      color: 'white',    // initials is always 'white', unless overriden by token
      initialsFontSize: defaultSizeConfig.initialsFontSize,
      coinSize: defaultSizeConfig.physicalCoinSize,
      iconSize: defaultSizeConfig.iconSize,
      backgroundColor: convertCoinColor(PersonaCoinColor.lightBlue)
    }
  },
  personaCoinName
];
