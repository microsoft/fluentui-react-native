import { PersonaSize } from '../PersonaCoin';
import { TextStyle } from 'react-native';

export type FontAttributes = {
  fontFamily?: TextStyle['fontFamily'];
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
};

const textFontCache: { [key in PersonaSize]: FontAttributes } = {
  size8: { fontSize: 14, fontWeight: '500' },
  size24: { fontSize: 14, fontWeight: '500' },
  size32: { fontSize: 14, fontWeight: '500' },
  size40: { fontSize: 14, fontWeight: '500' },
  size48: { fontSize: 14, fontWeight: '500' },
  size56: { fontSize: 14, fontWeight: '500' },
  size72: { fontSize: 14, fontWeight: '500' },
  size100: { fontSize: 14, fontWeight: '500' },
  size120: { fontSize: 14, fontWeight: '500' }
};

const secondaryFontCache: { [key in PersonaSize]: FontAttributes } = {
  size8: { fontSize: 14, fontWeight: '500' },
  size24: { fontSize: 14, fontWeight: '500' },
  size32: { fontSize: 14, fontWeight: '500' },
  size40: { fontSize: 14, fontWeight: '500' },
  size48: { fontSize: 14, fontWeight: '500' },
  size56: { fontSize: 14, fontWeight: '500' },
  size72: { fontSize: 14, fontWeight: '500' },
  size100: { fontSize: 14, fontWeight: '500' },
  size120: { fontSize: 14, fontWeight: '500' }
};

const tertiaryFontCache: { [key in PersonaSize]: FontAttributes } = {
  size8: { fontSize: 14, fontWeight: '500' },
  size24: { fontSize: 14, fontWeight: '500' },
  size32: { fontSize: 14, fontWeight: '500' },
  size40: { fontSize: 14, fontWeight: '500' },
  size48: { fontSize: 14, fontWeight: '500' },
  size56: { fontSize: 14, fontWeight: '500' },
  size72: { fontSize: 14, fontWeight: '500' },
  size100: { fontSize: 14, fontWeight: '500' },
  size120: { fontSize: 14, fontWeight: '500' }
};

const optionalFontCache: { [key in PersonaSize]: FontAttributes } = {
  size8: { fontSize: 14, fontWeight: '500' },
  size24: { fontSize: 14, fontWeight: '500' },
  size32: { fontSize: 14, fontWeight: '500' },
  size40: { fontSize: 14, fontWeight: '500' },
  size48: { fontSize: 14, fontWeight: '500' },
  size56: { fontSize: 14, fontWeight: '500' },
  size72: { fontSize: 14, fontWeight: '500' },
  size100: { fontSize: 14, fontWeight: '500' },
  size120: { fontSize: 14, fontWeight: '500' }
};

export function getTextFont(size: PersonaSize): FontAttributes {
  return textFontCache[size];
}

export function getSecondaryFont(size: PersonaSize): FontAttributes {
  return secondaryFontCache[size];
}

export function getTertiaryFont(size: PersonaSize): FontAttributes {
  return tertiaryFontCache[size];
}

export function getOptionalFont(size: PersonaSize): FontAttributes {
  return optionalFontCache[size];
}
