import { defaultFlexTokens } from '../flex/defaults/defaultTokens';
import { channelStatePriority } from './channelStatePriority';
import { functionalTypography } from './functionalTypography';
import { getRadiusStyleValue, getStrokeWidthStyleValue } from './geometryStyleValues';
import { resolveHoverMode } from './hoverMode';
import { interactiveStatePriority } from './interactiveStatePriority';

const { borderRadius, fontFamily, fontSize, fontWeight, lineHeight, strokeWidth } = defaultFlexTokens;

describe('functionalTypography', () => {
  it('paints the role with token line height and regular weight', () => {
    expect(functionalTypography(defaultFlexTokens, 'functionalBodySmall', { lineHeight: 'token', weight: 'regular' })).toEqual({
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    });
  });

  it('paints semibold weight', () => {
    expect(functionalTypography(defaultFlexTokens, 'functionalCaption', { lineHeight: 'token', weight: 'semibold' }).fontWeight).toBe(
      fontWeight.functionalSemibold,
    );
  });

  it.each(['omit', 'layout-only'] as const)('leaves line height out for %s', (mode) => {
    expect(functionalTypography(defaultFlexTokens, 'functionalBodyMedium', { lineHeight: mode, weight: 'regular' })).not.toHaveProperty(
      'lineHeight',
    );
  });

  it('leaves unowned weight out', () => {
    expect(functionalTypography(defaultFlexTokens, 'functionalBodyMedium', { lineHeight: 'omit', weight: 'unowned' })).toEqual({
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodyMedium,
    });
  });
});

describe('geometry style values', () => {
  it('resolves radius roles, scales, and none', () => {
    expect(getRadiusStyleValue(defaultFlexTokens, 'base300')).toBe(borderRadius.base300);
    expect(getRadiusStyleValue(defaultFlexTokens, 'none')).toBe(0);
    const scale = { small: 'base200', large: 'circular' } as const;
    expect(getRadiusStyleValue(defaultFlexTokens, scale, 'small')).toBe(borderRadius.base200);
    expect(getRadiusStyleValue(defaultFlexTokens, scale, 'large')).toBe(borderRadius.circular);
    expect(getRadiusStyleValue(defaultFlexTokens, 'base100', 'large')).toBe(borderRadius.base100);
  });

  it('resolves stroke width roles, scales, and none', () => {
    expect(getStrokeWidthStyleValue(defaultFlexTokens, 'thin')).toBe(strokeWidth.thin);
    expect(getStrokeWidthStyleValue(defaultFlexTokens, 'none')).toBe(0);
    const scale = { tint: 'none', outline: 'thick' } as const;
    expect(getStrokeWidthStyleValue(defaultFlexTokens, scale, 'tint')).toBe(0);
    expect(getStrokeWidthStyleValue(defaultFlexTokens, scale, 'outline')).toBe(strokeWidth.thick);
  });
});

describe('channelStatePriority', () => {
  it('selects interaction states only for interactive channels', () => {
    expect(channelStatePriority('interactive')).toBe(interactiveStatePriority);
    expect(channelStatePriority('rest')).toEqual(['disabled']);
  });
});

describe('resolveHoverMode', () => {
  it('prefers the appearance override and falls back to the base mode', () => {
    const hover = { base: 'enabled', byAppearance: { subtle: 'suppressed' } } as const;
    expect(resolveHoverMode<'primary' | 'subtle'>(hover, 'subtle')).toBe('suppressed');
    expect(resolveHoverMode<'primary' | 'subtle'>(hover, 'primary')).toBe('enabled');
    expect(resolveHoverMode({ base: 'component' })).toBe('component');
  });
});
