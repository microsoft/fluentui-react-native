import { PersonaSize } from '@fluentui-react-native/persona-coin';
import { FontTokens } from '@fluentui-react-native/tokens';

type IPersonaFontTable = { [key in PersonaSize]: FontTokens };

const textFontTable: IPersonaFontTable = {
  size8: { fontSize: 'caption' },
  size24: { fontSize: 'secondary' },
  size32: { fontSize: 'secondary' },
  size40: { fontSize: 'secondary' },
  size48: { fontSize: 'secondary' },
  size56: { fontSize: 'subheader' },
  size72: { fontSize: 'subheader' },
  size100: { fontSize: 'subheader' },
  size120: { fontSize: 'subheader' },
};

const secondaryFontTable: IPersonaFontTable = {
  size8: { fontSize: 0 },
  size24: { fontSize: 0 },
  size32: { fontSize: 0 },
  size40: { fontSize: 'caption' },
  size48: { fontSize: 'caption' },
  size56: { fontSize: 'secondary' },
  size72: { fontSize: 'secondary' },
  size100: { fontSize: 'secondary' },
  size120: { fontSize: 'secondary' },
};

const tertiaryFontTable: IPersonaFontTable = {
  size8: { fontSize: 0 },
  size24: { fontSize: 0 },
  size32: { fontSize: 0 },
  size40: { fontSize: 0 },
  size48: { fontSize: 0 },
  size56: { fontSize: 0 },
  size72: { fontSize: 'secondary' },
  size100: { fontSize: 'secondary' },
  size120: { fontSize: 'secondary' },
};

const optionalFontTable: IPersonaFontTable = {
  size8: { fontSize: 0 },
  size24: { fontSize: 0 },
  size32: { fontSize: 0 },
  size40: { fontSize: 0 },
  size48: { fontSize: 0 },
  size56: { fontSize: 0 },
  size72: { fontSize: 0 },
  size100: { fontSize: 'secondary' },
  size120: { fontSize: 'secondary' },
};

export function getTextFont(size: PersonaSize): FontTokens {
  return textFontTable[size];
}

export function getSecondaryFont(size: PersonaSize): FontTokens {
  return secondaryFontTable[size];
}

export function getTertiaryFont(size: PersonaSize): FontTokens {
  return tertiaryFontTable[size];
}

export function getOptionalFont(size: PersonaSize): FontTokens {
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
  size120: 16,
};

export function getHorizontalGap(size: PersonaSize | undefined): number {
  return horizontalGapTable[size || 'size40'];
}
