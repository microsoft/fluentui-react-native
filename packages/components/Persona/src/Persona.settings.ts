import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { IPersonaType, personaName } from './Persona.types';

export const settings: IComposeSettings<IPersonaType> = [
  {
    tokens: {
      verticalGap: 4,
    },
  },
  personaName,
];
