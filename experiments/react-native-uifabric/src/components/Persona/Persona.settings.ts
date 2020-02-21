import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { IPersonaType, personaName } from './Persona.types';

export const settings: IComposeSettings<IPersonaType> = [
  {
    tokens: {
      horizontalGap: 16,
      verticalGap: 4
    }
  },
  personaName
];
