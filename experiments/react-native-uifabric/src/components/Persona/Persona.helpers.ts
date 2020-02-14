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
    fontWeight: '500'
  };
}

export function getSecondaryFont(size: PersonaSize): FontAttributes {
  return {
    fontSize: 12,
    fontWeight: '400'
  };
}

export function getTertiaryFont(size: PersonaSize): FontAttributes {
  return {
    fontSize: 11,
    fontWeight: 'normal'
  };
}

export function getOptionalFont(size: PersonaSize): FontAttributes {
  return {
    fontSize: 10,
    fontWeight: 'normal'
  };
}
