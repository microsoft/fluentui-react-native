import { PersonaSize } from '../PersonaCoin';
import { ITextTokens } from '../../tokens';

type IPersonaFontTable = {
  [key in PersonaSize]: ITextTokens;
};

const textFontTable: IPersonaFontTable = {
  size8: { fontSize: 'small' },
  size24: { fontSize: 'medium' },
  size32: { fontSize: 'medium' },
  size40: { fontSize: 'medium' },
  size48: { fontSize: 'medium' },
  size56: { fontSize: 'xLarge' },
  size72: { fontSize: 'xLarge' },
  size100: { fontSize: 'xLarge' },
  size120: { fontSize: 'xLarge' }
};

const secondaryFontTable: IPersonaFontTable = {
  size8: { fontSize: 0 },
  size24: { fontSize: 0 },
  size32: { fontSize: 0 },
  size40: { fontSize: 'small' },
  size48: { fontSize: 'small' },
  size56: { fontSize: 'medium' },
  size72: { fontSize: 'medium' },
  size100: { fontSize: 'medium' },
  size120: { fontSize: 'medium' }
};

const tertiaryFontTable: IPersonaFontTable = {
  size8: { fontSize: 0 },
  size24: { fontSize: 0 },
  size32: { fontSize: 0 },
  size40: { fontSize: 0 },
  size48: { fontSize: 0 },
  size56: { fontSize: 0 },
  size72: { fontSize: 'medium' },
  size100: { fontSize: 'medium' },
  size120: { fontSize: 'medium' }
};

const optionalFontTable: IPersonaFontTable = {
  size8: { fontSize: 0 },
  size24: { fontSize: 0 },
  size32: { fontSize: 0 },
  size40: { fontSize: 0 },
  size48: { fontSize: 0 },
  size56: { fontSize: 0 },
  size72: { fontSize: 0 },
  size100: { fontSize: 'medium' },
  size120: { fontSize: 'medium' }
};

export function getTextFont(size: PersonaSize): ITextTokens {
  return textFontTable[size];
}

export function getSecondaryFont(size: PersonaSize): ITextTokens {
  return secondaryFontTable[size];
}

export function getTertiaryFont(size: PersonaSize): ITextTokens {
  return tertiaryFontTable[size];
}

export function getOptionalFont(size: PersonaSize): ITextTokens {
  return optionalFontTable[size];
}

const horizontalGapTable: { [P in PersonaSize]: number } = {
  size8: 17,
  size24: 8,
  size32: 8,
  size40: 12,
  size48: 12,
  size56: 16,
  size72: 16,
  size100: 16,
  size120: 16
};

export function getHorizontalGap(size: PersonaSize | undefined): number {
  return horizontalGapTable[size || 'size40'];
}
