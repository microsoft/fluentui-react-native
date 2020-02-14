import { PersonaSize } from '../PersonaCoin';
import { TextStyle } from 'react-native';

export type FontAttributes = {
  fontFamily?: TextStyle['fontFamily'];
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
};

export function getTextFont(size: PersonaSize): FontAttributes {
  return {
    fontSize: 14,
    fontWeight: 'bold'
  };
}
