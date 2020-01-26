import { IPersonaCoinProps } from '../PersonaCoin/PersonaCoin.types';

export const personaName = 'RNFPersona';

export interface IPersonaProps extends IPersonaCoinProps {
  text?: string;
  secondaryText?: string;
  tertiaryText?: string;
  optionalText?: string;
}
